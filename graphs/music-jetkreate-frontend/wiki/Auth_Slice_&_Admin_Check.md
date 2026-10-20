# Auth Slice & Admin Check

> 8 nodes

## Key Concepts

- **authSlice.ts** (15 connections) — `src/features/auth/authSlice.ts`
- **isCurrentUserAdmin()** (2 connections) — `src/features/auth/authSlice.ts`
- **authSlice** (2 connections) — `src/features/auth/authSlice.ts`
- **AuthState** (1 connections) — `src/features/auth/authSlice.ts`
- **readPersistedUser()** (1 connections) — `src/features/auth/authSlice.ts`
- **ADMIN_ACCOUNTS** (1 connections) — `src/features/auth/authSlice.ts`
- **initialState** (1 connections) — `src/features/auth/authSlice.ts`
- **persistedUser** (1 connections) — `src/features/auth/authSlice.ts`

## Relationships

- [Redux Store & Constants](Redux_Store_&_Constants.md) (2 shared connections)
- [Dashboard & Sidebar Navigation](Dashboard_&_Sidebar_Navigation.md) (2 shared connections)
- [Authentication & Firebase](Authentication_&_Firebase.md) (2 shared connections)
- [AI Service Layer](AI_Service_Layer.md) (1 shared connections)
- [App Bootstrap & Fetch Interceptor](App_Bootstrap_&_Fetch_Interceptor.md) (1 shared connections)

## Source Files

- `src/features/auth/authSlice.ts`

## Audit Trail

- EXTRACTED: 16 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*