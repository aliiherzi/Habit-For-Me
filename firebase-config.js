// Settings for signing in (Google or a code by text message) and keeping habits in sync online.
// Empty for now: sign-in stays switched off and the app keeps habits on this device only.
//
// To switch it on, follow docs/sign-in-setup.md, then replace null below with your project's
// firebaseConfig, like this:
//   window.FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...",
//     storageBucket: "...", messagingSenderId: "...", appId: "..." };
//
// These values are not passwords. They only say which Firebase project to use, and Google expects
// them to be public. Your habits are protected by the Firestore rules in docs/sign-in-setup.md.
window.FIREBASE_CONFIG = null;
