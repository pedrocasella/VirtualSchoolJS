// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM2oOGBVEpW0xeqNlZGjOn2TBSbDG8Tow",
  authDomain: "ichat-70e65.firebaseapp.com",
  databaseURL: "https://ichat-70e65-default-rtdb.firebaseio.com",
  projectId: "ichat-70e65",
  storageBucket: "ichat-70e65.appspot.com",
  messagingSenderId: "897708561792",
  appId: "1:897708561792:web:40a15e74e2ffee83dc9d65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();

const database = getDatabase(app);
const db = getDatabase();

//Login and Create player
document.getElementById('login-btn').addEventListener('click', ()=>{
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;

      //Create dataplayer geting email informations
      
      const dataPlayer = {
        name: user.displayName,
        email: user.email,
        uuid: user.uid
      }

      //set dataplayer in database
      
      set(ref(db, 'users/' + user.uid), {
        dataPlayer
      }).then(()=>{
        window.location.assign('./../firstfloor/'),
        localStorage.setItem('uuidVirtualSchool', user.uid)
      }

      );

      

      console.log(dataPlayer)
 
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
})