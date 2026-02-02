# Codebase Improvement Plan

This document outlines specific findings and recommendations for improving the ragie-api-demo codebase, organized by priority.

---

## CRITICAL ISSUES (Must Fix)

### 1. Authentication Architecture Violation
**Issue**: The codebase uses Clerk + Firebase dual auth, but the requirement states "Must use Firebase Auth with Google, email/password, or email link providers."

**Files affected**:
- `src/app/layout.tsx` - Wraps app with ClerkProvider
- `src/components/Header.tsx` - Syncs Clerk → Firebase (lines 30-67)
- `src/proxy.ts` - Uses clerkMiddleware
- `src/zustand/useAuthStore.ts` - Stores both `uid` (Clerk) and `firebaseUid`

**Action**: Replace Clerk with Firebase Auth directly. This will:
- Meet the stated requirement
- Reduce complexity by ~40%
- Eliminate data duplication
- Remove race conditions in auth sync

---

### 2. Double-Spending Vulnerability in Credits System
**File**: `src/zustand/useProfileStore.ts` (lines 132-146)

**Issue**: The `useCredits()` function has a classic read-modify-write race condition:
```typescript
const profile = get().profile;
if (profile.credits < amount) return false;
const newCredits = profile.credits - amount;  // Race window here
await updateDoc(userRef, { credits: newCredits });
```

Two simultaneous requests can both pass the check and deduct from the same balance.

**Action**: Use Firestore transactions or `increment()` for atomic operations:
```typescript
await updateDoc(userRef, { credits: increment(-amount) });
```

---

### 3. Null Pointer Exception in Payment Sorting
**File**: `src/zustand/usePaymentsStore.ts` (lines 55, 111)

**Issue**: Sorting assumes `createdAt` is always present, but type allows `null`:
```typescript
payments.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
```

**Action**: Add null checks:
```typescript
payments.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
```

---

### 4. API Keys Stored in Firestore (Security Risk)
**Files**:
- `src/zustand/useProfileStore.ts` (lines 14-19)
- `firestore.rules` (line 18)

**Issue**: API keys (`ragie_api_key`, `openai_api_key`, etc.) are stored in Firestore user documents with full read/write access.

**Action**:
- Move API keys to backend environment variables only
- Use Cloud Functions to proxy API calls
- Remove API key fields from client-side profile

---

### 5. Missing Core Pages
**Issue**: Required pages don't exist:
- About page - MISSING
- Privacy Policy - MISSING
- Terms of Service - MISSING

**Files to create**:
- `src/app/about/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`

**Also update**:
- `src/components/Footer.tsx` - Currently just displays "RAG Demo" with no links
- `src/components/Header.tsx` - Add navigation links

---

### 6. Server Actions Missing Auth Protection
**Files**:
- `src/actions/uploadToRagie.ts` (lines 26, 61)
- `src/actions/retrieveChunks.ts` (lines 14, 28)
- `src/actions/generateActions.ts` (lines 88-89)

**Issue**: These actions get `userId` but don't call `auth.protect()`. They use `userId || "anonymous"` fallback.

**Action**: Add explicit protection:
```typescript
const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

---

## IMPORTANT ISSUES

### 7. Race Conditions in State Management

#### 7a. Auth State Race in Header.tsx
**File**: `src/components/Header.tsx` (lines 30-67)

**Issue**: `syncAuthState()` can run multiple times concurrently with no abort mechanism.

**Action**: Add AbortController and loading state:
```typescript
useEffect(() => {
  const controller = new AbortController();
  syncAuthState(controller.signal);
  return () => controller.abort();
}, [deps]);
```

#### 7b. Profile Fetch Overwrites Updates
**File**: `src/zustand/useProfileStore.ts` (lines 70-130)

**Issue**: If `updateProfile()` runs while `fetchProfile()` is in-flight, the fetch can overwrite local changes.

**Action**: Add optimistic update pattern with version checking.

---

### 8. Partial Failure in Payment Processing
**File**: `src/components/PaymentSuccessPage.tsx` (lines 39-82)

**Issue**: If `addPayment()` succeeds but `addCredits()` fails, user paid but didn't receive credits.

**Action**: Wrap in transaction or use Cloud Function for atomic payment processing.

---

### 9. File Upload Orphaning
**File**: `src/components/FileManagement.tsx` (lines 61-91)

**Issue**: If Firestore metadata save fails after Firebase Storage upload succeeds, file is orphaned (uploaded but not tracked).

**Action**: Implement rollback - delete storage file if metadata save fails.

---

### 10. Firebase Security Rules Need Strengthening
**Files**: `firestore.rules`, `storage.rules`

**Issues**:
- No field-level write validation (users can modify `isAdmin`, `isAllowed`, etc.)
- No file size limits in storage rules
- No file type validation
- Payment writes should be server-only

**Actions**:
```javascript
// firestore.rules - Add field validation
allow write: if isUser(uid)
  && !request.resource.data.diff(resource.data).affectedKeys()
    .hasAny(['isAdmin', 'isAllowed', 'premium']);

