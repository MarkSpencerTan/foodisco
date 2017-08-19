# Foodisco Webapp
====================

## Project Description
--------------------
The goal of Foodisco is to improve the user experience of finding a place
to eat. Foodisco uses the location of the user to recommend a random
restaurant in the nearby area. Foodisco saves the user time in searching
and deciding where to go.


# Features
--------------------
- Easily get the location of user using geolocation
- Easily type in address using autocomplete 
- Discover new resutrants in your area
- Easy to use directions already generated when searching resturants
- Easily login to your accounts (Facebook/Google)
- Easily create account with email and password
- Easily save your favorite resturants to your profile


## Components and Technologies
--------------------
- <a href=https://www.yelp.com/developers/documentation/v3/business_search>Yelp Fusion Api v3</a>
- <a href=https://developers.google.com/maps/documentation/javascript>Google Maps Api</a> 
- <a href=https://developers.google.com/maps/documentation/geolocation/intro>Google Maps Geolocation API</a> 
- <a href=https://developers.google.com/maps/documentation/geocoding/intro>Google Maps Geocoding API</a>
- <a href=https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete>Google Maps Place Autocomplete API</a>
- <a href=http://getbootstrap.com>Bootstrap v3</a>
- <a href=http://jquery.com>jQuery v3</a>
- <a href=https://firebase.google.com>Firebase</a>

# Change Logs
====================

## v1.00
- Built the base website
- Added Foodisco logo and search bar
- Added basic elements to webapp

## v1.01
- Added yelp api functionality
- Created random generator function 
to randomly generate yelp api results
- Added search button to webapp

## v1.02
- Added scripts to handle displaying resturant results
- Added scripts to show skipped and exculded resturants
- Formatted webapp with css
- Added reverse geolocation functions

## v1.03
- Added script to show directions
- Added Google Maps api to show a map of the resturamnt
- Added Google Autocomplete functions to easily
  search locations in search bar

## v1.04
- Added directions from user to resturant from google maps api
- Added filter button
- Added About, User Manual, and Developers Guide to website

## v2.00
- Converted webapp Yelp API v2 to Yelp Fusion API v3

## v2.01
- Formatted navagation bar to work better on mobile and on web
- Added login button with a dropdown menu
- Added favorites button to favorite a resturant
- Added sign in and sign up buttons

## v2.02
- Added login functionality. User can login to Facebook/Google or a specified email and password
- The login functionality uses Facebook and Google login API
- Implemented user login with a specified email and password
- When signing up for first time, user will get an email saying theyev been succesfully registered
- When user signs in, their basic information is stored on firebase database using Firebase API

## v2.03
- Cleaned up user dropdown menu when user is logged in
- shows user profile picture, email, and name
- Implemented favorites button
- When user presses favorite button, the resturant is added to the database under their name
## v3.00
- Added filter input fields and buttons

## v3.01
- Implemented Radius Filter
- Implemented Price Filter

## v3.02
- Made user input miles instead of meters for Radius Filter
- Implemented Categories Filter