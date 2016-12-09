$RESTAURANT_OBJ = null;
$jsonobject = null;
$savedlocation = "";
$skippedList = [];
$currentLong = 100;
$currentLat = -100;
$excludeList = []; //yelp ids of excluded restaurants
$expireStr = "expires=Thu, 16 Nov 2017 12:00:00 UTC;"; //for cookies
$excludedContent = ""; //html content for excluded view

//The Main of the script
$('document').ready(function() {
    
    // attach click event handler to search button
    $('#search').click(function(e) {
        e.preventDefault();
        $loc = $('#location').val();    //takes location bar's userinput
        
        //if the value on the var is not the same as the previous saved location
        //call the api for a new restaurant
    	if($loc != $savedlocation) {
            apiCaller($loc);
    	}
        else{
			//remove the restaurant in the view and add it to the skipped list
			$skippedList.push($jsonobject.businesses.splice($pos, 1)[0]);
			//console.log($skippedList);
			//TODO: 
			//when restaurants list is empty, query API again
			//with original length as offset. &offset=LENGTH or something like that.
			updateRestaurant($jsonobject);
		}
        $('#description-tab').tab('show');
    });
	
    // Enter key pressed on the location bar
    $('#location').keypress(function(e){
        if(e.which == 13) {
            $('#search').click();//Trigger search button click event
            
        }
    });
	
	//gps icon selects the user's current location
	$('#gps').click(function(e) {
		e.preventDefault();
		geolocationCaller(function(loc, lat, long){
			$("#location").val(loc);
            $currentLong = long;
            $currentLat = lat;
		});
	});
    
    // Trigger event handler that will fire when apicaller is finished calling.
    $(document).on('updateinfo', function(event, data){
        $jsonobject = data;
        $savedlocation = $('#location').val();
        updateRestaurant($jsonobject);
    });
  
    // Event handler for skip list link. Will display the items from the $skippedList
	$("#viewskipped").click(function(e){
		$skippedContent = "";
		for(var i=0; i<$skippedList.length; i++){
			$skippedContent+= "<a href='" + i + "'><h3>" + $skippedList[i].name + "</h3></a>";
			$skippedContent+= "<img class='img-thumbnail' src='" + $skippedList[i].image_url + "'>";
			$skippedContent+= "<hr>"
		}
		$("#skipped").html($skippedContent);
	});
	
	// Event handler for when the user clicks on an item on the skipped list
	$(document).on('click', '#skipped a', function(e) {
		e.preventDefault();
		// strips out the position # of the item on the list
		$position = $(this).attr('href');
		console.log($position);
		// update the restaurant details ui by passing in the restaurant obj from the list
		simpleUpdate($skippedList[$position]);
		//close the skipped list modal popup
		$('#skipped_modal').modal('hide');
		// move tab back to restaurant desc if it was in the map
		$('#description-tab').tab('show');
	});
	
	// clears the skip list
	$("#clear_skipped").click(function(e){
		$skippedList = [];
		$("#skipped").html("");
	});
	
	loadExcludeList(); // load ids from cookie
	
	// adds a restaurant to exclude list, updates cookie, and updates result view
	$("#exclude").click(function(e) {
		e.preventDefault();
		var exclude = $jsonobject.businesses.splice($pos, 1)[0]; //remove from results
		$excludeList.push(exclude.id); //save id
		addExcludeCookie(exclude.id);
		updateRestaurant($jsonobject); //update result
	});
	
	// Event handler for exclude list link
	$("#viewexcluded").click(function(e){
		e.preventDefault();
		if($excludeList.length > 0) {
			$excludedContent = ""; //clear html
			for(var i = 0; i < $excludeList.length; i++) {
				businessSearchCaller($excludeList[i]);
			}
		}
	});
	
	// Trigger event handler that will fire when business search caller finishes
	// Generates and updates HTMl content of exclude view when given business JSON object (data)
	$(document).on('loadExcludedContent', function(event, data){
		$excludedContent+= "<h3 class='" + data.id + "'>" + data.name + "</h3>";
		$excludedContent+= "<img class='img-thumbnail " + data.id + "' src='" + data.image_url + "'>";
		$excludedContent+= "<a href='#' id='" + data.id + "' class='text-muted  col-md-12 remove-exclude " + 
			data.id + "'>Remove from exclude list</a></br></br>";
		$excludedContent+= "<hr class='" + data.id + "'>";
		$("#excluded").html($excludedContent);
	});
	
	// Event handler for when the user clicks "remove from exclude list" link
	// Removes from exclude view and updates cookie
	$(document).on('click', '.remove-exclude', function(e) {
		e.preventDefault();
		var business_id = $(this).attr('id'); //get business id from element
		$("." + business_id).remove(); //remove from view
		var index = $.inArray(business_id, $excludeList); //position in arr
		if(index != -1) {
			$excludeList.splice(index, 1); //remove from internal list
			removeExcludeCookie(business_id); //update cookie
		}
	});
});

