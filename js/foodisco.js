$RESTAURANT_OBJ = null;
$jsonobject = null;
$savedlocation = "";
$skippedList = [];
$currentLong = 100;
$currentLat = -100;

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
        else
            updateRestaurant($jsonobject);
        $('#description-tab').tab('show');
    });
    // Enter key pressed on the location bar
    $('#location').keypress(function(e){
        if(e.which == 13) {
            $('#search').click();//Trigger search button click event
            
        }
    });
	//gps
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

function updateRestaurant(jsonobj){
    $restaurants = jsonobj.businesses;
    
    $pos = Math.floor(Math.random() * $restaurants.length);  //chooses random index
    console.log("Pos: "+$pos);
    
    console.log($restaurants[$pos]);

    $RESTAURANT_OBJ = $restaurants[$pos];
    $image = $RESTAURANT_OBJ.image_url;
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
    
    //remove the restaurant in the view and add it to the skipped list
    $skippedList.push($restaurants.splice($pos, 1)[0]);
    console.log($skippedList);
	//TODO: add restaurants to skipped list on frontend
	//when restaurants list is empty, query API again
	//with original length as offset. &offset=LENGTH or something like that.
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
		success:function(result){
			var locJSON = JSON.stringify(result, null, 4);
			var locObj = JSON.parse(locJSON);
			var city = locObj.results[0].address_components[2].long_name;
			var state = locObj.results[0].address_components[4].short_name;
			var country = locObj.results[0].address_components[5].short_name;
			var locStr = city + ", " + state + ", " + country;
          
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
            
            var map;
            var marker;
            var latlng = {lat: $currentLat, lng: $currentLong};
            
            var restLoc = 
            map = new google.maps.Map(document.getElementById('map'), {
                  zoom: 14,
            });
            
            marker = new google.maps.Marker({
                position: latlng,
                map: map
            });
     
            var restMarker;
            var restLat = $RESTAURANT_OBJ.location.coordinate.latitude;
            var restLng = $RESTAURANT_OBJ.location.coordinate.longitude;
          
            restMarker = new google.maps.Marker({
                position: {lat: restLat, lng: restLng},
                map: map,
                icon: "../img/foodiscomarker.png"
            });
          
            
          
            google.maps.event.addListenerOnce(map, 'idle', function() {
                google.maps.event.trigger(map, 'resize');
                map.setCenter(latlng);
            });
    }