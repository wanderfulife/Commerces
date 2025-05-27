import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyC0aBkzbzJyV6yUKJkkBBw7YJw_MgpKLyc",
	authDomain: "reims-dc6cc.firebaseapp.com",
	projectId: "reims-dc6cc",
	storageBucket: "reims-dc6cc.appspot.com",
	messagingSenderId: "720898924669",
	appId: "1:720898924669:web:ac020edfd3f23523b5d114",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
