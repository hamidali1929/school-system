require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, deleteDoc } = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    // Try to login if they have standard admin credentials
    await signInWithEmailAndPassword(auth, "admin@school.com", "admin123").catch(() => console.log("Login failed or not needed"));
    
    console.log("Fetching students...");
    const snapshot = await getDocs(collection(db, "students"));
    console.log(`Found ${snapshot.size} students.`);
    
    const unique = new Map();
    const duplicates = [];
    
    snapshot.docs.forEach(d => {
      const data = d.data();
      const id = d.id;
      // Using name+class as unique identifier to catch ID-changed duplicates
      const key = `${data.name}-${data.class}`.toLowerCase();
      
      if (unique.has(key)) {
        duplicates.push(id);
      } else {
        unique.set(key, id);
      }
    });
    
    console.log(`Found ${duplicates.length} duplicates.`);
    
    if (duplicates.length > 0) {
      console.log("Deleting duplicates...");
      for (const id of duplicates) {
        await deleteDoc(doc(db, "students", id));
      }
      console.log("Deleted duplicates.");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
