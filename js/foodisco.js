$RESTAURANT_OBJ = null;
$LOGGED_IN = false;
$jsonobject = null;
$savedlocation = "";
$savedFilters = {};
$skippedList = [];
$currentLong = 100;
$currentLat = -100;
$excludeList = []; //yelp ids of excluded restaurants
$favoriteList = []
$expireStr = "expires=Thu, 16 Nov 2017 12:00:00 UTC;"; //for cookies
$excludedContent = ""; //html content for excluded view
$favoriteContent = "";

//The Main of the script
$('document').ready(function() {
    // attach click event handler to search button
    $('#search').click(function(e) {
        e.preventDefault();
        $loc = $('#location').val();    //takes location bar's userinput
        
        if($loc=="") {
        	geolocationCaller(function($loc, lat, long){
				$("#location").val($loc);
	            $currentLong = long;
	            $currentLat = lat;
	            apiCaller($loc);
	            $('#description-tab').tab('show');
			});
        }

        else {
            var geocoder = new google.maps.Geocoder();
            
            geocoder.geocode( {'address':$loc}, function(results, status) {
                             
                if(status == google.maps.GeocoderStatus.OK) {
                    $currentLat = results[0].geometry.location.lat();
                    $currentLong = results[0].geometry.location.lng();
                }
            });

            //if the value on the var is not the same as the previous saved location
	        //call the api for a new restaurant
	    	if($loc != $savedlocation || checkChangeOnFilter()) {
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
        }
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
		geolocationCaller(function($loc, lat, long){
			$("#location").val($loc);
            $currentLong = long;
            $currentLat = lat;
		});
	});
    
    // Trigger event handler that will fire when apicaller is finished calling.
    $(document).on('updateinfo', function(event, data){
        $jsonobject = data;
        $savedlocation = $('#location').val();
        $savedFilters = getCurrentFilters();
        updateRestaurant($jsonobject);        
    });
  
    // Event handler for skip list link. Will display the items from the $skippedList
	$("#viewskipped").click(function(e){
		$skippedContent = "";
		for(var i=0; i<$skippedList.length; i++){
			$skipped_image = $skippedList[i].image_url.replace(new RegExp("o.jpg$"), "ms.jpg");	// changes small image to large
			$skippedContent+= "<a href='" + i + "'><h3>" + $skippedList[i].name + "</h3></a>";
			$skippedContent+= "<img class='img-thumbnail' src='" + $skipped_image + "'>";
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
	
	// Trigger event handler that will fire when business search caller finishes
	// Generates and updates HTMl content of exclude view when given business JSON object (data)
	// $(document).on('loadExcludedContent', function(event, data){
	// 	$excludedContent+= "<h3 class='" + data.id + "'>" + data.name + "</h3>";
	// 	$excludedContent+= "<img class='img-thumbnail " + data.id + "' src='" + data.image_url + "'>";
	// 	$excludedContent+= "<a href='#' id='" + data.id + "' class='text-muted  col-md-12 remove-exclude " + 
	// 		data.id + "'>Remove from exclude list</a></br></br>";
	// 	$excludedContent+= "<hr class='" + data.id + "'>";
	// 	$("#excluded").html($excludedContent);
	// });
	
	// Event handler for when the user clicks "remove from exclude list" link
	// Removes from exclude view and updates cookie
	
});

/**  
 *  A function that calls the api for a Restaurant JSON Object
 *  @param  $location   Location of the user
 */
function apiCaller($location, callback){
    $.ajax({
        type: 'GET',
        url: "scripts/fusionscript.php",
        dataType : "json",
        // data that is processed by the php (arguments)
        data: {location: $location,price: getCheckedPrices(),sort: getSortBy(),radius: getRadius(),categories: getCategories()},
        
        success:function(result){
            $(document).triggerHandler('updateinfo', [result]);
        },
        error:function(jqXHR, status, errorThrown){
        	console.log(jqXHR.responseText);
    		console.log(status);
    		console.log(errorThrown);
            console.log("Failed to load php");
            alert("Please enter a valid/more accurate location");
        }
    });
}


function getCheckedPrices(){

    $price_array = $("input[name=price]:checked");

    $price = "";
    $.each($price_array, function(i, $p){
    	if(i == $price_array.length-1){
    		$price = $price + $p.value;
    	}
    	else
    		$price = $price + $p.value + ",";
    });

    // check if price is empty, if so, change it to "1,2,3,4"
    if ($price == "") {
    	$price = "1,2,3,4";
    }
    console.log("price: " + $price)
    return $price;
}

function getSortBy(){
    return $("#sort-by").val()
}

function getRadius(){
	// converts user input from miles to meters for the api
	var radius = $("#filter-radius").val();
	if(radius > 20){
		$("#filter-radius").val(20);
		return 20*1609;
	}
	else
		return ($("#filter-radius").val())*1609;
}

function getCategories() {
    return $("#filter-categories").val().toLowerCase().replace(" ", "");
}


function checkChangeOnFilter(){
    if($savedFilters != getCurrentFilters()) {
        return true;
    }
    return false;
}


// checks the current filters and returns them packaged in a JSON object for comparison
function getCurrentFilters(){
	var filters = {};
	filters['price'] = getCheckedPrices();
	filters['radius'] = getRadius();
    filters['categories'] = getCategories();
    filters['sort'] = getSortBy()
	return JSON.stringify(filters);
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
			$image = $RESTAURANT_OBJ.image_url.replace(new RegExp("o.jpg$"), "ls.jpg");	// changes small image to large
			$name = $RESTAURANT_OBJ.name;
			$phone = $RESTAURANT_OBJ.display_phone;
			$addressObject = $RESTAURANT_OBJ.location.display_address;
			$city = $RESTAURANT_OBJ.location.city;
			$rating = "img/rating/" + $RESTAURANT_OBJ.rating + ".png";
			$review_count = $RESTAURANT_OBJ.review_count + " Reviews";
			$categories = $RESTAURANT_OBJ.categories;

			$price = "Price: <span id='price_green'>" + $RESTAURANT_OBJ.price +"</span><span id=price_gray>";
				for(var i = 0; i < (4-$RESTAURANT_OBJ.price.length); i++){
				$price += "$";
			}
			$price += "</span>";
				
			$url = $RESTAURANT_OBJ.url;

			$categories_content = $categories[0].title;
			for(var i = 1; i < $categories.length; i++){
				$categories_content += ", "+$categories[i].title;
			}

			if($image == ""){
			   $("#image").attr('src',"img/default-rest-pic.jpg");
			}
			else {
			   $("#image").attr('src',$image);
			}

			$("#name").html($name);
			$("#rating").attr('src', $rating);
			$("#img-link").attr('href', $url);
			$("#see-more").attr('href', $url);
			$("#address").text($addressObject);
			$("#phone").text($phone);
			$("#category").text($categories_content);
			$("#price").html($price);
			$("#review_count").text($review_count);

			//Collapses The Output Div
			$("#output").collapse("toggle");
			$("#output").removeAttr("id");

			//replaces Search Button to Disco Again
			$("#search").text("Disco Again");
			$repeat = false;

			// check if object is in favorite list, if not remove the class
			var found = false;
			$.each($favoriteList, function(i, restaurant){
				if($RESTAURANT_OBJ.id === restaurant.id){
					$("#favorite").addClass("clickedFav");
	  				$("#heart").addClass("clickedHeart");
	  				found = true;
	  				console.log("found a match")
				}
			})
			if(!found){
				$("#favorite").removeClass("clickedFav");
  				$("#heart").removeClass("clickedHeart");
  				console.log("did not find a match")
			}
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
    $image = $RESTAURANT_OBJ.image_url.replace(new RegExp("o.jpg$"), "ls.jpg");	// changes small image to large
    //console.log("FUCKIN URL: " + $image);
    $name = $RESTAURANT_OBJ.name;
    $phone = $RESTAURANT_OBJ.display_phone;
    $addressObject = $RESTAURANT_OBJ.location.display_address;
    $rating = "img/rating/" + $RESTAURANT_OBJ.rating + ".png";
    $review_count = $RESTAURANT_OBJ.review_count + " Reviews";
    $categories = $RESTAURANT_OBJ.categories;
	
	  $price = "Price: <span id='price_green'>" + $RESTAURANT_OBJ.price +"</span><span id=price_gray>";
		for(var i = 0; i < (4-$RESTAURANT_OBJ.price.length); i++){
			$price += "$";
		}
		$price += "</span>";
		
    $url = $RESTAURANT_OBJ.url;
    
    console.log("Simple Update URL: " + $url);
    
    $categories_content = $categories[0].title;
	for(var i = 1; i < $categories.length; i++){
		$categories_content += ", "+$categories[i].title;
	}
    
       if($image == ""){
            $("#image").attr('src',"img/default-rest-pic.jpg");
       }
       else {
           $("#image").attr('src',$image);
       }
    
    $("#name").html($name);
    $("#rating").attr('src', $rating);
    $("#img-link").attr('href', $url);
    $("#see-more").attr('href', $url);
    $("#address").text($addressObject);
    $("#phone").text($phone);
    $("#category").text($categories_content);
	$("#price").html($price);
	$("#review_count").text($review_count);
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
			var locObj = JSON.parse(locJSON);
			// Gets the formatted address of the geocode from the json result
			var locStr = locObj.results[0].formatted_address;
          
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
		var restLat = $RESTAURANT_OBJ.coordinates.latitude;
		var restLng = $RESTAURANT_OBJ.coordinates.longitude;
		var pointA = new google.maps.LatLng($currentLat, $currentLong);
		var pointB = new google.maps.LatLng(restLat, restLng);

		// Update the link to open maps in native app
		$("#map-app-link").attr('href', 
			'https://www.google.com/maps/dir/?api=1&parameters&destination=' + restLat + "," + restLng)

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
    
		calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);
	
		// include directions
		directionsDisplay.setMap(map);
		// this will clear the old directions panel first to prevent directions overflowing.
		document.getElementById('right-panel').innerHTML = '';
		// display directions
    	directionsDisplay.setPanel(document.getElementById('right-panel'));
	
		// Resizes panel height dynamically depending on map content
		$panelsize = $('#map').height() + $('#right-panel').height();
		console.log("Map height: "+$panelsize);
		$('#map-tab').height($panelsize);
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