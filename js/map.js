var geocoder;
var youAreHere;
var startLoc;
var geolocSupport = new Boolean();

function initMap() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
		zoom: 10,
		disableDefaultUI: true
	});
	//attempt to get current location from: https://developers.google.com/maps/articles/geolocation
	if(navigator.geolocation) {
		geolocSupport = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			startLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			//use reverse geocoding to get address
			geocoder.geocode({'latLng': startLoc}, function(result, status) {
				if(status == google.maps.GeocoderStatus.OK) {
					if(result[1]){						
						console.log(result[1]);
						//set location to result of search before comma (e.g. 'Edmonton', AB, Canada)
						self.location(result[1].formatted_address.substr(0, result[1].formatted_address.indexOf(',')));
				}
				}
			});
			map.setCenter(startLoc);
		}, function() {
			handleNoGeo(geolocSupport);
		});
	}
	else {
		geolocSupport = false;
		handleNoGeo(geolocSupport);
	}
  //add location search bar to controls
  var locationBar = document.getElementById('location-search');
//  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationBar);
  youAreHere = new google.maps.Marker({
  	map: map,
  	title: 'You are here',
  	position: startLoc
  	//xx add icon (donk?)
  });
}

//xx handle geoloc failure better
//xx perhaps ask for permission
function handleNoGeo(errorFlag) {
	if(errorFlag == true) {
		console.log("browser supports geoloc, but failed");
	}
	else {
		console.log("no browser support for geoloc");
	}
	map.setCenter({lat: 53.5485, lng: -113.519499});
}

function markAddress(venue) {
	//from http://stackoverflow.com/questions/2031085/how-can-i-check-if-string-contains-characters-whitespace-not-just-whitespace
	if (/\S/.test(venue.address1) && venue.address1 != undefined) {    //venue has defined, non-whitespace address
		address =	(venue.address1)
						+ (venue.city ? ", " + venue.city: "")
						+ (venue.country ? ", " + venue.country : "") 
						+ (venue.postal_code ? ", " + venue.postal_code : "");
		//xx change to mapquest - consider batching
		geoQuery = "https://api.opencagedata.com/geocode/v1/google-v3-json?address=" + address + "&key=7a13e1e483d6ea1edbddba38eaa2caca&pretty=1";
		console.log(venue.name);
		console.log(address);
		(function(address) {
			$.getJSON(geoQuery, function(geoData) {
				if(geoData.status == "OK") {
					//if location was found, add a marker
					if(geoData.results.length > 0)
					{
						console.log(venue.name);
						console.log(address);
						console.log(geoData.results[0].geometry.location);
						var markerLocation = new google.maps.LatLng(geoData.results[0].geometry.location.lat, geoData.results[0].geometry.location.lng);
						self.markers.push(new google.maps.Marker({
							position: markerLocation,
							map: map,
							title: venue.name
							//xx icons
						}));
						self.results.push(venue);
					}
					else {
						//location could not be found
						console.log("location not found: " + venue);
					}
				}
				else {
					//geocode failed
					console.log("geocode failed: " + venue);
				}
			});
		})(address);
	}
}


function MapViewModel() {
	initMap(); 
	var temp = []; 		//temporarily store JSON results
	self = this;
	self.location = ko.observable();
	self.locationError = ko.observable(false);
	self.results = ko.observableArray();
	self.markers = ko.observableArray();
	self.resultsVisible = ko.observable(true);
	self.resultsToggle = ko.computed(function() {
		return self.resultsVisible() ? "-" : "+"; 
	});
	self.toggleResults = function() {
		self.resultsVisible(!self.resultsVisible());
	};
	//geocode address from: https://developers.google.com/maps/documentation/javascript/geocoding
	self.getLocation = ko.computed(function() {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( {address: self.location()}, function(results,status) {
			//check if geocode was succesful
			if (status == google.maps.GeocoderStatus.OK) {
				var loc = results[0].geometry.location;
				self.locationError(false);	
				//center map and display marker
				map.setCenter(loc);
				youAreHere.setPosition(loc);
				//clear results and markers
				self.results.removeAll();
				//xx change to forEach
				//http://stackoverflow.com/questions/9351939/using-ko-utils-arrayforeach-to-iterate-over-a-observablearray
				for(var m=0, l=self.markers().length;m<l;m++) {
					self.markers()[m].setMap(null);
				} 
				self.markers.removeAll();
				//retrieve results from VegGuide
				var apiQuery = "http://www.vegguide.org/search/by-lat-long/" + loc.lat() + "," + loc.lng();
				$.getJSON(apiQuery, function(data) {
					data.entries.forEach(function(c) {
							markAddress(c);
					});
				}
				//xx just see what this spits out
				console.log("marker: ");
				console.log(self.markers()[0]);
				return loc;
			});
			}
			else {
				//could not find location based on search
				self.locationError(true);
				return startLoc;
			}

		});
	});
}
$(document).ready(function() {
	ko.applyBindings(new MapViewModel());
});
	/*
https://developers.google.com/maps/documentation/directions/
https://developers.google.com/maps/documentation/timezone/

	functionality:
	show vegan/veggie (toggle by veg_level) restaurants by location
		show hours - toggle by open now?
		handle errors
		markers based on level
		donk marker for 'you are here'
	provide useful info:
		directions?
		price range, hours

sidebar
	website address
	short description
	click to reveal
	hours
	street address


	arrange by distance
	optimized performance (mobile)
	navigation? backspace/back browser button should take you back?
	search bar

	options for walk/bike/drive/public etc ?
	https://developers.google.com/maps/documentation/javascript/trafficlayer#bicycling_layer
	

	list view of locations
		easy to toggle visibility
	additional functionality when list view is clicked
		perhaps a 'popup' with more detailed info / images etc.
	if you click on an entry, it slides open and shows more info
	and gives directions?

		veg guide api
		http://www.vegguide.org/site/api-docs

		Region
			name
			is_country  

			time_zone ?
			entry_count
			uri
			entries_uri

			if they exist
			parent    //regions
			children  //regions
			comments

		Entry
			name
			distance
			sortable_name
			short_description

			//address info
			address1
			address2
			neighborhood
			city
			region
			postal_code
			country

			directions
			phone
			website
			veg_level
			veg_level_description
							0 - Not Veg-Friendly     rare
							1 - Vegetarian-Friendly
							2 - Vegan-Friendly
							3 - Vegetarian (But Not Vegan-Friendly) rare
							4 - Vegetarian
							5 - Vegan
			price_range
			hours
							[
							    {
							        days  => 'Mon - Fri',
							        hours => ['10:30am - 2pm', '5pm - 10pm']
							    },
							    {
							        days  => 'Sat - Sun',
							        hours => ['closed']
							    }
							]
			is_wheelchar_accessible

			is_cash_only
			payment_options

			rating_count
			weighted_rating

			categories  // e.g. bar, general store

			cuisines

			images

			uri
			reviews_uri


	*/
