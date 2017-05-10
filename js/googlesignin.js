
var signedIn = false;
/**
 * Function called when clicking the Login/Logout button.
 */
function toggleGoogleSignIn() {
  if (!firebase.auth().currentUser) {
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/plus.login');
		firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
		  var token = result.credential.accessToken;
		  // The signed-in user info.
		  var user = result.user;
		  signedIn = true;
		}).catch(function(error) {
	  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // The email of the user's account used.
		  var email = error.email;
		  // The firebase.auth.AuthCredential type that was used.
		  var credential = error.credential;
		  // [START_EXCLUDE]
		  if (errorCode === 'auth/account-exists-with-different-credential') {
			alert('You have already signed up with a different auth provider for that email.');
			// If you are using multiple auth providers on your app you should handle linking
			// the user's accounts here.
	  } else {
			console.error(error);
	  }
	});
  } else {
		firebase.auth().signOut();
		signedIn = false;
  }
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  console.log('does the initapp');
  firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
	  // User is signed in.
	  var displayName = user.displayName;
	  var email = user.email;
	  var emailVerified = user.emailVerified;
	  var photoURL = user.photoURL;
	  var isAnonymous = user.isAnonymous;
	  var uid = user.uid;
	  var providerData = user.providerData;
	  
	  console.log(displayName);
	  $("#profile-name").text(displayName);
	  signedIn = true;

	} else {
	  // User is signed out.
	  signedIn = false;
	}
  });
  // [END authstatelistener]
  console.log('gets to event listeners');
  document.getElementById('googlesignin').addEventListener('click', toggleGoogleSignIn, false);
  document.getElementById('sign-out').addEventListener('click', toggleGoogleSignIn, false);
}

window.onload = function() {
  initApp();
};
