import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from 'firebase/functions'; // connectFunctionsEmulator
import { getStorage } from "firebase/storage"

//PROD
export const config = {
    apiKey: "AIzaSyAcm-BxZTYAhshcuDByBU9Ljzh5l1oleMM",
    //authDomain: "rent-a-date-81735.firebaseapp.com",
    authDomain: "rentbabe.com",
    databaseURL: "https://rent-a-date-81735.firebaseio.com",
    projectId: "rent-a-date-81735",
    storageBucket: "images.rentbabe.com",
    messagingSenderId: "464795139098",
    appId: "1:464795139098:web:87ce25ea4154dad390e5a3",
    measurementId: "G-K2SHMBYTJ3"
}

//DEV
// export const config = {
//     apiKey: "AIzaSyC9pQh_g7tmri3UlCDX44i5tI1OBlNsOOA",
//     authDomain: "rb-dev-819c4.firebaseapp.com",
//     projectId: "rb-dev-819c4",
//     storageBucket: "rb-dev-819c4.appspot.com",
//     messagingSenderId: "423090213827",
//     appId: "1:423090213827:web:3f0dfdbbbf437160306376",
//     measurementId: "G-0SZYQ6EDDQ"
// }

// DEV CREDENTIALS
// Phone number:     Code:
// +1 613-604-3879	111111	
// +880 1723-111581	123456	
// +65 9123 4567	888999	
// +65 9876 5432	898989	
// +880 1734-111591	123456	
// +92 307 2894423	112233	
// +91 96873 67261	232323	
// +65 77778888	777888	
// +65 11112222	111222

// WISE DEV
// export const config = {
//     apiKey: "AIzaSyDaabSVFEXV5AnFCOke17W52NcEOAxkwZE",
//     authDomain: "wise-dev-9300e.firebaseapp.com",
//     projectId: "wise-dev-9300e",
//     storageBucket: "wise-dev-9300e.appspot.com",
//     messagingSenderId: "566098260985",
//     appId: "1:566098260985:web:ea1a149be0fe31bd978328",
//     measurementId: "G-0DWC6D5LYH"
// };

export const firebaseApp = initializeApp(config)
export const storage = getStorage(firebaseApp)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const analytics = getAnalytics(firebaseApp)
export const functions = getFunctions(firebaseApp)
//connectFunctionsEmulator(functions, "localhost", 5001);