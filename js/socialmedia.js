// global to keep track of the logged in user
$LOGGED_USER = null; 

//Checks whether user is still logged in
function initApp() {
  // Listening for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
	  $LOGGED_IN = true;
	  $("#login_dropdown").hide();
      $("#profile_dropdown").show();
      updateProfile(user);
      $LOGGED_USER = user;
      $("#favorite").show();

	} else {
	  // User is signed out.
	  $LOGGED_IN = false;
	  $LOGGED_USER = null;
	  $("#favorite").hide();
	}
  });
}

window.onload = function() {
  initApp();
};


//Signs in with the login button
$("#fbsignin").click(function(e){
	e.preventDefault();
	signIn("facebook");
});

$("#googlesignin").click(function(e){
	e.preventDefault();
	signIn("google");
});

$("#sign-out").click(function(e){
	e.preventDefault();
	firebase.auth().signOut();
	$("#profile_dropdown").hide();
	$("#login_dropdown").show();
	alert("you have been signed out.")
	$LOGGED_IN = false;
	$("#favorite").hide();
});

$("#profile_dropdown").hide();
$("#favorite").hide();


function signIn(socialmedia){
    
	if(!firebase.auth().currentUser){
		var provider;
		if(socialmedia === "facebook")
			provider = new firebase.auth.FacebookAuthProvider();

		if(socialmedia === "google")
			provider = new firebase.auth.GoogleAuthProvider();
		
		//add scopes
//		provider.addScope('user_birthday');
		
		firebase.auth().signInWithPopup(provider).then(function(result) {
			// This gives you a Facebook Access Token. You can use it to access the Facebook API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			// Updates UI when signing in
			updateProfile(user);

			$("#profile_dropdown").show();
			$("#login_dropdown").hide();
			$("#favorite").show()
			$LOGGED_IN = true;

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
        });
	}else {
        // [START signout]
        firebase.auth().signOut();
		alert("You have been signed out");
		$LOGGED_IN = false;
		$("#profile_dropdown").hide();
		$("#login_dropdown").show();
	}
}

function updateProfile(user){
	// Update Name
	var displayName = user.displayName;
	$("#profile_name").text(displayName);
	
	// Update profile pic
	var profilePic = user.photoURL; 
    $("#profile_thumb").attr("src", profilePic);
    $("#profile_pic").attr("src", profilePic);	
	// Update Email
	var email = user.email;
	$("#profile_email").text(email);

	// load exclude and favorite lists
	loadExcludeList()
	loadFavoriteList()
}
