<?php
/**
 * Yelp Fusion API code sample.
 *
 * This program demonstrates the capability of the Yelp Fusion API
 * by using the Business Search API to query for businesses by a 
 * search term and location, and the Business API to query additional 
 * information about the top result from the search query.
 * 
 * Please refer to http://www.yelp.com/developers/v3/documentation 
 * for the API documentation.
 * 
 * Sample usage of the program:
 * `php sample.php --term="dinner" --location="San Francisco, CA"`
 */
// OAuth credential placeholders that must be filled in by users.
// You can find them on
// https://www.yelp.com/developers/v3/manage_app
include("keys/fusion_keys.php");

// Complain if credentials haven't been filled out.
assert($API_KEY, "Please supply your client_secret.");

// API constants, you shouldn't have to change these.
$API_HOST = "https://api.yelp.com";
$SEARCH_PATH = "/v3/businesses/search";
$BUSINESS_PATH = "/v3/businesses/";  // Business ID will come after slash.
$TOKEN_PATH = "/oauth2/token";
$GRANT_TYPE = "client_credentials";
// Defaults for our simple example.
$DEFAULT_TERM = "food";
$DEFAULT_LOCATION = "Long Beach, CA";
$SEARCH_LIMIT = 50;

/** 
 * Makes a request to the Yelp API and returns the response
 * 
 * @param    $host    The domain host of the API 
 * @param    $path    The path of the API after the domain.
 * @param    $url_params    Array of query-string parameters.
 * @return   The JSON response from the request      
 */
function request($host, $path, $url_params = array()) {
    // Send Yelp API Call
    try {
        $curl = curl_init();
        if (FALSE === $curl)
            throw new Exception('Failed to initialize');
        $url = $host . $path . "?" . http_build_query($url_params);
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,  // Capture response.
            CURLOPT_ENCODING => "",  // Accept gzip/deflate/whatever.
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "authorization: Bearer " . $GLOBALS['API_KEY'],
                "cache-control: no-cache",
            ),
        ));
        $response = curl_exec($curl);
        if (FALSE === $response)
            throw new Exception(curl_error($curl), curl_errno($curl));
        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        if (200 != $http_status)
            throw new Exception($response, $http_status);
        curl_close($curl);
    } catch(Exception $e) {
        trigger_error(sprintf(
            'Curl failed with error #%d: %s',
            $e->getCode(), $e->getMessage()),
            E_USER_ERROR);
    }
    return $response;
}
/**
 * Query the Search API by a search term and location 
 * 
 * @param    $term        The search term passed to the API 
 * @param    $location    The search location passed to the API 
 * @return   The JSON response from the request 
 */
function search($term, $location, $price, $radius, $categories, $sort) {
    $url_params = array();
    
    $url_params['term'] = $term;
    $url_params['location'] = $location;
    $url_params['limit'] = $GLOBALS['SEARCH_LIMIT'];
	$url_params['open_now'] = true;
    $url_params['price'] = $price;
    $url_params['radius'] = $radius;
    $url_params['categories'] = $categories;
    $url_params['sort_by'] = $sort;
    
    return request($GLOBALS['API_HOST'], $GLOBALS['SEARCH_PATH'], $url_params);
}
/**
 * Query the Business API by business_id
 * 
 * @param    $bearer_token   API bearer token is just api_key
 * @param    $business_id    The ID of the business to query
 * @return   The JSON response from the request 
 */
function get_business($bearer_token, $business_id) {
    $business_path = $GLOBALS['BUSINESS_PATH'] . urlencode($business_id);
    
    return request($GLOBALS['API_HOST'], $business_path);
}
/**
 * Queries the API by the input values from the user 
 * 
 * @param    $term        The search term to query
 * @param    $location    The location of the business to query
 */
function query_api($term, $location, $price, $radius, $categories, $sort) {     
    $response = search($term, $location, $price, $radius, $categories, $sort);
    echo $response;
}

/**
 * User input is handled here 
 */
$term = "restaurants";
$location= $_GET['location'];
$price = $_GET['price'];
$radius = $_GET['radius'];
$categories = $_GET['categories'];
$sort = $_GET['sort'];
query_api($term, $location, $price, $radius, $categories, $sort);
?>