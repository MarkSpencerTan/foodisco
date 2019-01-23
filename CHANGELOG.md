# Change Logs
====================
## v3.03
- Changed the way of getting yelp fusion API bearer by just using the API Key instead of posting to an auth url for it.
- Fixed empty price param on business search API, defaults to "1,2,3,4" if empty price filters

## v3.02
- Made user input miles instead of meters for Radius Filter
- Implemented Categories Filter

## v3.01
- Implemented Radius Filter
- Implemented Price Filter

## v3.00
- Added filter input fields and buttons

## v2.03
- Cleaned up user dropdown menu when user is logged in
- shows user profile picture, email, and name
- Implemented favorites button
- When user presses favorite button, the resturant is added to the database under their name

## v2.02
- Added login functionality. User can login to Facebook/Google or a specified email and password
- The login functionality uses Facebook and Google login API
- Implemented user login with a specified email and password
- When signing up for first time, user will get an email saying theyev been succesfully registered
- When user signs in, their basic information is stored on firebase database using Firebase API

## v2.01
- Formatted navagation bar to work better on mobile and on web
- Added login button with a dropdown menu
- Added favorites button to favorite a resturant
- Added sign in and sign up buttons

## v2.00
- Converted webapp Yelp API v2 to Yelp Fusion API v3

## v1.04
- Added directions from user to resturant from google maps api
- Added filter button
- Added About, User Manual, and Developers Guide to website

## v1.03
- Added script to show directions
- Added Google Maps api to show a map of the resturamnt
- Added Google Autocomplete functions to easily
  search locations in search bar
  
## v1.02
- Added scripts to handle displaying resturant results
- Added scripts to show skipped and exculded resturants
- Formatted webapp with css
- Added reverse geolocation functions

## v1.01
- Added yelp api functionality
- Created random generator function 
to randomly generate yelp api results
- Added search button to webapp

## v1.00
- Built the base website
- Added Foodisco logo and search bar
- Added basic elements to webapp
