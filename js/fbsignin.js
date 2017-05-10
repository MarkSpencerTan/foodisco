    /**
     * Function called when clicking the Login/Logout button.
     */
    // [START buttoncallback]
    function toggleFbSignIn() {
      if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.FacebookAuthProvider();
        // [END createprovider]
        // [START addscopes]
        provider.addScope('user_birthday');
        // [END addscopes]
        // [START signin]
        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
		  var displayName = user.displayName;
		  $("#user_name").text(displayName);
		  $("#profile_name").text(displayName);	
		  var profilePic = user.photoURL;
		  console.log(profilePic);
			
		  $("#profile_dropdown").show();
		  $("#login_dropdown").hide();

		
		  console.log(user);
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
          // [END_EXCLUDE]
        });
        // [END signin]
      } else {
        // [START signout]
        firebase.auth().signOut();
		alert("You have been signed out");
		$("#profile_dropdown").hide();
		$("#login_dropdown").show();
        // [END signout]
      }
    }
    // [END buttoncallback]

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     */
    function initFbApp() {
      document.getElementById('fbsignin').addEventListener('click', toggleFbSignIn, false);
    }

    window.onload = function() {
      initFbApp();
    };