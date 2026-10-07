import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyARc8aZVfXP6S5pXDvtjelyHLyhpphHey0',
  authDomain: 'school-management-system-28d1e.firebaseapp.com',
  projectId: 'school-management-system-28d1e',
  storageBucket: 'school-management-system-28d1e.firebasestorage.app',
  messagingSenderId: '824716640665',
  appId: '1:824716640665:web:ad7b2906e113d4b25c1308'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  console.log('Fetching campuses...');
  const campusSnap = await getDocs(collection(db, 'campuses'));
  const campuses = campusSnap.docs.map(d => d.data());
  const validCampusNames = new Set(campuses.map(c => c.name));
  
  if (campuses.length === 0) {
    console.log('No campuses found.');
    process.exit(0);
  }

  const defaultCampusName = campuses[0].name;
  console.log('Default campus to use if invalid:', defaultCampusName);

  console.log('Fetching students...');
  const studentSnap = await getDocs(collection(db, 'students'));
  let batch = writeBatch(db);
  let count = 0;

  for (const studentDoc of studentSnap.docs) {
    const data = studentDoc.data();
    if (!data.campus || !validCampusNames.has(data.campus)) {
      console.log(`Student ${data.name} has invalid campus: ${data.campus}. Fixing to ${defaultCampusName}`);
      batch.update(studentDoc.ref, { campus: defaultCampusName });
      count++;
      
      if (count % 450 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Fixed ${count} students.`);
  } else {
    console.log('No students needed fixing.');
  }
  
  process.exit(0);
}

fix().catch(console.error);