/**  
 *  A function that calls the api for a Restaurant JSON Object
 *  @param  $location   Location of the user
 */
function apiCaller($location, callback){
    $.ajax({
        type: 'GET',
        url: "scripts/sample.php",
        dataType : "json",
        // data that is processed by the php (arguments)
        data: {location:$location
              },
        
        success:function(result){
            $(document).triggerHandler('updateinfo', [result]);
        },
        error:function(){
            console.log("Failed to load php");
            alert("Please enter a valid/more accurate location");
        }
    });
}

// updates Restaurant view taking in a jsonobject from the api
function updateRestaurant(jsonobj){
    $restaurants = jsonobj.businesses;
    
    $repeat = true;
    do {
       $pos = Math.floor(Math.random() * $restaurants.length);  //chooses random index
       console.log("Pos: "+$pos);
       console.log($restaurants[$pos]);

       //console.log("length: " + $restaurants.length);
       $RESTAURANT_OBJ = $restaurants[$pos];
       
       $id = $RESTAURANT_OBJ.id;
         
       if($.inArray($id, $excludeList) == -1) { //checks if result is in excludeList
          $image = $RESTAURANT_OBJ.image_url.replace(new RegExp("ms.jpg$"), "ls.jpg");	// changes small image to large
          $name = $RESTAURANT_OBJ.name;
          $phone = $RESTAURANT_OBJ.phone;
          $phone = "("+$phone.substr(0,3)+") "+$phone.substr(3,3) + "-"+ $phone.substr(6);
          $addressObject = $RESTAURANT_OBJ.location.address;
          $city = $RESTAURANT_OBJ.location.city;
          $rating = $RESTAURANT_OBJ.rating_img_url_large;
          $categories = $RESTAURANT_OBJ.categories;
          $url = $RESTAURANT_OBJ.url;

         $streetAddress = "";

         for (var i = 0; i < $addressObject.length; i++) {
               $streetAddress += $addressObject[i] +"\n";
         }
          $streetAddress += $city;
          $categories_content = $categories[0][0] ;
          if($categories.length > 1){
              $categories_content += ", "+$categories[1][0];
          }
          
          $("#name").html($name);
          $("#image").attr('src',$image);
          $("#rating").attr('src', $rating);
          $("#img-link").attr('href', $url);
          $("#see-more").attr('href', $url);
          $("#address").text($streetAddress);
          $("#phone").text($phone);
          $("#category").text($categories_content);
          
          
          //Collapses The Output Div
          $("#output").collapse("toggle");
          $("#output").removeAttr("id");
          
          //replaces Search Button to Disco Again
          $("#search").text("Disco Again");
          $repeat = false;
       }
       else {
          //console.log($pos + " result was in exclude list");
          $jsonobject.businesses.splice($pos, 1)[0]; //removes restaurant from results
       }
    } while ($repeat == true && $restaurants.length > 0);
}