// storage.rules - Add size/type limits
allow write: if isUser(uid)
  && request.resource.size < 100 * 1024 * 1024
  && request.resource.contentType.matches('application/pdf|image/.*');
```

---

### 11. UI Consistency Issues

#### Button Styling Inconsistency
**Files affected**:
- `src/components/ProfileComponent.tsx` (lines 126, 150) - Uses `bg-blue-500 hover:opacity-50`
- `src/components/PaymentCheckoutPage.tsx` (line 105) - Uses `bg-black`
- `src/globals.css` (lines 74-81) - Defines `btn-primary` with `bg-blue-600`

**Action**: Standardize all buttons to use `btn-primary` class.

#### Error Display Inconsistency
- `QueryRetrieval.tsx`, `GenerateContent.tsx` - Use styled error boxes
- `PaymentCheckoutPage.tsx` - Uses plain `text-red-500`
- `PaymentsDisplay.tsx` - Uses plain `<div>Error: {error}</div>`
- `FileManagement.tsx` - Uses toast notifications

**Action**: Create `<ErrorMessage />` component for consistent error display.

#### Missing Loading States
- `authPending` in useAuthStore is defined but never used
- `PaymentsDisplay.tsx` shows "Loading payments..." plain text
- No skeleton loaders anywhere

**Action**: Implement consistent loading UI with spinners or skeletons.

---

### 12. Dead Code and Unused Dependencies

#### Unused Functions
**File**: `src/actions/generateActions.ts`
- `generateSummary()` (lines 60-69) - Never called
- `generateAnswer()` (lines 71-80) - Never called
- `generateFromRagie()` (lines 83-139) - Never called

**Action**: Remove these functions.

#### Unused Files
- `src/lib/ragie-client.ts` - Ragie SDK initialized but never imported

**Action**: Remove this file.

#### Unused Dependencies
**File**: `package.json`
- `ragie` package - Listed but SDK never used (raw fetch calls instead)

**Action**: Remove from dependencies.

---

## NICE-TO-HAVE IMPROVEMENTS

### 13. Structure & Organization

#### Missing Type Definitions Directory
Types are scattered across files:
- `ProfileType` in `useProfileStore.ts`
- `PaymentType` in `usePaymentsStore.ts`
- `Chunk` defined TWICE in `GenerateContent.tsx` and `QueryRetrieval.tsx`
- `DocumentData` in `FileManagement.tsx`

**Action**: Create `src/types/` directory with centralized exports.

#### Missing Index Files
No barrel exports exist for cleaner imports.

**Action**: Create index files:
- `src/zustand/index.ts`
- `src/actions/index.ts`
- `src/types/index.ts`
- `src/lib/index.ts`

#### Export Name Mismatches
- `src/components/FileManagement.tsx` exports `function Dashboard()` (line 26)
- `src/components/RagieMain.tsx` exports `function Home()` (line 9)

**Action**: Rename exports to match filenames.

#### Inconsistent Store Exports
- `useProfileStore` uses `export default`
- `useAuthStore` and `usePaymentsStore` use `export const`

**Action**: Standardize to named exports.

---

### 14. Single Responsibility Violations

#### FileManagement.tsx (253 lines)
Handles: Firebase upload, Firestore metadata, Ragie upload, UI rendering

**Action**: Split into:
- `<FileUploadDropzone />` - UI only
- `useFileUpload()` - Firebase logic
- `useRagieSync()` - Ragie logic
- `<DocumentsList />` - Display

#### Header.tsx (87 lines)
Handles: Auth sync, store init, navigation UI, profile setup

**Action**: Extract `useAuthSync()` hook.

#### PaymentSuccessPage.tsx (125 lines)
Handles: Payment validation, credit allocation, record storage, UI

**Action**: Extract `usePaymentValidation()` hook.

---

### 15. Simplification Opportunities

#### Remove useInitializeStores Hook
**File**: `src/zustand/useInitializeStores.ts`

Simple wrapper that could be called directly in Header.

**Action**: Remove and call `fetchProfile()` directly where needed.

#### Simplify Payment Store Duplicate Check
**File**: `src/zustand/usePaymentsStore.ts` (lines 66-87)

`addPayment()` queries for existing payment before insert. Stripe IDs are unique.

**Action**: Remove redundant check or use Firestore's `setDoc` with merge.

#### Reduce Console Logging
32 `console.log` statements across codebase, especially in `retrieveChunks.ts` (7 logs for one fetch).

**Action**: Remove or replace with proper logging service.

---

### 16. Missing Error Handling

#### Silent Auth Failures
**File**: `src/components/Header.tsx` (lines 55-58)

Auth errors only logged to console, no user notification.

**Action**: Add toast notification on auth failure.

#### No Fetch Timeouts
**Files**: `src/actions/uploadToRagie.ts`, `src/actions/retrieveChunks.ts`

Fetches can hang indefinitely.

**Action**: Add AbortController with timeout:
```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);
fetch(url, { signal: controller.signal });
```

#### Missing Input Validation
**Files**: `GenerateContent.tsx`, `QueryRetrieval.tsx`

Empty queries sent to Ragie API without validation.

**Action**: Add validation before API calls:
```typescript
if (!query?.trim()) {
  setError("Please enter a query");
  return;
}
```

---

## Summary Checklist

| Priority | Issue | Files | Status |
|----------|-------|-------|--------|
| CRITICAL | Replace Clerk with Firebase Auth | layout.tsx, Header.tsx, proxy.ts | ⬜ |
| CRITICAL | Fix credits double-spending | useProfileStore.ts | ⬜ |
| CRITICAL | Fix null pointer in payment sort | usePaymentsStore.ts | ⬜ |
| CRITICAL | Remove API keys from Firestore | useProfileStore.ts, firestore.rules | ⬜ |
| CRITICAL | Create About, Privacy, Terms pages | app/about, app/privacy, app/terms | ⬜ |
| CRITICAL | Add auth protection to server actions | uploadToRagie.ts, retrieveChunks.ts, generateActions.ts | ⬜ |
| IMPORTANT | Fix auth state race condition | Header.tsx | ⬜ |
| IMPORTANT | Fix profile fetch/update race | useProfileStore.ts | ⬜ |
| IMPORTANT | Fix partial payment failure | PaymentSuccessPage.tsx | ⬜ |
| IMPORTANT | Fix file upload orphaning | FileManagement.tsx | ⬜ |
| IMPORTANT | Strengthen Firebase rules | firestore.rules, storage.rules | ⬜ |
| IMPORTANT | Standardize UI components | Multiple | ⬜ |
| IMPORTANT | Remove dead code | generateActions.ts, ragie-client.ts | ⬜ |
| NICE | Create types directory | src/types/ | ⬜ |
| NICE | Add index files | src/*/index.ts | ⬜ |
| NICE | Fix export name mismatches | FileManagement.tsx, RagieMain.tsx | ⬜ |
| NICE | Split large components | FileManagement.tsx, Header.tsx, PaymentSuccessPage.tsx | ⬜ |
| NICE | Add input validation | GenerateContent.tsx, QueryRetrieval.tsx | ⬜ |
| NICE | Add fetch timeouts | uploadToRagie.ts, retrieveChunks.ts | ⬜ |
| NICE | Reduce console logging | Multiple | ⬜ |

---

*Generated by Claude Code analysis*
