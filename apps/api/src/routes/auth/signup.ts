import { t } from "elysia";
import {
  authService,
  emailService,
  verificationTokenRepository,
} from "@/config/dependencies";
import type { CreateUserParams } from "@/types/auth";
import type { ExtendedContext } from "@/types/context";
import {
  ConflictError,
  createErrorResponse,
  createSuccessResponse,
} from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const signupHandler = async (
  context: ExtendedContext<CreateUserParams>
) => {
  const { body, set } = context;

  try {
    const user = await authService.createUser(body);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    verificationTokenRepository.create({
      id: crypto.randomUUID(),
      user_id: user.id,
      token,
      type: "email_verification",
      expires_at: expiresAt,
    });

    await emailService.sendVerificationEmail(user.email as string, token);

    set.status = 201;
    return createSuccessResponse({
      message: "Account created. Please verify your email to log in.",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    if (error instanceof ConflictError) {
      set.status = 409;
      return createErrorResponse(error.message, {
        code: "USER_ALREADY_EXISTS",
        details: [
          {
            field: error.field,
            message: error.message,
          },
        ],
      });
    }

    set.status = 400;
    return createErrorResponse("User creation failed", {
      code: "USER_CREATION_FAILED",
    });
  }
};

export const signupSchema = {
  body: t.Object({
    username: t.String({
      description: "The username for the new user",
      minLength: 3,
      maxLength: 50,
      pattern: "^[a-zA-Z0-9_]+$",
      examples: ["johndoe", "user123", "ai_enthusiast"],
    }),
    email: t.String({
      description: "The email address of the new user",
      format: "email",
      maxLength: 255,
      examples: ["john.doe@example.com", "user@test.com"],
    }),
    password: t.String({
      description:
        "Password (min 8 chars, must contain uppercase, lowercase, number, and special character)",
      minLength: 8,
      maxLength: 128,
      pattern:
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$',
      examples: ["MySecurePass123!", "Complex@Password456"],
    }),
    name: t.Optional(
      t.String({
        description: "The full name of the new user",
        maxLength: 100,
        examples: ["John Doe", "Jane Smith"],
      })
    ),
  }),
  detail: {
    summary: "User Signup",
    description: `
Create a new user account. The user will receive an email verification link.

**Rate Limit**: 5 requests per minute
**Response**: Returns user details and sends verification email
    `,
    tags: ["Authentication"],
    examples: [
      {
        summary: "Successful signup",
        description: "Create a new user account successfully",
        value: {
          username: "johndoe",
          email: "john.doe@example.com",
          password: "MySecurePass123!",
          name: "John Doe",
        },
      },
      {
        summary: "Signup with minimal data",
        description: "Create account with only required fields",
        value: {
          username: "user123",
          email: "user@test.com",
          password: "Password123!",
        },
      },
    ],
  },
  response: {
    201: createDataResponseSchema(
      t.Object({
        id: t.String({ description: "User ID" }),
        username: t.String({ description: "Username" }),
        email: t.String({ description: "Email address" }),
        name: t.Optional(t.Nullable(t.String({ description: "Full name" }))),
      })
    ),
    ...errorSchemas,
  },
};
