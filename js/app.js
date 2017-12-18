var locationData = [
        {lat : 6.3830928, lng : 9.386735399999999, name : "Obudu Cattle Ranch", marker : null},
        {lat : -17.9242993, lng : 25.8572003, name: "Angels pool", marker : null},
        {lat : 29.9757265, lng : 31.1308001, name: "Tomb of Nefertoubtah", marker : null},
        {lat : -33.804744, lng : 18.3523277, name: "Nelson Mandela's cell", marker : null},
        {lat : 6.4237837, lng : 3.4620667, name: "Lekki Leisure Lake", marker : null}
    ];

function ViewModel(){

    var self = this;

    this.searchStr = ko.observable("");
    this.places = ko.observableArray(locationData);
    this.filteredPlaces = locationData;
    this.map;
    this.markers = [];

    //This method created markers on the map,
    //by looping through the filteredPlaces array
    this.createMakers = function(map){
        self.map = map;//initialize the map object

        self.filteredPlaces.map(place => {

           var marker = new google.maps.Marker({
                position: place,
                map: map,
                title: place.name
            });

            marker.addListener('click',function(){

                if(marker.getAnimation() == null){
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function(){
                        marker.setAnimation(null);
                    },800)
                }
                else{
                    marker.setAnimation(null);
                }

                //creating info infowindow
                self.getLocationData(marker);
            })

            place.marker = marker;

            self.markers.push(marker);
        })
    }


    /**
     * This method is called a marker is clicked, 
     * it makes a GET request to foursqare API, to fetch;
     * location address or name
     */
    this.getLocationData = function(marker){

        console.log(marker.getPosition().lat() + " - " + marker.getPosition().lng());
        var client_id= "XN3RHYMAVM1V0L51KJ33I4Q4ZEOH0UD4TS4LTGXAPEPGSBGP";
        var client_secret= "0BGI12EXPYCP51WGYGZJOBUIKSX0WOO4IUIA1352GPM1CDSH";
        var v = "20170801"
        var ll= marker.getPosition().lat() + "," + marker.getPosition().lng()
        var url = "https://api.foursquare.com/v2/venues/search?ll="+ll+"&client_id="+client_id+"&client_secret="+client_secret+"&v=20170801"+"&limit=1";

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(data){
                var name = data.response.venues ? data.response.venues[0].name : place.name;
                var addr = data.response.venues[0].location.formattedAddress.join(", ");
                self.createInfoWindow(name,addr,marker);
            },
            error: function(xhr,errStatus){
                alert(errStatus);
            }
        })


    }


    //remove all markers from the marker array
    this.clearMarkers = function(){

        self.markers.map(marker => {

            marker.setMap(null);
        })

        self.markers = [];
    }


    //thi methods creates and infoWindow above a market when clicked
    this.createInfoWindow = function(name, addr, marker){

        var contentString = "<div><h3>"+ name + "</h3> <hr>" + "<p>"+ addr + "</p></div>";

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        infowindow.open(self.map, marker);
    }


    //This method is used to filter list of locations
    this.search = function(){ 

        //remove markers from map
        self.clearMarkers();
        
        //if filter box is empty show all locations
        if(self.searchStr().length == 0){
            self.filteredPlaces = locationData;
            self.places(self.filteredPlaces);
            self.createMakers(self.map);
            return;
        }

        self.filteredPlaces = locationData.filter(place => {
            return place.name.toLowerCase().indexOf(self.searchStr().toLowerCase()) !== -1
        });

        self.places(self.filteredPlaces);
        self.createMakers(self.map);

    }

    //This is an event handler for places list click event
    this.placeClicked = function(place){
        google.maps.event.trigger(place.marker, "click");
    }
}

var vm = new ViewModel();
ko.applyBindings(vm)