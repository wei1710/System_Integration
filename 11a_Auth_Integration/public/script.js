import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';

let app, auth, provider;

async function initializeFirebase() {
  const response = await fetch('/api/firebase-config');
  const config = await response.json();
  app = initializeApp(config);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
}

initializeFirebase();

function signInWithGoogle() {
  const googleError = document.getElementById('google-error');
  if (!auth || !provider) {
    console.error('Firebase not initialized yet.');
    googleError.textContent = 'Firebase not initialized. Please try again.';
    return;
  }
  signInWithPopup(auth, provider)
    .then(result => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      console.log('Google sign-in successful:', user, token);
      googleError.textContent = '';
      updateAuthState(user);
    })
    .catch(({ code, message, customData }) => {
      const email = customData?.email;
      console.error('Google sign-in error:', code, message, email, GoogleAuthProvider.credentialFromError(error));
      googleError.textContent = message;
    });
}

function signOutUser() {
  if (!auth) {
    console.error('Firebase not initialized yet.');
    return;
  }
  signOut(auth)
    .then(() => {
      console.log('Sign out successful');
      updateAuthState(null);
    })
    .catch(error => {
      console.error('Sign out error:', error);
    });
}

function updateAuthState(user) {
  const userInfoDiv = document.getElementById('user-info');
  userInfoDiv.textContent = user ? `Logged in as: ${user?.email} (UID: ${user?.uid})` : 'Not logged in';
}

function setupAuthStateListener() {
  if (auth) {
    onAuthStateChanged(auth, updateAuthState);
  } else {
    setTimeout(setupAuthStateListener, 500);
  }
}

setupAuthStateListener();

window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;