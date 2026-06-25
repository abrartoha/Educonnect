## The Core Idea
A **honeypot field** is an invisible form input that:
- **Real users never see** (CSS-hidden, not display:none)
- **Bots always fill** (automated scripts blindly fill all inputs)
- **Rejection is silent** (don't tell the bot it was caught — it prevents them from improving the script)

## Client Side Code Sample

```jsx
import { useState } from 'react'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [website, setWebsite] = useState('') // honeypot field

  const handleSubmit = async () => {
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        website, // send honeypot value (empty for humans, filled for bots)
        // ...other fields
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
      
      {/* Honeypot field — hidden via CSS, not display:none */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Website" // appears empty to bots filling forms
        style={{
          position: 'absolute',
          left: '-9999px', // far off-screen
          opacity: '0',
          pointerEvents: 'none'
        }}
        tabIndex="-1" // don't tab to it
        autoComplete="off"
      />

      <button onClick={handleSubmit}>Sign Up</button>
    </div>
  )
}
```

## Server Side Code Sample

```js
router.post(
  '/auth/signup',
  timeCheck,
  uaSanity,
  emailValidator,
  honeyPotCheck,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);
```

## Full Flow

```
POST /api/auth/signup { email: "...", password: "...", website: "", ... }
│
└── honeyPotCheck middleware
    ├── read website field from body
    ├── is website field empty? (falsy)
    │   ├── YES ✅ proceed → real user
    │   └── NO (has value) → bot detected
    │
    └── if bot detected:
        └── return 200 OK silently
            (don't reveal the trap — helps bots improve their scripts)
```

## Why Silent Rejection?

Returning `200 OK` to bots is intentional. If you return `400` with "Honeypot detected", bot operators will:
- Read your error message
- Update their scraper to skip that field
- The honeypot stops working

**Silent acceptance = honey pot remains effective.**
