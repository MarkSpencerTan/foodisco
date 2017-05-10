var db = firebase.database();

function writeUserData(type, restaurantObj) {
  var path = 'users/' + $LOGGED_USER.uid + '/' + type+'/' +restaurantObj.id;
  // Get a key for a new restaurant obj.
  var newRestaurantKey = firebase.database().ref().child(path).set(restaurantObj);
  console.log("Finished db operation");
}

function loadUserData(){
  // updates global $excludeList
  loadExcludeList()
  // updates global $favoriteList
  loadFavorites()
}

$("#favorite").click(function(e){
	e.preventDefault();
  if($LOGGED_IN)
    writeUserData("favorites", $RESTAURANT_OBJ);
  $("#favorite").addClass("clickedFav");
  $("#heart").addClass("clickedHeart");
});

  
// adds a restaurant to exclude list, updates cookie, and updates result view
$("a#exclude").click(function(e) {
  e.preventDefault();
  var exclude = $jsonobject.businesses.splice($pos, 1)[0]; //remove from results    
  $excludeList.push(exclude); //save id

  // If a user is logged in, add to firebase, else store to cookie
  if($LOGGED_IN){
    writeUserData("exclude", exclude)
  }
  else
    addExcludeCookie(exclude);

  updateRestaurant($jsonobject); //update result
});

// Event handler for exclude list link
$("#viewexcluded").click(function(e){
  e.preventDefault();
  loadExcludeList();

  $excludedContent = ""; //clear html
  for(var i = 0; i < $excludeList.length; i++) {
    // businessSearchCaller($excludeList[i]);
    loadExcludedContent($excludeList[i]);
    console.log($excludeList[i]);
  }
});

function loadExcludedContent(data){
  $excludedContent+= "<h3 class='" + data.id + "'>" + data.name + "</h3>";
  $excludedContent+= "<img class='img-thumbnail " + data.id + "' src='" + data.image_url + "'>";
  $excludedContent+= "<a href='#' id='" + data.id + "' class='text-muted  col-md-12 remove-exclude " + 
    data.id + "'>Remove from exclude list</a></br></br>";
  $excludedContent+= "<hr class='" + data.id + "'>";
  $("#excluded").html($excludedContent);
}

/* Adds a restaurant obj to the excluded cookie. */
function addExcludeCookie(excludedObj){
  var newCookie = "";
  var existingCookies = document.cookie; //existing cookies
  if (existingCookies.length == 0) { //new cookie is first cookie
    newCookie = "excluded=" + JSON.stringify(excludedObj) + "|";
  }
  else { //adding to existing cookies
    newCookie = existingCookies + "|" + JSON.stringify(excludedObj) + "|";
  }
  document.cookie = newCookie + $expireStr + "path=/";
}

/* Removes a restaurant obj from the excluded cookie, 
   by placing the ids in an array, making the given id an empty
   string, and re-saving the cookie.
 */

$(document).on('click', '.remove-exclude', function(e) {
  // remove from cookies
  e.preventDefault();
  var business_id = $(this).attr('id'); //get business id from element
  $("." + business_id).remove(); //remove from view
  $excludeListIds = [];
  $excludeList.forEach(function(obj){
    $excludeListIds.push(obj.id);
  })
  var index = $.inArray(business_id, $excludeListIds); //position in arr
  
  if(index != -1) {
    $excludeList.splice(index, 1); //remove from internal list
    if($LOGGED_IN){
      removeExcludeFirebase(business_id)
    }
    else {
      removeExcludeCookie(business_id); //update cookie
    }
  }    
});

function removeExcludeCookie(id) {
  var excludeCookie = document.cookie.substring(9, exclude.length); //remove "excluded=" from first id
  var excludeArr = excludeCookie.split('|'); // split up the cookie string to an array of Obj | exp date | Obj ...
  //find and un-exclude restaurant
  for(var i = 0; i < excludeArr.length; i+=2) {
    if(JSON.parse(excludeArr[i]).id === id) {
      excludeArr.splice(i, 2); //delete cookie
    }
  }
  var newCookie = "excluded=";
  for(var i = 0; i <excludeArr.length; i++) { //reconstruct cookie
    if(i==0){
      newCookie += excludeArr[i];
    }
    else
      newCookie += "|" + excludeArr[i];
  }
  document.cookie = newCookie;
}

function removeExcludeFirebase(id){
  var userId = firebase.auth().currentUser.uid;
  var ref = firebase.database().ref('/users/' + userId + "/exclude");
  ref.child(id).remove();
}

/* Loads restaurant ids from the excluded cookie and adds them to $excludeList */
function loadExcludeList() {
  if ($LOGGED_IN){
    // load from firebase
    getFirebaseData("Exclude");
  }
  else{
    // load from cookies
    var exclude = document.cookie;
    exclude = exclude.substring(9, exclude.length);

    if (exclude.length != 0) {
      var excludeArr = exclude.split('|'); //exclude list as one long string
      // var excludeArr = exclude[0].split(' '); //split ids
      for(var i = 0; i < excludeArr.length; i=i+2) {
        $excludeList.push(JSON.parse(excludeArr[i]));
      }
    }
  }
  
}

function getFirebaseData(category){
  // empty out exclude list
  $excludeList = []
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var db_obj = ""
    if(category === "Exclude")
      db_obj = snapshot.val().exclude;
    else if(category === "Favorites")
      db_obj = snapshot.val().favorites;

    db_obj = JSON.stringify(db_obj);
    db_obj = JSON.parse(db_obj);

    keys = Object.keys(db_obj);
    keys.forEach(function(key){
      $excludeList.push(db_obj[key])
    })

    if(category === "Exclude"){
      // load the excluded content to the view
      $excludedContent = ""; //clear html
      for(var i = 0; i < $excludeList.length; i++) {
        loadExcludedContent($excludeList[i]);
        console.log($excludeList[i]);
      }
    }
  });
}

