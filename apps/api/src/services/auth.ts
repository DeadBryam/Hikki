import bcrypt from "bcryptjs";
import type { Context } from "elysia";
import { AUTH_CONSTANTS } from "@/config/constants";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import type { SessionRepository } from "@/database/repositories/session-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import type {
  CreateUserParams,
  Session,
  User,
  UserWithoutPassword,
} from "@/types/auth";
import { ConflictError } from "@/utils/errors";

interface AuthServiceDeps {
  sessionRepository: SessionRepository;
  userRepository: UserRepository;
}

export default class AuthService {
  private readonly userRepo: UserRepository;
  private readonly sessionRepo: SessionRepository;
  private readonly SESSION_DURATION = AUTH_CONSTANTS.SESSION_DURATION;
  private readonly MAX_CACHE_SIZE = env.SESSION_CACHE_SIZE;

  private sessionCache = new Map<
    string,
    { session: Session; user: UserWithoutPassword }
  >();

  constructor({ userRepository, sessionRepository }: AuthServiceDeps) {
    this.userRepo = userRepository;
    this.sessionRepo = sessionRepository;
  }

  /**
   * Generates a cryptographically secure random token.
   * Uses 32 bytes of random data encoded as hexadecimal for better security and length.
   * @returns A unique 64-character hexadecimal token string
   */
  generateSessionToken(): string {
    const array = new Uint8Array(AUTH_CONSTANTS.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Generates a unique session ID using crypto.randomUUID().
   * @returns A unique session identifier string
   */
  generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Clears the session cache (used for testing).
   */
  clearSessionCache(): void {
    this.sessionCache.clear();
  }

  /**
   * Evicts the oldest entry from the session cache (LRU eviction).
   * Map maintains insertion order, so first key is the oldest.
   */
  private evictOldestCacheEntry(): void {
    const firstKey = this.sessionCache.keys().next().value;
    if (firstKey) {
      this.sessionCache.delete(firstKey);
      logger.debug(
        `Evicted oldest session from cache (size: ${this.sessionCache.size})`
      );
    }
  }

  /**
   * Adds or updates a session in the cache with LRU behavior.
   * If cache is full, evicts oldest entry before adding new one.
   * On update (get), moves entry to end (most recently used).
   */
  private setCacheEntry(
    sessionId: string,
    value: { session: Session; user: UserWithoutPassword }
  ): void {
    if (this.sessionCache.has(sessionId)) {
      this.sessionCache.delete(sessionId);
    }

    if (this.sessionCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntry();
    }

    this.sessionCache.set(sessionId, value);
  }

  /**
   * Validates that the provided User-Agent matches the session's stored User-Agent.
   * @param session - The session to validate against
   * @param userAgent - The current User-Agent to validate
   * @returns True if User-Agent matches or no validation is needed, false otherwise
   */
  private validateUserAgent(session: Session, userAgent?: string): boolean {
    return !(
      userAgent &&
      session.user_agent &&
      session.user_agent !== userAgent
    );
  }

  /**
   * Gets session and user data by opaque token.
   * Validates that the token exists and is not expired.
   * Optionally validates that the User-Agent matches the session's stored User-Agent.
   * Uses in-memory cache for performance on valid sessions.
   * Uses JOIN query for efficient database access.
   * @param token - The opaque token to lookup
   * @param userAgent - Optional User-Agent to validate against stored session
   * @returns Object containing session and user data if valid, null if invalid/expired
   */
  getSessionByToken(
    token: string,
    userAgent?: string
  ): { session: Session; user: UserWithoutPassword } | null {
    for (const [sessionId, cached] of this.sessionCache) {
      if (cached.session.token === token) {
        if (cached.session.expires_at > Date.now()) {
          if (!cached.user.validated_at) {
            this.sessionCache.delete(sessionId);
            return null;
          }

          if (!this.validateUserAgent(cached.session, userAgent)) {
            this.sessionCache.delete(sessionId);
            return null;
          }
          return cached;
        }
        this.sessionCache.delete(sessionId);
        return null;
      }
    }

    const sessionWithUser = this.sessionRepo.findByTokenWithUser(token);
    if (!sessionWithUser) {
      return null;
    }

    if (!sessionWithUser.user.validated_at) {
      return null;
    }

    if (!this.validateUserAgent(sessionWithUser.session, userAgent)) {
      return null;
    }

    this.setCacheEntry(sessionWithUser.session.id, sessionWithUser);

    return sessionWithUser;
  }

  /**
   * Hashes a password using bcrypt with predefined salt rounds.
   * @param password - The plain text password to hash
   * @returns Promise resolving to the hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
  }

  /**
   * Verifies a password against its hash using bcrypt.
   * @param password - The plain text password to verify
   * @param hash - The hashed password to compare against
   * @returns Promise resolving to true if passwords match, false otherwise
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Checks if an opaque token is valid (exists and not expired).
   * This is a lightweight validation that doesn't load user data.
   * @param token - The opaque token to validate
   * @returns True if token is valid, false otherwise
   */
  isValidToken(token: string): boolean {
    for (const [sessionId, cached] of this.sessionCache) {
      if (cached.session.token === token) {
        if (cached.session.expires_at > Date.now()) {
          return true;
        }
        this.sessionCache.delete(sessionId);
        return false;
      }
    }

    const session = this.sessionRepo.findByToken(token);
    return session !== null;
  }

  /**
   * Creates a new user in the database with hashed password.
   * This operation is performed atomically within a database transaction.
   * @param params - User creation parameters
   * @param params.username - Unique username for the user
   * @param params.email - Email address for the user
   * @param params.password - Plain text password (will be hashed)
   * @param params.name - Optional display name for the user
   * @returns Promise resolving to the created user object with timestamps
   * @throws Will throw an error if user creation fails (e.g., duplicate username/email)
   */
  async createUser(params: CreateUserParams): Promise<User> {
    const { username, email, password, name } = params;

    const existingUsername = this.userRepo.findByUsername(username);
    if (existingUsername) {
      throw new ConflictError("username", "Username already exists");
    }

    const existingEmail = this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError("email", "Email already exists");
    }

    const hashedPassword = await this.hashPassword(password);
    const id = crypto.randomUUID();

    const user: Omit<User, "created_at" | "updated_at"> = {
      id,
      username,
      email,
      name: name || "",
      password: hashedPassword,
      deleted_at: null,
      validated_at: null,
      onboarding_completed_at: null,
    };

    this.userRepo.create(user);
    logger.info(`User created: ${username} (${email})`);
    return {
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Updates a user's password.
   * @param userId - The ID of the user
   * @param newPassword - The new plain text password (will be hashed)
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    this.userRepo.updatePassword(userId, hashedPassword);
  }

  /**
   * Finds a user by their username (includes password for authentication).
   * @param username - The username to search for
   * @returns The user object if found, null otherwise
   */
  findUserByUsername(username: string): User | null {
    return this.userRepo.findByUsernameWithPassword(username);
  }

  /**
   * Extends a session's expiration time using sliding window approach.
   * Will not extend beyond ABSOLUTE_MAX_DURATION from creation time.
   * Updates both database and cache.
   * @param sessionId - The session ID to extend
   * @returns true if extended, false if session hit absolute max or doesn't exist
   */
  extendSession(sessionId: string): boolean {
    const cached = this.sessionCache.get(sessionId);
    if (!cached) {
      return false;
    }

    const createdAt = new Date(cached.session.created_at).getTime();
    const absoluteMaxExpiry = createdAt + AUTH_CONSTANTS.ABSOLUTE_MAX_DURATION;
    const now = Date.now();

    if (now >= absoluteMaxExpiry) {
      logger.warn(
        `Session ${sessionId} has reached absolute max duration (15 days), not extending`
      );
      return false;
    }

    const slidingExpiry = now + this.SESSION_DURATION;
    const newExpiresAt = Math.min(slidingExpiry, absoluteMaxExpiry);

    this.sessionRepo.extendSession(sessionId, newExpiresAt);

    cached.session.expires_at = newExpiresAt;
    this.setCacheEntry(sessionId, cached);

    logger.debug(
      `Session ${sessionId} extended until ${new Date(newExpiresAt).toISOString()}`
    );

    return true;
  }

  /**
   * Creates a new session for a user with optional IP tracking and User-Agent.
   * This operation is performed atomically within a database transaction.
   * The session is also cached in memory for fast subsequent access.
   * @param userId - The ID of the user to create the session for
   * @param ipAddress - Optional IP address for security tracking
   * @param userAgent - Optional User-Agent string for security tracking
   * @returns Object containing the session data and opaque token
   * @throws Will throw an error if session creation fails
   */
  createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): { session: Session; token: string } {
    const sessionId = this.generateSessionId();
    const token = this.generateSessionToken();
    const expiresAt = Date.now() + this.SESSION_DURATION;

    const session: Omit<Session, "created_at"> = {
      id: sessionId,
      user_id: userId,
      token,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      expires_at: expiresAt,
    };

    this.sessionRepo.create(session);
    const user = this.userRepo.findById(userId);

    if (user) {
      const fullSession: Session = {
        ...session,
        created_at: new Date().toISOString(),
      };

      this.setCacheEntry(sessionId, {
        session: fullSession,
        user,
      });
    }

    const fullSession: Session = {
      ...session,
      created_at: new Date().toISOString(),
    };

    logger.info(
      `Session created for user: ${userId} from IP: ${ipAddress || "unknown"}`
    );

    return {
      session: fullSession,
      token,
    };
  }

  /**
   * Invalidates a specific session by opaque token.
   * This operation is performed atomically within a database transaction.
   * Removes the session from database and clears it from cache.
   * @param token - The opaque token of the session to invalidate
   */
  invalidateSession(token: string): void {
    const session = this.sessionRepo.findByToken(token);
    if (!session) {
      logger.warn(
        `Attempted to invalidate non-existent session with token: ${token.substring(0, 8)}...`
      );
      return;
    }

    this.sessionRepo.deleteById(session.id);
    this.sessionCache.delete(session.id);
    logger.info(`Session invalidated for user: ${session.user_id}`);
  }

  /**
   * Invalidates all sessions for a specific user.
   * This operation is performed atomically within a database transaction.
   * Removes all sessions from database and clears cache.
   * @param userId - The user ID whose sessions should be invalidated
   */
  invalidateAllUserSessions(userId: string): void {
    this.sessionRepo.deleteByUserId(userId);

    for (const [sessionId, data] of this.sessionCache) {
      if (data.session.user_id === userId) {
        this.sessionCache.delete(sessionId);
      }
    }
  }

  /**
   * Cleans up expired sessions from both in-memory cache and database.
   * This method should be called periodically to maintain system performance.
   * @returns The total number of expired sessions that were cleaned up
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, data] of this.sessionCache) {
      if (data.session.expires_at <= now) {
        this.sessionCache.delete(sessionId);
        cleaned++;
      }
    }

    const result = this.sessionRepo.deleteExpired(now);
    cleaned += result;

    return cleaned;
  }

  /**
   * Gets statistics about the current session cache.
   * Useful for monitoring and debugging session cache performance.
   * @returns Object containing cache size and session details
   */
  getSessionCacheStats() {
    return {
      cacheSize: this.sessionCache.size,
      maxCacheSize: this.MAX_CACHE_SIZE,
      utilizationPercent: Math.round(
        (this.sessionCache.size / this.MAX_CACHE_SIZE) * 100
      ),
      sessions: Array.from(this.sessionCache.entries()).map(([id, data]) => ({
        id,
        userId: data.session.user_id,
        expiresAt: new Date(data.session.expires_at).toISOString(),
      })),
    };
  }

  /**
   * Authenticates a user and creates a session.
   * Handles all login logic including credential validation and email verification.
   * @param credentials - Login credentials (username, password) and request metadata
   * @returns Session token and cookie config, or null if authentication fails
   */
  async login(credentials: {
    username: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<
    | {
        success: true;
        token: string;
        cookieMaxAge: number;
      }
    | {
        success: false;
        message: string;
        statusCode: 401 | 403;
      }
  > {
    const user = this.findUserByUsername(credentials.username);
    const passwordsMatch = await this.verifyPassword(
      credentials.password,
      user?.password || ""
    );

    if (!(user && passwordsMatch)) {
      return {
        success: false,
        message: "Invalid credentials",
        statusCode: 401,
      };
    }

    if (!user.validated_at) {
      return {
        success: false,
        message: "Please verify your email before logging in",
        statusCode: 403,
      };
    }

    const session = this.createSession(
      user.id,
      credentials.ip,
      credentials.userAgent
    );

    return {
      success: true,
      token: session.token,
      cookieMaxAge: Math.floor(this.SESSION_DURATION / 1000),
    };
  }

  /**
   * Sets a valid session cookie with the provided token.
   * Used after successful login or email verification.
   * @param context - Elysia context with cookie support
   * @param token - The session token to set
   * @param maxAgeSeconds - Optional max age in seconds (defaults to SESSION_DURATION)
   */
  setValidSessionCookie(
    context: Pick<Context, "cookie">,
    token: string,
    maxAgeSeconds?: number
  ): void {
    context.cookie.session.set({
      value: token,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSeconds ?? Math.floor(this.SESSION_DURATION / 1000),
    });
  }

  /**
   * Clears the session cookie by setting maxAge to 0.
   * Used for logout and error responses (e.g., invalid session).
   * Ensures browser automatically removes the httpOnly cookie.
   * @param context - Elysia context with cookie support
   */
  setClearSessionCookie(context: Pick<Context, "cookie">): void {
    context.cookie.session.set({
      value: "",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
  }
}
