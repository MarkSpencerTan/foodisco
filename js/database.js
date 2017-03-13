var db = firebase.database();

function writeUserData(type, restaurantObj) {
  var path = 'users/' + $LOGGED_USER.uid + '/' + type+'/' +restaurantObj.id;
  // Get a key for a new restaurant obj.
  var newRestaurantKey = firebase.database().ref().child(path).set(restaurantObj);
  console.log("Finished db operation");

  // Write the new post's data simultaneously in the posts list and the user's post list.
  // var updates = {};
  // updates[path + newRestaurantKey] = restaurantObj;

  // return firebase.database().ref().update(updates);
}

$("#favorite").click(function(e){
	e.preventDefault();
	writeUserData("favorites", $RESTAURANT_OBJ)
});
