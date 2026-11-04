# Turning on sign-in (Google or a phone code)

Habit For Me can keep your habits in your own online account, so your iPhone and laptop show the
same habits. It uses **Firebase**, Google's sign-in and database service. You set it up once (about
15 minutes). Until then, the app works as before and keeps habits on each device.

## What it costs

- Google sign-in and saving your habits online: **free** at this size.
- Codes by text message: Google charges **a few cents per text** (the price depends on the country),
  so Firebase asks for a payment card (the **Blaze** pay-as-you-go plan).
- Tip: set a **budget alert** in Google Cloud (Billing → Budgets & alerts), for example $2 a month,
  so you get an email if it ever costs more than that.

## Steps

1. Open https://console.firebase.google.com and sign in with your Google account.
2. **Create a project** → name it `habit-for-me` → turn **off** Google Analytics (not needed) →
   **Create project**.
3. Turn on the ways to sign in:
   - Left menu: **Build → Authentication → Get started**.
   - **Sign-in method → Google → Enable**, pick your email as the support email → **Save**.
   - **Sign-in method → Phone → Enable → Save**. If it asks you to upgrade to the **Blaze** plan,
     do it and add your card.
   - **Settings → Authorized domains → Add domain** → type `aliiherzi.github.io` → **Add**.
4. Make the database:
   - Left menu: **Build → Firestore Database → Create database**.
   - Pick a location near you, choose **Start in production mode** → **Create**.
   - Open the **Rules** tab, replace everything with the rules below, then click **Publish**.
     They mean: each person can only read and change their own habits.

     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```

5. Connect the app:
   - Click the **gear ⚙ → Project settings**. Under **Your apps**, click the web icon **</>**.
   - Nickname: `Habit For Me` → **Register app** (leave Firebase Hosting off).
   - Copy the `firebaseConfig` part. It looks like this (yours has real values):

     ```js
     const firebaseConfig = {
       apiKey: "AIza…",
       authDomain: "habit-for-me-xxxxx.firebaseapp.com",
       projectId: "habit-for-me-xxxxx",
       storageBucket: "habit-for-me-xxxxx.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234567890:web:abc123"
     };
     ```

6. Send it to Claude, or put it in `firebase-config.js` yourself in place of `null`.

These settings are **not passwords**. They only tell the app which Firebase project to use, and
Google expects them to be public. Your habits are protected by the rules in step 4.
GitHub may still send an email saying it found a "Google API key". For Firebase that is expected.
To be extra safe: in Google Cloud → **APIs & Services → Credentials**, open the "Browser key" and
under **Website restrictions** add `aliiherzi.github.io/*`.

## Trying the phone code without paying for texts

In **Authentication → Sign-in method → Phone**, open **Phone numbers for testing** and add a
made-up number such as `+1 650 555 1234` with the code `123456`. Signing in with that number uses
that code and sends no text.

## Good to know

- The first time you sign in on a device, the habits already on it are kept and added to your account.
- After that, every change is sent to your account, and your other devices pick it up.
- Signing out keeps your habits on that device.
- On iPhone, if Google sign-in doesn't come back to the app after you pick your account,
  use **Continue with phone number** instead.