// A function that simply updates the restaurant view taking in a restaurant object as a param
function simpleUpdate(restaurantObj){
	$RESTAURANT_OBJ = restaurantObj;
    $image = $RESTAURANT_OBJ.image_url.replace(new RegExp("ms.jpg$"), "ls.jpg");	// changes small image to large
    $name = $RESTAURANT_OBJ.name;
    $phone = $RESTAURANT_OBJ.phone;
    $phone = "("+$phone.substr(0,3)+") "+$phone.substr(3,3) + "-"+ $phone.substr(6);
    $addressObject = $RESTAURANT_OBJ.location.address;
    $city = $RESTAURANT_OBJ.location.city;
    $rating = $RESTAURANT_OBJ.rating_img_url_large;
    $categories = $RESTAURANT_OBJ.categories;
    $url = $RESTAURANT_OBJ.url;

	$streetAddress = "";

	for (var i = 0; i < $addressObject.length; i++) {
   		$streetAddress += $addressObject[i] +"\n";
	}
    $streetAddress += $city;
    $categories_content = $categories[0][0] ;
    if($categories.length > 1){
        $categories_content += ", "+$categories[1][0];
    }
    
    $("#name").html($name);
    $("#image").attr('src',$image);
    $("#rating").attr('src', $rating);
    $("#img-link").attr('href', $url);
    $("#see-more").attr('href', $url);
    $("#address").text($streetAddress);
    $("#phone").text($phone);
    $("#category").text($categories_content);
}


function geolocationCaller(autofillCallback){
	$.get('../scripts/keys/geolocationkey.txt', function(data) {
   		$GEOLOCATION_KEY = data;
		$.ajax({
		type: 'POST',
		url: "https://www.googleapis.com/geolocation/v1/geolocate?key=" + $GEOLOCATION_KEY,
		dataType : "json",
		success:function(result){
			var locJSON = JSON.stringify(result, null, 4);
			var locObj = JSON.parse(locJSON);
            
            // reverse geocode the lat and long to fill in the address on the location bar.
			reverseGeocodingCaller(locObj.location.lat, locObj.location.lng, autofillCallback);
		},
		error:function(){
			console.log("Geolocation failed");
		}
	});
	}, 'text');
	
	
}

function reverseGeocodingCaller(lat, lng, autofillCallback){
	$.get('../scripts/keys/geocodingkey.txt', function(data) {
   		$GEOCODING_KEY = data;
		$.ajax({
		type: 'POST',
		url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat +"," + lng + 
		"&key=" + $GEOCODING_KEY,
		dataType : "json",
		success:function(result) {
			var locJSON = JSON.stringify(result, null, 4);
			//console.log(locJSON);
         //   console.log($currentLat + ", " + $currentLong);
			var locObj = JSON.parse(locJSON);
//			var city = locObj.results[0].address_components[2].long_name;
//			var state = locObj.results[0].address_components[4].short_name;
//			var country = locObj.results[0].address_components[5].short_name;
//			var locStr = city + ", " + state + ", " + country;
			var locStr = locObj.results[1].formatted_address;
          
            var coordinates = "ll="+lat+","+lng;
			autofillCallback(locStr, lat, lng);
		},
		error:function(){
			console.log("Reverse geocoding failed");
			//alert("");
		}
	});	
	}, 'text');
	
}

