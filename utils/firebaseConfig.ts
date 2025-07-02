// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDJS8-T3mszJogUFwD8XoiMshZhQVdhTj8',
  authDomain: 'neoscanner.firebaseapp.com',
  projectId: 'neoscanner-c2e58',
  storageBucket: 'neoscanner-c2e58.firebasestorage.app',
  messagingSenderId: 'XXXXXXXX',
  appId: '1:80757273113:android:618d927d5d1fe36488f088'
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
