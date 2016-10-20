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
    
    $pos = Math.floor(Math.random() * 15);  //creates a random integer(0-15)
    console.log("Pos: "+$pos);
    
    console.log($restaurants[$pos]);
    $RESTAURANT_OBJ = $restaurants[$pos];
    $image = $RESTAURANT_OBJ.image_url;
    $name = $RESTAURANT_OBJ.name;
    
    $("#name").html($name);
    $("#image").attr('src',$image);
    
    //Collapses The Output Div
    $("#output").collapse("toggle");
    $("#output").removeAttr("id");
    
    //replaces Search Button to Disco Again
    $("#search").text("Disco Again");
}
