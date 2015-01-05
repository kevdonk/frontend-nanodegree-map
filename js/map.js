function initMap(){map=new google.maps.Map(document.getElementById("map-canvas"),{zoom:12,disableDefaultUI:!0}),infowindow=new google.maps.InfoWindow,navigator.geolocation?(geolocSupport=!0,navigator.geolocation.getCurrentPosition(function(e){startLoc=new google.maps.LatLng(e.coords.latitude,e.coords.longitude),geocoder.geocode({latLng:startLoc},function(e,o){o==google.maps.GeocoderStatus.OK&&e[1]&&self.location(e[1].formatted_address.substr(0,e[1].formatted_address.indexOf(",")))}),map.setCenter(startLoc)},function(){handleNoGeo(geolocSupport)})):(geolocSupport=!1,handleNoGeo(geolocSupport));document.getElementById("location-search");youAreHere=new google.maps.Marker({map:map,title:"You are here",position:startLoc,icon:"img/lisa.png"})}function handleNoGeo(e){console.log(1==e?"browser supports geoloc, but failed":"no browser support for geoloc"),map.setCenter({lat:53.5485,lng:-113.519499})}function markAddress(e){if(/\S/.test(e.address1)&&void 0!=e.address1){address=e.address1+(e.city?", "+e.city:"")+(e.region?", "+e.region:"")+(e.postal_code?", "+e.postal_code:"");var o;switch(e.veg_level){case"1":o="007f00";break;case"2":o="009900";break;case"3":o="00b200";break;case"4":o="00cc00";break;case"5":o="00e500";break;default:o="ff0000"}iconImg="http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="+e.veg_level+"|"+o+"|000000",geoQuery="http://www.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluurn1ut2u%2Cax%3Do5-9wy5g0&location="+address,function(e,o,t){$.getJSON(geoQuery,function(s){if(0==s.info.statuscode)if(s.results.length>0){var r=new google.maps.LatLng(s.results[0].locations[0].latLng.lat,s.results[0].locations[0].latLng.lng);t.marker=new google.maps.Marker({position:r,map:map,title:t.name,icon:o}),t.times="",t.hours&&t.hours.forEach(function(e){t.times+="<br>"+e.days+": ",e.hours.forEach(function(e){t.times+=e+" "})}),t.content="<div class='infowindow'><span class='info-title'>"+t.name+"</span><br>"+e+"<br>"+(t.phone?t.phone+"<br>":"")+(t.website?"<a target='_new' href='"+t.website+"'>"+t.website+"</a>":"")+t.times,google.maps.event.addListener(t.marker,"click",function(){infowindow.setContent(t.content),infowindow.open(map,this),map.panTo(t.marker.getPosition())}),self.results.push(t)}else console.log("location not found: "+t);else console.log("geocode failed: "+t)})}(address,iconImg,e)}}function MapViewModel(){initMap();self=this,self.location=ko.observable(),self.filter=ko.observable(""),self.locationError=ko.observable(!1),self.results=ko.observableArray(),self.filteredResults=ko.computed(function(){var e=self.filter().toLowerCase();return e?ko.utils.arrayFilter(self.results(),function(o){o.marker.setMap(map);var t=o.name?o.name.toLowerCase().indexOf(e)>=0:!1,s=o.short_description?o.short_description.toLowerCase().indexOf(e)>=0:!1,r=o.cuisines[0]?o.cuisines[0].toLowerCase().indexOf(e)>=0:!1,n=o.veg_level?o.veg_level.toLowerCase().indexOf(e)>=0:!1,a=o.veg_level_description?o.veg_level_description.toLowerCase()==e:!1;return t||s||r||n||a?!0:(o.marker.setMap(null),!1)}):(ko.utils.arrayFilter(self.results(),function(e){e.marker.setMap(map)}),self.results())}),self.resultsVisible=ko.observable(!0),self.resultsToggle=ko.computed(function(){return self.resultsVisible()?"-":"+"}),self.toggleResults=function(){self.resultsVisible(!self.resultsVisible())},self.listClick=function(e){google.maps.event.trigger(e.marker,"click")},self.getLocation=ko.computed(function(){geocoder=new google.maps.Geocoder,geocoder.geocode({address:self.location()},function(e,o){if(o==google.maps.GeocoderStatus.OK){var t=e[0].geometry.location;self.locationError(!1),map.setCenter(t),youAreHere.setPosition(t),ko.utils.arrayForEach(self.results(),function(e){e.marker.setMap(null)}),self.results.removeAll();var s="http://www.vegguide.org/search/by-lat-long/"+t.lat()+","+t.lng();return $.getJSON(s,function(e){e.entries.forEach(function(e){markAddress(e)})}),t}return self.locationError(!0),startLoc})})}var geocoder,youAreHere,startLoc,geolocSupport,infowindow;$(document).ready(function(){ko.applyBindings(new MapViewModel)});