import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCdJP19s6Q-0Xx_lMAsLGUcLftR7TnZJ4c",
    authDomain: "shintanjin-baptist-church.firebaseapp.com",
    projectId: "shintanjin-baptist-church",
    storageBucket: "shintanjin-baptist-church.firebasestorage.app",
    messagingSenderId: "29306272008",
    appId: "1:29306272008:web:a58c6e650a64d79f8b94bd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    try {
        console.log("Fetching posts...");
        const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        console.log(`Success! Found ${querySnapshot.size} posts.`);
    } catch (error) {
        console.error("Firebase Error:", error.message);
    }
}

test();
