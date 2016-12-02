#!/usr/bin/php
<?php

/**
 * revision of sample.php to search for a business by id
 */

// Enter the path that the oauth library is in relation to the php file
require_once('lib/OAuth.php');

// Set your OAuth credentials here  
// These credentials can be obtained from the 'Manage API Access' page in the
// developers documentation (http://www.yelp.com/developers)


$CONSUMER_KEY = fread(fopen('keys/consumerkey.txt', 'r'), filesize('keys/consumerkey.txt'));
$CONSUMER_SECRET = fread(fopen('keys/consumersecret.txt','r'), filesize('keys/consumersecret.txt'));
$TOKEN = fread(fopen('keys/token.txt','r'), filesize('keys/token.txt'));
$TOKEN_SECRET = fread(fopen('keys/tokensecret.txt','r'), filesize('keys/tokensecret.txt'));


$API_HOST = 'api.yelp.com';
/*$DEFAULT_TERM = 'dinner';
$DEFAULT_LOCATION = 'Long Beach, CA';
$SEARCH_LIMIT = 15;
$SEARCH_RADIUS = 2414.02; //1.5miles
$SEARCH_PATH = '/v2/search/'; */
$BUSINESS_PATH = '/v2/business/';

/** 
 * Makes a request to the Yelp API and returns the response
 * 
 * @param    $host    The domain host of the API 
 * @param    $path    The path of the APi after the domain
 * @return   The JSON response from the request      
 */
function request($host, $path) {
    $unsigned_url = "https://" . $host . $path;

    // Token object built using the OAuth library
    $token = new OAuthToken($GLOBALS['TOKEN'], $GLOBALS['TOKEN_SECRET']);

    // Consumer object built using the OAuth library
    $consumer = new OAuthConsumer($GLOBALS['CONSUMER_KEY'], $GLOBALS['CONSUMER_SECRET']);

    // Yelp uses HMAC SHA1 encoding
    $signature_method = new OAuthSignatureMethod_HMAC_SHA1();

    $oauthrequest = OAuthRequest::from_consumer_and_token(
        $consumer, 
        $token, 
        'GET', 
        $unsigned_url
    );
    
    // Sign the request
    $oauthrequest->sign_request($signature_method, $consumer, $token);
    
    // Get the signed URL
    $signed_url = $oauthrequest->to_url();
    
    // Send Yelp API Call
    try {
        $ch = curl_init($signed_url);
        if (FALSE === $ch)
            throw new Exception('Failed to initialize');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $data = curl_exec($ch);

        if (FALSE === $data)
            throw new Exception(curl_error($ch), curl_errno($ch));
        $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (200 != $http_status)
            throw new Exception($data, $http_status);

        curl_close($ch);
    } catch(Exception $e) {
        trigger_error(sprintf(
            'Curl failed with error #%d: %s',
            $e->getCode(), $e->getMessage()),
            E_USER_ERROR);
    }
    
    return $data;
}

/**
 * Query the Business API by business_id
 * 
 * @param    $business_id    The ID of the business to query
 * @return   The JSON response from the request 
 */
function get_business($business_id) {
    $business_path = $GLOBALS['BUSINESS_PATH'] . urlencode($business_id);
    
    return request($GLOBALS['API_HOST'], $business_path);
}

/**
 * Queries the API by the input values from the user 
 * 
 * @param    $business_id    Yelp id of the business
 */
function query_api($business_id) {     
    $response = get_business($business_id);
    
    echo $response;
}

/*PhP to console debugger. prints things to the console*/
function debug_to_console( $data ) {
    if ( is_array( $data ) )
        $output = "<script>console.log( 'Debug Objects: " . implode( ',', $data) . "' );</script>";
    else
        $output = "<script>console.log( 'Debug Objects: " . $data . "' );</script>";

    echo $output;
}

/**
 * User input is handled here 
 */
$business_id = $_GET['business_id'];
query_api($business_id);

?>