function initMap() {
		var autocomplete = new google.maps.places.Autocomplete($("#location")[0], {});

		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();
			$currentLat = place.geometry.location.lat();
			$currentLong = place.geometry.location.lng();
		});


		map = new google.maps.Map(document.getElementById('map'), {
			  zoom: 13,
		});

		var map;
		var marker;
		var latlng = {lat: $currentLat, lng: $currentLong};   
		var restMarker;
		var restLat = $RESTAURANT_OBJ.location.coordinate.latitude;
		var restLng = $RESTAURANT_OBJ.location.coordinate.longitude;
		var pointA = new google.maps.LatLng($currentLat, $currentLong);
		var pointB = new google.maps.LatLng(restLat, restLng);


		marker = new google.maps.Marker({
			position: pointA,
			title: "Your Location",
			map: map,
			animation: google.maps.Animation.DROP
		});


		restMarker = new google.maps.Marker({
			position: pointB,
			title: $RESTAURANT_OBJ.name,
			map: map,
			icon: "../img/foodiscomarker.png",
			animation: google.maps.Animation.DROP
		});


		directionsService = new google.maps.DirectionsService,
		directionsDisplay = new google.maps.DirectionsRenderer({
			suppressMarkers: true,
		    map: map
		}),   

		google.maps.event.addListenerOnce(map, 'idle', function() {
			google.maps.event.trigger(map, 'resize');
			map.setCenter(pointA);
		});
    
          //Marker info window to display information on mrker
//        var markerInfoWindow = new google.maps.InfoWindow({
//            content: "You"
//        });
//        google.maps.event.addListener(marker, "click", function(e) {
//            markerInfoWindow.open(map, this);
//        });
//        
//        var restInfoWindow = new google.maps.InfoWindow({
//            content: $RESTAURANT_OBJ.name
//        });
//        google.maps.event.addListener(restMarker, "click", function(e) {
//            restInfoWindow.open(map, this);
//        });

		calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);
	
		// include directions
		directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('right-panel'));
    

}

function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
	directionsService.route({
		origin: pointA,
		destination: pointB,
		travelMode: google.maps.TravelMode.DRIVING
		}, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			} 
			else {
				window.alert('Directions request failed due to ' + status);
			}
		}
	);
}

/* Adds a restaurant id to the excluded cookie. */
function addExcludeCookie(id) {
	var newCookie = "";
	var existingCookies = document.cookie; //existing cookies
	if (existingCookies.length == 0) { //new cookie is first cookie
		newCookie = "excluded=" + id + ";";
	}
	else { //adding to existing cookies
		newCookie = existingCookies + " " + id + ";";
	}
	document.cookie = newCookie + $expireStr + "path=/";
}

/* Removes a restaurant id from the excluded cookie, 
   by placing the ids in an array, making the given id an empty
   string, and re-saving the cookie.
 */
function removeExcludeCookie(id) {
	var exclude = document.cookie.split(';'); //exclude list (as one string)
	var excludeArr = exclude[0].split(' '); //split list into array
	excludeArr[0] = excludeArr[0].substring(9, excludeArr[0].length); //remove "excluded=" from first id
	//find and un-exclude restaurant
	for(var i = 0; i < excludeArr.length; i++) {
        if(excludeArr[i] === id) {
			excludeArr[i] = ""; //delete cookie
		}
    }
	var newCookie = "excluded=";
	for(var i = 0; i <excludeArr.length; i++) { //reconstruct cookie
        newCookie += " " + excludeArr[i];
    }
	newCookie += "; path=/;" + $expireStr;
	document.cookie = newCookie; //re-save excluded cookie
}

/* Loads restaurant ids from the excluded cookie and adds them to $excludeList */
function loadExcludeList() {
	var exclude = document.cookie;
	if (exclude.length != 0) {
		exclude = exclude.split(';'); //exclude list as one long string
		var excludeArr = exclude[0].split(' '); //split ids
		for(var i = 0; i < excludeArr.length; i++) {
			$excludeList.push(excludeArr[i]);
		}
		$excludeList[0] = $excludeList[0].substring(9, $excludeList[0].length); //remove "excluded=" in first id
	}
}

/* Calls Yelp Business API with restaurant id, then calls another
   function to generate the HTML content in the excluded list */
function businessSearchCaller($id ) {
	$.ajax({
        type: 'GET',
        url: "scripts/businessSearch.php",
        dataType : "json",
		
        // data that is processed by the php (arguments)
        data: {business_id:$id
			  },
        
        success:function(result){
			$(document).triggerHandler('loadExcludedContent', [result]); //call html generator
        },
        error:function(){
            console.log("Failed to load php");
        }
    });
}