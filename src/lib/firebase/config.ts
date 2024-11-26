import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAICwewb9nIfENQH-gOJgkpQXZKBity9ck",
  authDomain: "accounting-c3c06.firebaseapp.com",
  projectId: "accounting-c3c06",
  storageBucket: "accounting-c3c06.firebasestorage.app",
  messagingSenderId: "670119019137",
  appId: "1:670119019137:web:f5c57a1a6f5ef05c720380"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Инициализируем Firestore
export const db = getFirestore(app);

/*
Необходимые индексы для Firebase:

1. Коллекция: transactions
   Составной индекс:
   - categoryId (По возрастанию)
   - date (По убыванию)
   
2. Коллекция: transactions
   Составной индекс:
   - fromUser (По возрастанию)
   - date (По убыванию)

3. Коллекция: transactions
   Составной индекс:
   - toUser (По возрастанию)
   - date (По убыванию)

4. Коллекция: categories
   Составной индекс:
   - row (По возрастанию)
   - title (По возрастанию)

5. Коллекция: transactions
   Составной индекс:
   - categoryId (По возрастанию)
   - type (По возрастанию)
   - date (По убыванию)
*/