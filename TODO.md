# Improvement TODO List

Generated from code review. Items are ordered by priority.

---

## P0 — Security (Fix First)

- [x] **CloudBackup.js**: Replace raw-password AES with PBKDF2-derived key; use full SHA-256 subHash
- [x] **CloudBackupRestore.vue**: Password hash must use PBKDF2 + salt (not bare SHA-256 in localStorage)
- [x] **validateConfig.js**: Enable AJV `strict: true` mode
- [x] **Auth.js**: Guard against undefined hash when both `user.hash` and env var are missing
- [x] **Auth.js**: Fix Basic Auth colon-in-password ambiguity (`btoa` encoding)

## P1 — Critical Bugs

- [x] **router.js**: Fix race condition on login redirect — `await router.push()` before `next()`
- [x] **Section.vue**: Fix `effectiveColsSpan` falsy-return bug (`if (!cols) return cols`)
- [x] **ErrorHandler.js**: Cap sessionStorage error log size to prevent quota overflow
- [x] **ErrorHandler.js**: Add date to log timestamps (not just HH:MM:SS)
- [x] **ConfigAccumalator.js**: Surface parse errors to user via toast, not silent fallback

## P2 — Reliability

- [ ] **store.js**: Call `validateConfig()` before committing parsed YAML/JSON config
- [ ] **WidgetMixin.js**: Wrap `JSON.stringify(body)` in try/catch
- [ ] **Section.vue**: Debounce ResizeObserver callback
- [ ] **WidgetBase.vue**: Null-check `$refs` before calling widget methods

## P3 — Code Quality

- [ ] **Rename**: `ConfigAccumalator.js` → `ConfigAccumulator.js` and update all imports
- [ ] **WidgetBase.vue**: Extract COMPAT widget mapping to a `widgetRegistry.js` file
- [ ] **router.js**: Replace `confirm()` in edit-mode guard with async modal
- [ ] **store.js**: Extract `getLocalOrDefault(key, fallback)` helper for repeated getter pattern
- [ ] **router.js**: Memoize `isOauthCallback()` — computed once, not on every navigation
- [ ] **ConfigHelpers.js / ConfigAccumalator.js**: Use `structuredClone` instead of spread for config objects

## P4 — Developer Experience

- [ ] **JsonEditor.vue**: Add `beforeunload` warning for unsaved changes
- [ ] **CloudBackupRestore.vue**: Add password confirmation field on backup creation
- [ ] **.env**: Add security guidance section (note which `VITE_APP_*` vars are frontend-visible)
- [ ] **ErrorHandler.js**: Clear error logs older than 24 hours on init
- [ ] **WidgetBase.vue**: Add widget type validation against registry
