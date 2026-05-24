## The Core Idea
Checks the `User-Agent` header to filter out automated scripts, bots, and known malicious user agents. Real browsers always send a User-Agent; scripts often don't, or send suspicious ones.

## Server Side Code Sample

```js
router.post(
  '/auth/signup',
  timeCheck,
  uaSanity,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);
```

## Full Flow

```
POST /api/auth/signup
│
└── uaSanity middleware
    ├── read User-Agent header
    ├── is empty? ❌ reject (curl, wget, python scripts don't send UA)
    ├── matches blocked patterns? (/curl|python|scrapy|wget|bot/i)
    │   ├── YES ❌ reject with 400
    │   └── NO ✅ proceed
    └── next()
```

## Blocked Patterns
- `curl` — command-line HTTP client
- `python` — Python requests library
- `scrapy` — web scraper
- `wget` — download tool
- `bot` — generic bot string

---