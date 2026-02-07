# Quick Termii Setup Instructions

## Your Termii Credentials:
- **API Key:** `TLuYowcKxeVWjncySOiLCOVspmvOTtPGZrZXhUHJPYfLACxpvDvqeCPwOiTFyZ`
- **Base URL:** `https://v3.api.termii.com` (already configured in code)

---

## Steps to Add Termii API Key:

### 1. Open your `.env` file
Location: `c:\Users\Michael\cascade\backend\.env`

If it doesn't exist, copy from example:
```bash
cd c:\Users\Michael\cascade\backend
copy .env.example .env
```

### 2. Find this section in `.env`:
```env
# Termii (Nigerian SMS Provider)
TERMII_API_KEY="your_termii_api_key_here"
TERMII_SENDER_ID="Fulccrum"
```

### 3. Replace with:
```env
# Termii (Nigerian SMS Provider)
TERMII_API_KEY="TLuYowcKxeVWjncySOiLCOVspmvOTtPGZrZXhUHJPYfLACxpvDvqeCPwOiTFyZ"
TERMII_SENDER_ID="Fulccrum"
```

### 4. Save the file

### 5. Restart your server:
```bash
npm run start:dev
```

---

## Test SMS After Setup:

```bash
POST http://localhost:3001/notifications/sms
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "to": "+2348012345678",
  "message": "Test SMS from Fulccrum!"
}
```

---

**That's it! Your Termii SMS integration will be live! 📱✅**

Delete this file after setup.
