// Sign in with Google or a code sent by text message, and keep habits the same on every device.
// It uses Firebase (Google's sign-in and database service), loaded from Google's servers.
// It does nothing until firebase-config.js has your project's settings (see docs/sign-in-setup.md).
//
// How syncing works: each person's habits are one document, users/<their id>, holding the whole
// app state as text. Every change on a device is sent up (after a short pause). When another device
// sends newer data, this device takes it. The first time you sign in on a device, the habits already
// on it are kept and added to your account.

const config = window.FIREBASE_CONFIG;
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const SYNCED_KEY = 'habit-for-me:synced-user'; // which account this device has already merged with
const cloud = window.cloud;
const changed = () => window.dispatchEvent(new Event('cloud-change'));

if (config && config.apiKey) {
  start().catch((err) => {
    console.warn('Sign-in could not load', err);
    cloud.failed = true;
    changed();
  });
}

async function start() {
  const [appSdk, authSdk, dbSdk] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const firebaseApp = appSdk.initializeApp(config);
  const auth = authSdk.getAuth(firebaseApp);
  auth.useDeviceLanguage();
  const db = dbSdk.getFirestore(firebaseApp);
  const app = window.habitApp;
  const docFor = (uid) => dbSdk.doc(db, 'users', uid);
  let stopListening = null;
  let pushTimer = null;
  let confirmation = null;
  let verifier = null;

  async function pushNow() {
    clearTimeout(pushTimer);
    const user = auth.currentUser;
    if (!user) return;
    const state = app.getState();
    cloud.status = 'syncing';
    changed();
    try {
      await dbSdk.setDoc(docFor(user.uid), {
        data: JSON.stringify(state),
        savedAt: state.savedAt || 0,
        updatedAt: dbSdk.serverTimestamp(),
      });
      cloud.status = 'synced';
    } catch (err) {
      console.warn('Could not sync', err);
      cloud.status = 'error';
    }
    changed();
  }

  function onRemote(user, snap) {
    if (snap.metadata.hasPendingWrites) return; // our own change, still on its way up
    let remote = null;
    try {
      remote = snap.exists() ? JSON.parse(snap.data().data) : null;
    } catch (err) {
      remote = null;
    }
    const local = app.getState();
    if (!remote) {
      // A brand-new account: send this device's habits up.
      localStorage.setItem(SYNCED_KEY, user.uid);
      pushNow();
      return;
    }
    if (localStorage.getItem(SYNCED_KEY) !== user.uid) {
      // First sign-in on this device: keep the habits from both.
      app.useCloudState(app.mergeStates(local, remote));
      localStorage.setItem(SYNCED_KEY, user.uid);
      pushNow();
      return;
    }
    const theirs = remote.savedAt || 0;
    const ours = local.savedAt || 0;
    if (theirs > ours) {
      app.useCloudState(remote); // changed on another device
      cloud.status = 'synced';
      changed();
    } else if (theirs < ours) {
      pushNow(); // this device has newer changes
    } else {
      cloud.status = 'synced';
      changed();
    }
  }

  Object.assign(cloud, {
    ready: true,
    queuePush() {
      clearTimeout(pushTimer);
      pushTimer = setTimeout(pushNow, 1200);
    },
    // Not async on purpose: the pop-up must open straight from the tap, or browsers block it.
    google() {
      const provider = new authSdk.GoogleAuthProvider();
      return authSdk.signInWithPopup(auth, provider).catch((err) => {
        if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
          return authSdk.signInWithRedirect(auth, provider);
        }
        throw err;
      });
    },
    async sendCode(phone) {
      // reCAPTCHA checks that a person, not a robot, is asking for the text message.
      if (!verifier) verifier = new authSdk.RecaptchaVerifier(auth, 'recaptcha-box', { size: 'invisible' });
      try {
        confirmation = await authSdk.signInWithPhoneNumber(auth, phone, verifier);
      } catch (err) {
        if (verifier && verifier.clear) verifier.clear();
        verifier = null;
        throw err;
      }
    },
    async confirmCode(code) {
      if (!confirmation) throw Object.assign(new Error('Ask for a code first'), { code: 'auth/code-expired' });
      await confirmation.confirm(code);
      confirmation = null;
    },
    signOut: () => authSdk.signOut(auth),
  });
  changed();

  authSdk.onAuthStateChanged(auth, (user) => {
    if (stopListening) {
      stopListening();
      stopListening = null;
    }
    cloud.user = user ? { uid: user.uid, name: user.displayName || '', email: user.email || '', phone: user.phoneNumber || '' } : null;
    cloud.status = user ? 'syncing' : 'off';
    changed();
    if (!user) return;
    stopListening = dbSdk.onSnapshot(docFor(user.uid), (snap) => onRemote(user, snap), (err) => {
      console.warn('Sync stopped', err);
      cloud.status = 'error';
      changed();
    });
  });
}
