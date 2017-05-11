var db = firebase.database();

function writeUserData(type, restaurantObj) {
  var path = 'users/' + $LOGGED_USER.uid + '/' + type+'/' +restaurantObj.id;
  // Get a key for a new restaurant obj.
  var newRestaurantKey = firebase.database().ref().child(path).set(restaurantObj);
  console.log("Finished db operation");
}


$("#favorite").click(function(e){
	e.preventDefault();
  if($LOGGED_IN){
    if($("#favorite").hasClass("clickedFav")){
      $("#favorite").removeClass("clickedFav");
      $("#heart").removeClass("clickedHeart");
      removeFavoriteFirebase($RESTAURANT_OBJ.id)
    }
    else{
      writeUserData("favorites", $RESTAURANT_OBJ);
      $favoriteList.push($RESTAURANT_OBJ);
      $("#favorite").addClass("clickedFav");
      $("#heart").addClass("clickedHeart");
    }
  }
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
$("#viewexcluded, #user_view_excluded").click(function(e){
  e.preventDefault();
  loadExcludeList();
});

// EVent handler to view the favorites
$("#user_view_favorites").click(function(e){
  e.preventDefault();
  loadFavoriteList();
});

function loadExcludedContent(data){
  $excludedContent+= "<h3 class='" + data.id + "'>" + data.name + "</h3>";
  $excludedContent+= "<img class='img-thumbnail " + data.id + "' src='" + data.image_url + "'>";
  $excludedContent+= "<a href='#' id='" + data.id + "' class='text-muted  col-md-12 remove-exclude " + 
    data.id + "'>Remove from exclude list</a></br></br>";
  $excludedContent+= "<hr class='" + data.id + "'>";
  $("#excluded").html($excludedContent);
}

function loadFavoriteContent(data){
  $favoriteContent+= "<h3 class='" + data.id + "'>" + data.name + "</h3>";
  $favoriteContent+= "<img class='img-thumbnail " + data.id + "' src='" + data.image_url + "'>";
  $favoriteContent+= "<a href='#' id='" + data.id + "' class='text-muted  col-md-12 remove-favorite " + 
    data.id + "'>Remove from favorite list</a></br></br>";
  $favoriteContent+= "<hr class='" + data.id + "'>";
  $("#favorite_content").html($favoriteContent);
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


// updates the count of excluded and favorite lists
$("#profile_dropdown li a").on('click', function(){
  $('#excluded_count').text($excludeList.length)
  $('#favorite_count').text($favoriteList.length)
});


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

$(document).on('click', '.remove-favorite', function(e) {
  // remove from cookies
  e.preventDefault();
  var business_id = $(this).attr('id'); //get business id from element  
  removeFavoriteFirebase(business_id)  
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

function removeFavoriteFirebase(id){
  var found_index;
  $favoriteList.forEach(function(i, obj){
    if(obj.id === id){
      found_index = i;
    }
  })
  $favoriteList.splice(found_index, 1)

  var userId = firebase.auth().currentUser.uid;
  var ref = firebase.database().ref('/users/' + userId + "/favorites");
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

/* Loads restaurant objects from the firebase and adds them to $favoriteList */
function loadFavoriteList() {
  if ($LOGGED_IN){
    getFirebaseData("Favorites");
  }
}

function getFirebaseData(category){
  // empty out exclude list
  var tempList = [];
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
      tempList.push(db_obj[key])
    })
    if(category === "Exclude"){
      $excludeList = tempList
      $excludedContent = ""; //clear html
      for(var i = 0; i < $excludeList.length; i++) {
        loadExcludedContent($excludeList[i]);
      }
    }
    else{
      $favoriteList = tempList
      $favoriteContent = ""; //clear html
      for(var i = 0; i < $favoriteList.length; i++) {
        loadFavoriteContent($favoriteList[i]);
      }
    }
  });
}

