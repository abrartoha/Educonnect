## The Core Idea
A multi-layer email validation that:
1. **Format check** — validates email syntax using `validator.js`
2. **Disposable domain check** — rejects temporary email services (guerrillamail, 10minutemail, etc.)
3. **MX record lookup** — verifies the domain actually receives emails via DNS

This catches typos, fake emails, and non-existent domains before writing to the database.

## Server Side Code Sample

```js
router.post(
  '/auth/signup',
  timeCheck,
  uaSanity,
  emailValidator,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);
```

## Full Flow

```
POST /api/auth/signup { email: "user@example.com", ... }
│
└── emailValidator middleware
    │
    ├── Normalize email
    │   └── toLowerCase() + trim()
    │
    ├── Step 1: Format Validation
    │   ├── regex check: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    │   ├── PASS ✅ proceed to step 2
    │   └── FAIL ❌ return 400 "Invalid email format"
    │
    ├── Step 2: Disposable Domain Check
    │   ├── extract domain part: "example.com"
    │   ├── is in disposable-domains list?
    │   ├── YES ❌ return 400 "Disposable emails not allowed"
    │   └── NO ✅ proceed to step 3
    │
    ├── Step 3: MX Record DNS Lookup
    │   ├── dns.resolveMx("example.com")
    │   ├── records found? ✅ proceed
    │   └── NO ❌ return 400 "Email domain cannot receive emails"
    │
    ├── Attach normalized email to request
    │   └── req.normalizedEmail = "user@example.com"
    │
    └── next()
```