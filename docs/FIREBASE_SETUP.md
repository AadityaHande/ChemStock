# Firebase Setup

This guide collects the Firebase-specific steps referenced by the README so you can configure authentication, Firestore, and email delivery without missing anything.

## 1. Create a Firebase Project
1. Go to https://console.firebase.google.com and create a new project (choose a unique project ID).
2. Add a Web app and note the Firebase configuration snippet.
3. Enable billing if you plan to use Firestore beyond the free limits; otherwise the Spark plan is enough for small teams.

## 2. Enable Required Firebase Features
- **Authentication** → Providers → enable **Email/Password** and **Google** sign-in. Add any redirect domains if prompted (e.g., `http://localhost:9002`).
- **Firestore Database** → create a database in production mode if you want to control rules, or start in test mode for development then lock it down.
- **Storage** (optional) → enable if you plan to store user profile images or attachments.

## 3. Configure Allowed Users
- Add the project users (email addresses) to the app-level allowlist under the environment variable `NEXT_PUBLIC_ALLOWED_EMAILS`. This is handled in code at runtime to restrict access to authorized emails only.
- If certain users are administrators, include them under `NEXT_PUBLIC_ADMIN_EMAILS` for role-based permissions.
  
> Only emails explicitly listed in `NEXT_PUBLIC_ALLOWED_EMAILS` can reach the login form; any other address is revoked when the app detects it.

## 4. Fill Environment Variables
Copy `.env.example` to `.env.local` and replace placeholder values with your Firebase project settings.

```bash
cp .env.example .env.local
```

Then update the values (replace placeholders with real values):
```
NEXT_PUBLIC_FIREBASE_API_KEY=pk_live_XXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
NEXT_PUBLIC_ALLOWED_EMAILS=user1@example.com,user2@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
RESEND_API_KEY=re_XXXXXXXXXXXXX
RESEND_API_KEY_ALT=
```
```

> **Do not commit `.env.local`** or any actual Firebase secrets. Keep keys and emails private and manage them via your chosen CI/CD secrets mechanism when deploying.

## 5. Optional: Configure Firestore Security Rules
The repo ships with `firestore.rules` in the repo root. Review and tighten them for production before launching—only allow read/write access to the collections your app uses.

## 6. Deploying to Production
When deploying (Vercel, Netlify, etc.), set the same environment variables through the platform's secret manager rather than committing them in source control.

Use the same `NEXT_PUBLIC_ALLOWED_EMAILS`/`NEXT_PUBLIC_ADMIN_EMAILS` lists so the hosted site enforces the same access control as your local copy.

## 7. Email delivery (Resend)
- Register at [https://resend.com](https://resend.com) and obtain an API key.
- Put the key into `RESEND_API_KEY`; the app optionally retries failed sends through `RESEND_API_KEY_ALT`.
- Guarantee the Resend key is kept secret just like your Firebase keys and rotate it if it is ever exposed.

## 8. Additional Resources
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Web App Setup](https://firebase.google.com/docs/web/setup)
- [Resend Email Deliverability](https://resend.com/docs)
