frontend-nanodegree-map
=======================
Project 5 of the Udacity Frontend Nanodegree

Dedicated to Lisa, who is more beautiful than her icon lets on. 

This app attempts to get your location and shows the vegan/vegetarian venues in the area

It allows you to manually enter locations, and is designed to work well on any device


Can be viewed at http://kevdonk.github.io/frontend-nanodegree-map/

Instructions
================

Enter a location in the search bar at the bottom of the screen (or turn on location services for auto-detect)

Filter search results by typing a query in the search bar in the upper right hand corner

The list will contain any items that match contain query in the name, description, cuisine, or veg level (# or description)

Clicking on a marker or list item centers the map on the item and gives an info window with the address and website


TODO:
add additional info to infowindows (hours/price)


To build the site
==========================
1) Make sure you have Gulp and Node installed http://gulpjs.com http://nodejs.org

2) Install dependencies (in project folder) npm install

3) Run build task gulp build

The site will now be built and optimized in the 'dist/' folder

Note: if you inspect the gulpfile.js, you will see the 'deploy' task which will push the 'dist/' folder to GitHub
