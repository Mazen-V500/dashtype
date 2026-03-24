import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyABT9cJ3H2e1YaljPhmFb8dgXfaV7cZEQs",
    authDomain: "dashtype-9855c.firebaseapp.com",
    projectId: "dashtype-9855c",
    storageBucket: "dashtype-9855c.firebasestorage.app",
    messagingSenderId: "758504188835",
    appId: "1:758504188835:web:a75d6f9452f09a067f0816",
    databaseURL: "https://dashtype-9855c-default-rtdb.firebaseio.com"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

window.saveRoundDataToFirebase = async function(word, timeTaken, mode, language) {
    try {
        const authUser = auth.currentUser;
        const storedUserRaw = localStorage.getItem("dashTypeUser");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        const uid = (authUser && authUser.uid) || (storedUser && storedUser.uid);
        if (!uid) {
            console.warn("Firebase save skipped: no authenticated user.");
            return;
        }

        const displayName = (storedUser && storedUser.nickname) || (authUser && authUser.displayName) || (storedUser && storedUser.displayName);
        const playerName = displayName || "لاعب مجهول";
        const shortId = uid.substring(0, 6);

        const roundData = {
            word: word,
            timeTaken: timeTaken,
            mode: mode,
            language: language,
            playerName: playerName,
            shortId: shortId,
            timestamp: Date.now()
        };

        const userRef = ref(db, `users/${uid}/rounds`);
        await push(userRef, roundData);
    } catch (error) {
        console.error("Firebase save error:", error);
    }
};
