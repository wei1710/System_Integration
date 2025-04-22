# Firebase Google Authentication Integration Setup

Guide to set up Google Authentication with Firebase in your web application.

## Step 1: Firebase Project Setup

1.  **Go to the Firebase Console:** Open your web browser and navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/).
2.  **Create a New Project:** Click "Add project" and follow the on-screen instructions to create a new Firebase project.
3.  **Add a Web App:**
    * Click the web icon (`</>`).
    * Enter a **Web app name** for your application.
    * Click the "Register app" button.
4.  **Get Firebase Configuration:** On the "Add Firebase to your web app" screen, you will see a JavaScript object containing your Firebase project's configuration. **Carefully copy this entire `firebaseConfig` object.** You will need to paste these values into your `.env` file in the local project.

    ```javascript
    const firebaseConfig = {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID
    };
    ```

5.  **Click "Continue to console."**
6.  **Enable Google Sign-in:**
    * In the Firebase Console, navigate to **Authentication** in the left-hand menu.
    * Click on the **Sign-in method** tab at the top.
    * Locate the **Google** provider in the list and enable it by clicking the toggle switch.
    * Click the **Save** button.

## Step 2: Local Project Files

1.  **Create Project Folder:** Create a new folder on your computer for this project (e.g., `auth-integration`).
2.  **Create `public` Folder:** Inside `auth-integration`, create a folder named `public`.
3.  **Create `index.html` in `public`:**

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="[https://cdn.jsdelivr.net/npm/water.css@2/out/water.css](https://cdn.jsdelivr.net/npm/water.css@2/out/water.css)">
        <title>Auth Integration</title>
    </head>
    <body>
        <div class="container">
            <h1>Authentication</h1>
            <div id="google-login">
                <button onclick="signInWithGoogle()">Sign In with Google</button>
                <p id="google-error" class="error"></p>
            </div>
            <div id="auth-state">
                <h2>Authentication State</h2>
                <p id="user-info">Not logged in</p>
                <button onclick="signOutUser()">Sign Out</button>
            </div>
        </div>
        <script type="module" src="script.js"></script>
    </body>
    </html>
    ```

4.  **Create `script.js` in `public`:**

    ```javascript
    import { initializeApp } from '[https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js)';
    import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from '[https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js](https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js)';

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
    ```

5.  **Create `.env` in `auth-integration`:** Create a file named `.env` in the main project folder and paste your Firebase configuration values here. **Replace the placeholder values with your actual credentials from Step 1.**

    ```
    API_KEY="API_KEY"
    AUTH_DOMAIN="PROJECT_ID.firebaseapp.com"
    PROJECT_ID="PROJECT_ID"
    STORAGE_BUCKET="PROJECT_ID.appspot.com"
    MESSAGING_SENDER_ID="MESSAGING_SENDER_ID"
    APP_ID="APP_ID"
    ```

6.  **Open Terminal:** Navigate to your `auth-integration` folder in your terminal.
7.  **Install Dependencies:** Run the following commands to initialize your Node.js project and install the necessary packages:

    ```bash
    npm init -y
    npm install dotenv express
    ```

8.  **Modify `package.json` for ES Modules:** After running `npm init -y`, a `package.json` file will have been created in your project root. Open this file. You need to change to `"type": "module"` to this file to enable the use of ES Modules.

```
{
  "name": "auth_integration",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "firebase": "^11.6.0"
  }
}
```

9.  **Create `server.js` in `auth-integration`:** Create a file named `server.js` in the main project folder.

    ```javascript
    import 'dotenv/config';
    import express from 'express';
    import { fileURLToPath } from 'url';
    import path, { dirname } from 'path';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const app = express();
    const port = 8080;

    const firebaseConfig = {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID
    };

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/firebase-config', (req, res) => {
        res.json(firebaseConfig);
    });

    app.listen(port, () => console.log("Server is running on port", port));
    ```

## Step 3: Run Locally

1.  **Start Server:** Run the command to start the server.

    ```bash
    nodemon server.js
    ```

2.  **Open Browser:** Open the web browser and go to `http://localhost:8080/`.
3.  **Test Google Sign-in:** Click the "Sign In with Google" button and follow the prompts to authenticate with your Google account. Check the "Authentication State" section on the page to see authentication state.