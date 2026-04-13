/**
 * Firebase Configuration - Load from environment or use secure defaults
 * SECURITY: Never commit real API keys. Use environment variables in production.
 */

export const getFirebaseConfig = () => {
    // In production, load from environment variables
    if (typeof process !== 'undefined' && process.env) {
        return {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        };
    }

    // Fallback for development/browser environment
    // ⚠️ These are test credentials - restrict in Firebase console
    return {
        apiKey: "AIzaSyABT9cJ3H2e1YaljPhmFb8dgXfaV7cZEQs",
        authDomain: "dashtype-9855c.firebaseapp.com",
        projectId: "dashtype-9855c",
        storageBucket: "dashtype-9855c.firebasestorage.app",
        messagingSenderId: "758504188835",
        appId: "1:758504188835:web:a75d6f9452f09a067f0816",
        databaseURL: "https://dashtype-9855c-default-rtdb.firebaseio.com",
    };
};

export default getFirebaseConfig;
