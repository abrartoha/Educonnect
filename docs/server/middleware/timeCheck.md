## The Core Idea
The frontend fetch `formToken` **when the form was loaded**, then sends that timestamp to the backend on submit form data. The backend validate and calculates how much time passed.

## Client Side Code Sample

```jsx
import { useState, useEffect, useRef } from 'react'

export default function SignupForm() {
  const [formToken, setFormToken] = useState(null)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')

  // Fetch signed token from backend when form mounts
  useEffect(() => {
    const fetchFormToken = async () => {
      const res  = await fetch('/api/auth/form-token') // GET request
      const data = await res.json()
      setFormToken(data.token) // "1715000000000.a3f8c2d..."
    }

    fetchFormToken()
  }, [])

  const handleSubmit = async () => {
    if (!formToken) return // token not loaded yet

    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        formToken, // ← send the signed token, not raw timestamp
        // ...honeypot, cfToken etc
      })
    })
  }

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSubmit}>Sign Up</button>
    </div>
  )
}
```

## Server Side Code Sample

```js
router.post(
  '/login',
  timeCheck,
  validate({ body: loginSchema }),
  asyncHandler(login)
);
```

## Full Flow

```
Form mounts
│
├── GET /api/auth/form-token
│   └── server returns "token" : "1715000000000.a3f8c2..."
│   └── server create redis entry
│
├── User fills form (takes 8 seconds)
│
├── POST /api/auth/signup { formToken: "1715000000000.a3f8c2...", ...formData }
│   │
│   └── timeCheck middleware
│       ├── split token → timestamp + hmac
│       ├── recompute hmac with secret
│       ├── compare → match? ✅ proceed
│       ├── check redis entry → exist? ✅ proceed
│       ├── check timeSpent → !bot ✅ proceed
│       └── next()
```