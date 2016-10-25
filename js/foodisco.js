$RESTAURANT_OBJ = null;

//The Main of the script
$('document').ready(function() {
    
    // attach click event handler to search button
    $('#search').click(function(e) {
        e.preventDefault();
        $loc = $('#location').val();    //takes location bar's userinput
    
        apiCaller($loc);
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
		geolocationCaller(function(loc){
			$("#location").val(loc);
		});
	});
});

/**  
 *  A function that calls the api for a Restaurant JSON Object
 *  @param  $location   Location of the user
 */
function apiCaller($location){
    $.ajax({
        type: 'GET',
        url: "scripts/sample.php",
        dataType : "json",
        // data that is processed by the php (arguments)
        data: {location:$location
              },
        
        success:function(result){
//            console.log(JSON.stringify(result, null, 4));
            updateRestaurant(result);
        },
        error:function(){
            console.log("Failed to load php");
            alert("Please enter a valid/more accurate location");
        }
    });
}

function updateRestaurant(jsonobj){
    $restaurants = jsonobj.businesses;
    
    $pos = Math.floor(Math.random() * $restaurants.length);  //creates a random integer(0-15)
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
			reverseGeocodingCaller(locObj.location.lat, locObj.location.lng, autofillCallback);
		},
		error:function(){
			console.log("Geolocation failed");
			//alert("");
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
			autofillCallback(locStr);
		},
		error:function(){
			console.log("Reverse geocoding failed");
			//alert("");
		}
	});	
	}, 'text');
	
}