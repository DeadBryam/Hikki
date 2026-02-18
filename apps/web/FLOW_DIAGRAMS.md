# Route Protection Flow Diagrams

## Request Flow - Unauthenticated User Accessing /chat

```
┌─────────────────────────────────────────────────────────────────┐
│ User navigates to /chat (no token in localStorage)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE (Server-Side) - middleware.ts                        │
├─────────────────────────────────────────────────────────────────┤
│ ✓ pathname = "/chat"                                            │
│ ✓ isProtectedRoute("/chat") = true                              │
│ ✓ token = request.cookies.get("auth_token") = null             │
│ ✓ !token && isProtectedRoute("/chat") = true                    │
│                                                                  │
│ → NextResponse.redirect(new URL("/auth/login", request.url))   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Browser receives 307 redirect response                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Browser navigates to /auth/login                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Login page renders, user enters credentials                     │
│                                                                  │
│ ✅ RESULT: User cannot access /chat, forced to login            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow - Login and Access Protected Route

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User submits login form at /auth/login                       │
│    • username: "john_doe"                                       │
│    • password: "SecurePass123!"                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. authService.login() called                                   │
│    └─ POST /api/v1/auth/login with credentials                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend validates credentials                                │
│    ✓ Username exists                                            │
│    ✓ Password matches                                           │
│    ✓ Email verified                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend response                                              │
│    {                                                             │
│      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",                │
│      "user": {                                                   │
│        "id": "user_123",                                         │
│        "username": "john_doe",                                   │
│        "email": "john@example.com",                             │
│        "emailVerified": true                                     │
│      }                                                           │
│    }                                                             │
│                                                                  │
│    HTTP Headers:                                                 │
│    Set-Cookie: auth_token=eyJhbGc...; HttpOnly; Secure;SameSite│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Client-side (lib/services/auth-service.ts)                  │
│    ✓ const result = await response.json()                       │
│    ✓ localStorage.setItem("auth_token", result.token)           │
│    ✓ return result to component                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Component (app/auth/login/page.tsx)                          │
│    ✓ authStore.setUser(user)                                    │
│    ✓ authStore.setToken(token)                                  │
│    ✓ router.push("/chat")                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Browser navigates to /chat                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE (Server-Side) - middleware.ts                        │
├─────────────────────────────────────────────────────────────────┤
│ ✓ pathname = "/chat"                                            │
│ ✓ isProtectedRoute("/chat") = true                              │
│ ✓ token = request.cookies.get("auth_token") = "eyJhbGc..."    │
│ ✓ token && isProtectedRoute("/chat") = true                     │
│                                                                  │
│ → NextResponse.next() (Allow request to continue)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. /chat page renders (app/(protected)/chat/page.tsx)           │
│                                                                  │
│ ✓ AuthGuard in (protected)/layout.tsx checks isAuthenticated    │
│ ✓ authStore.isAuthenticated = true                              │
│ ✓ Children render (ChatContent)                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. ✅ USER CAN ACCESS /CHAT                                      │
│    • Token in cookies (server)                                   │
│    • Token in localStorage (client)                              │
│    • Token in authStore (state)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page Refresh Flow - Session Persistence

```
┌─────────────────────────────────────────────────────────────────┐
│ User is on /chat and presses F5 (page refresh)                 │
│ Browser sends GET /chat request to server                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE (Server-Side) - middleware.ts                        │
├─────────────────────────────────────────────────────────────────┤
│ ✓ pathname = "/chat"                                            │
│ ✓ token = request.cookies.get("auth_token") = "eyJhbGc..."    │
│ ✓ Protected route + token present → Allow                       │
│                                                                  │
│ → NextResponse.next()                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Page loads, browser runs JavaScript                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ app/layout.tsx renders                                          │
│ └─ RootLayout component mounts                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ <AuthProvider> mounts (lib/providers/auth-provider.tsx)         │
│                                                                  │
│ ✓ useEffect(() => {                                             │
│     setIsHydrated(true)                                         │
│     initializeFromStorage()                                     │
│   }, [])                                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ initializeFromStorage() called                                  │
│ └─ (from lib/stores/auth-store.ts)                              │
│                                                                  │
│ ✓ if (typeof window === "undefined") return                     │
│ ✓ const token = localStorage.getItem("auth_token")              │
│ ✓ token = "eyJhbGc..."                                          │
│ ✓ set({ token }) ← Updates authStore                            │
│                                                                  │
│ authStore.token = "eyJhbGc..."                                  │
│ authStore.isAuthenticated = true                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AuthProvider renders children (all routes)                      │
│ QueryProvider wraps children                                    │
│ App layout renders                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ app/(protected)/layout.tsx renders                              │
│ └─ <AuthGuard> mounts                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AuthGuard checks authentication                                 │
│                                                                  │
│ ✓ const { isAuthenticated, isLoading } = useAuth()             │
│ ✓ isAuthenticated = true (from authStore)                       │
│ ✓ isLoading = false                                             │
│                                                                  │
│ ✓ if (isAuthenticated) return <>{children}</> ✅               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ChatPage component renders                                      │
│                                                                  │
│ ✅ USER STAYS ON /CHAT                                           │
│    No redirect, session preserved                               │
│    Token still valid in both storage locations                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User clicks "Logout" button in /chat                            │
│ onClick={() => authStore.logout()}                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ authStore.logout() called (lib/stores/auth-store.ts)            │
│                                                                  │
│ ✓ set({ isLoading: true, error: null })                         │
│                                                                  │
│ try {                                                            │
│   await authService.logout()                                     │
│   set({ user: null, token: null, isLoading: false })            │
│ } catch (error) {                                                │
│   set({...})  // Still clear token even if error                │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ authService.logout() called (lib/services/auth-service.ts)      │
│                                                                  │
│ ✓ const token = localStorage.getItem("auth_token")              │
│ ✓ POST /api/v1/auth/logout with Authorization header            │
│   Authorization: Bearer eyJhbGc...                              │
│                                                                  │
│ ✓ localStorage.removeItem("auth_token")                         │
│                                                                  │
│ return { success: true }                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend (API) handles logout                                    │
│                                                                  │
│ ✓ Validates token                                                │
│ ✓ Invalidates session/token in database                          │
│ ✓ Response: 200 OK + Set-Cookie: auth_token=; Max-Age=0        │
│   (Clears cookie)                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Client updates state:                                            │
│                                                                  │
│ authStore:                                                       │
│   ✓ token = null                                                 │
│   ✓ user = null                                                  │
│   ✓ isAuthenticated = false                                      │
│                                                                  │
│ localStorage:                                                    │
│   ✓ "auth_token" removed                                         │
│                                                                  │
│ Cookies:                                                         │
│   ✓ auth_token cleared (Max-Age=0)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Component detects isAuthenticated = false                       │
│                                                                  │
│ ✓ useRouter.push("/auth/login") ← From logout action          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Browser navigates to /auth/login                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ✅ USER LOGGED OUT                                               │
│    • Token cleared from all storage (localStorage + cookies)    │
│    • Auth state reset                                            │
│    • Session invalidated                                         │
│    • Redirected to login page                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Token Validation at Each Layer

```
REQUEST → /chat
    │
    ├─────────────────────────────────────────
    │ LAYER 1: MIDDLEWARE (Server-Side)
    │
    │ Where: middleware.ts
    │ When: Before any JavaScript executes
    │ What: request.cookies.get("auth_token")
    │ Decision: token exists?
    │   YES → NextResponse.next() (pass through)
    │   NO  → NextResponse.redirect("/auth/login")
    │
    ├─────────────────────────────────────────
    │ LAYER 2: AUTH PROVIDER (App Mount)
    │
    │ Where: lib/providers/auth-provider.tsx
    │ When: On component mount
    │ What: localStorage.getItem("auth_token")
    │ Decision: restore token to authStore
    │   ✓ Prevents hydration mismatch
    │   ✓ Syncs client state
    │
    ├─────────────────────────────────────────
    │ LAYER 3: AUTH GUARD (Layout)
    │
    │ Where: components/auth-guard.tsx
    │ When: Before rendering layout children
    │ What: const { isAuthenticated } = useAuth()
    │ Decision: isAuthenticated?
    │   YES → Render children
    │   NO  → Show spinner → redirect("/auth/login")
    │
    ├─────────────────────────────────────────
    │ LAYER 4: PAGE HOOK (Optional)
    │
    │ Where: lib/hooks/use-protected-route.ts
    │ When: In page component
    │ What: useAuth() + useRouter
    │ Decision: Custom per-page checks
    │   ✓ Additional verification
    │   ✓ Page-specific logic
    │
    └─────────────────────────────────────────

RESULT: Multiple defensive layers ensure protection
```

---

## Token Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│ LOGIN EVENT                                          │
│ User submits credentials at /auth/login              │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ POST /api/v1/auth/login { username, password }       │
│ (via lib/services/auth-service.ts)                   │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ BACKEND VALIDATION & RESPONSE                        │
│ ✓ Validate credentials                               │
│ ✓ Create session/token                               │
│ ✓ Response body: { token, user }                     │
│ ✓ Set-Cookie: auth_token=xxx; HttpOnly; Secure      │
└──────────────────────────────────────────────────────┘
           ↓
        ╔════════════════════════════════════════════╗
        ║            TOKEN SPLITS TO 3 PATHS        ║
        ╚════════════════════════════════════════════╝
           ↓
     ┌─────────────────┐
     │ localStorage    │
     │ (Client)        │
     │                 │
     │ Key:            │
     │ auth_token      │
     │                 │
     │ Use: Component  │
     │ state restore   │
     │                 │
     │ Persist: ✅    │
     │ Secure: ⭐⭐   │
     └─────────────────┘
           ↓
     ┌─────────────────┐
     │ Cookies         │
     │ (Server)        │
     │                 │
     │ Key:            │
     │ auth_token      │
     │                 │
     │ Use: Middleware │
     │ verification    │
     │                 │
     │ Persist: ✅    │
     │ Secure: ⭐⭐⭐ │
     └─────────────────┘
           ↓
     ┌─────────────────┐
     │ Authorization   │
     │ Header          │
     │ (API)           │
     │                 │
     │ Format:         │
     │ Bearer <token>  │
     │                 │
     │ Use: API auth   │
     │                 │
     │ Persist: ❌    │
     │ Secure: ⭐⭐⭐ │
     └─────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ AUTHENTICATED REQUESTS                               │
│                                                      │
│ GET /api/user/profile                                │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...       │
│ Cookie: auth_token=eyJhbGciOiJIUzI1NiIs...         │
│                                                      │
│ Backend validates BOTH and returns user data        │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ LOGOUT EVENT                                         │
│ Token cleared from:                                  │
│ ✓ localStorage.removeItem("auth_token")              │
│ ✓ Cookies (Set-Cookie: auth_token=; Max-Age=0)      │
│ ✓ authStore.token = null                            │
│                                                      │
│ All 3 sources now empty → User logged out ✅         │
└──────────────────────────────────────────────────────┘
```

---

**Last Updated**: February 17, 2025
