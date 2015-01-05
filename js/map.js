var geocoder;
var youAreHere;
var startLoc;
var geolocSupport;
var infowindow;


function initMap() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    disableDefaultUI: true
  });
  infowindow = new google.maps.InfoWindow();
  //attempt to get current location from: https://developers.google.com/maps/articles/geolocation
  if(navigator.geolocation) {
    geolocSupport = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      startLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      //use reverse geocoding to get address
      geocoder.geocode({'latLng': startLoc}, function(result, status) {
        if(status == google.maps.GeocoderStatus.OK) {
          if(result[1]){            
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
    position: startLoc,
    icon: 'img/lisa.png'
  });
}

function handleNoGeo(errorFlag) {
  if(errorFlag == true) {
    console.log("browser supports geoloc, but failed");
  }
  else {
    console.log("no browser support for geoloc");
  }
  map.setCenter({lat: 53.5485, lng: -113.519499});
}
//convert address to lat, lng, place a marker and add to result list
function markAddress(venue) {
  //from http://stackoverflow.com/questions/2031085/how-can-i-check-if-string-contains-characters-whitespace-not-just-whitespace
  if (/\S/.test(venue.address1) && venue.address1 != undefined) {    //venue has defined, non-whitespace address
    address = (venue.address1)
            + (venue.city ? ", " + venue.city : "")
            + (venue.region ? ", " + venue.region : "")
            + (venue.postal_code ? ", " + venue.postal_code : "");
    var color;
    switch(venue.veg_level) {
      case "1":
        color = "007f00";
        break;
      case "2":
        color = "009900";
        break;      
      case "3":
        color = "00b200";
        break;
      case "4":
        color = "00cc00";
        break;              
      case "5":
        color = "00e500";
        break;
      default:
        color = "ff0000";
        break;      
    }

    iconImg = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + venue.veg_level + "|" + color + "|000000";
    geoQuery = "http://www.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluurn1ut2u%2Cax%3Do5-9wy5g0&location=" + address;
    (function(address, iconImg, venue) {
      $.getJSON(geoQuery, function(geoData) {
        if(geoData.info.statuscode == 0) {
          //if location was found, add a marker
          if(geoData.results.length > 0)
          {
            var markerLocation = new google.maps.LatLng(geoData.results[0].locations[0].latLng.lat, geoData.results[0].locations[0].latLng.lng);
            venue.marker = new google.maps.Marker({
              position: markerLocation,
              map: map,
              title: venue.name,
              icon: iconImg  
            });
            venue.times = "";
            if(venue.hours) {
              venue.hours.forEach(function(o) {
                venue.times += "<br>" + o.days + ": "
                o.hours.forEach(function(i) {
                   venue.times+= i + " ";
                });
              });
            }
            venue.content = "<div class='infowindow'><span class='info-title'>" + venue.name + "</span><br>"
              + address + "<br>" 
              + (venue.phone ? venue.phone + "<br>" : "")
              + (venue.website ? "<a target='_new' href='" + venue.website + "'>" +  venue.website + "</a>" : "")
              + venue.times;
              +"</div>"; 
            google.maps.event.addListener(venue.marker, 'click', function() {
              infowindow.setContent(venue.content);
              infowindow.open(map, this);
              map.panTo(venue.marker.getPosition());
            });

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
    })(address, iconImg, venue);
  }
}


function MapViewModel() {
  initMap(); 
  var temp = [];    //temporarily store JSON results
  self = this;
  self.location = ko.observable();
  self.filter = ko.observable("");
  self.locationError = ko.observable(false);
  self.results = ko.observableArray();
  self.filteredResults = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if(!filter) {
      ko.utils.arrayFilter(self.results(), function(result) {
        result.marker.setMap(map);
      });
      return self.results();
    } else {
      return ko.utils.arrayFilter(self.results(), function(result) {
          result.marker.setMap(map);
          var checkName = result.name ? result.name.toLowerCase().indexOf(filter) >= 0 : false;
          var checkDesc = result.short_description ? result.short_description.toLowerCase().indexOf(filter) >= 0 : false;
          var checkCuisine = result.cuisines[0] ? result.cuisines[0].toLowerCase().indexOf(filter) >= 0 : false;
          var checkVegLevel = result.veg_level ? result.veg_level.toLowerCase().indexOf(filter) >= 0 : false;
          var checkVegDesc = result.veg_level_description ? result.veg_level_description.toLowerCase() == filter : false;
          if (checkName || checkDesc || checkCuisine || checkVegLevel || checkVegDesc) {
            return true;
          } else {
            result.marker.setMap(null);
            return false;
          }
      });
    }
  });
  self.resultsVisible = ko.observable(true);
  self.resultsToggle = ko.computed(function() {
    return self.resultsVisible() ? "-" : "+"; 
  });
  self.toggleResults = function() {
    self.resultsVisible(!self.resultsVisible());
  };
  //handle clicking a list item
  self.listClick = function(listItem) {
    google.maps.event.trigger(listItem.marker, 'click');
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
        ko.utils.arrayForEach(self.results(), function(m) {
          m.marker.setMap(null);
        });
        self.results.removeAll();
        //retrieve results from VegGuide
        var apiQuery = "http://www.vegguide.org/search/by-lat-long/" + loc.lat() + "," + loc.lng();
        $.getJSON(apiQuery, function(data) {
          data.entries.forEach(function(c) {
              markAddress(c);
          });
        });
        return loc;
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
TODO: add hours to infowindow?
    price range?

  gulp build

  entries have:
  
      phone

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

      images

  */
