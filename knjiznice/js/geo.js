var map;
var markersHosp = [];
var markersHealth = [];
var prostor;

window.initMap = function() {
    var point = new google.maps.LatLng(46.05226714, 14.50126648);
    var infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
      center: point,
      zoom: 8
    });
    
    // INPUT
    var input = document.getElementById('pac-input');

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();

      // If the place has a geometry, then show it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        marker.setIcon(({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        prostor = place;
        geoHosp(place);
        geoHealth(place);
    });
}

function geoHosp(place) {
    var service = new google.maps.places.PlacesService(map);
        if(place == 1) {
        place = prostor;
        service.nearbySearch({
        location: place.geometry.location,
        radius: 1000,
        type: ['doctor', 'dentist']
    }, callbackHosp); }
    clearMarkersHealth();
}

function callbackHosp(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarkerHosp(results[i]);
        }
    }
}

function createMarkerHosp(place) {
    var hospIcon = {
        url: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=Z|DC143C|000000", // url
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(15, 20)
    };
    
    var mark = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        icon: hospIcon,
    });
    markersHosp.push(mark);
}

function setMapOnHosp(map) {
  for (var i = 0; i < markersHosp.length; i++) {
    markersHosp[i].setMap(map);
  }
}

function clearMarkersHosp() {
  setMapOnHosp(null);
}

function geoHealth(place) {
    var service = new google.maps.places.PlacesService(map);
    if(place == 1) {
        place = prostor;
        service.nearbySearch({
        location: place.geometry.location,
        radius: 1200,
        type: ['health']
        }, callbackHealth);
    }
    clearMarkersHosp();
}

function callbackHealth(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarkerHealth(results[i]);
        }
    }
}

function createMarkerHealth(place) {
    var hospIcon = {
        url: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=L|32CD32|000000", // url
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(15, 20)
    };
    
    var mark = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        icon: hospIcon,
    });
    markersHealth.push(mark);
}

function setMapOnHealth(map) {
  for (var i = 0; i < markersHealth.length; i++) {
    markersHealth[i].setMap(map);
  }
}

function clearMarkersHealth() {
  setMapOnHealth(null);
}
