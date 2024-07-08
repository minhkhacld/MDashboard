// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyBBxGsPdosl_UOktnbugptJWB3bqCSCJcs',
//   authDomain: 'm-system-1a9f6.firebaseapp.com',
//   projectId: 'm-system-1a9f6',
//   storageBucket: 'm-system-1a9f6.appspot.com',
//   messagingSenderId: '1075384060740',
//   appId: '1:1075384060740:web:4db263cc287ea2ab516511',
//   measurementId: 'G-KBM3VB5J8G',
// };

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const messaging = getMessaging(firebaseApp);

// export const fetchToken = (setTokenFound, online) => {
//   if (!online) {
//     return;
//   }
//   return getToken(messaging, {
//     vapidKey: 'BOb5U0rqE6RsdMQvIPdYBJw4uKh_7plwFX6LTQ3eBizSqCT2A0dFcZh7GpIkbcnbeMUAnWh7FoLY4V6yfZWCoko',
//   })
//     .then((currentToken) => {
//       if (currentToken) {
//         console.log('current token for client: ', currentToken);
//         setTokenFound(true);
//         // Track the token -> client mapping, by sending to backend server
//         // show on the UI that permission is secured
//       } else {
//         console.log('No registration token available. Request permission to generate one.');
//         setTokenFound(false);
//         // shows on the UI that permission is required
//       }
//     })
//     .catch((err) => {
//       console.log('An error occurred while retrieving token. ', err);
//       // catch error while creating client token
//     });
// };

// export const onMessageListener = (online) =>
//   new Promise((resolve) => {
//     if (!online) {
//       return;
//     }
//     onMessage(messaging, (payload) => {
//       resolve(payload);
//     });
//   });
