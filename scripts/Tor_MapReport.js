var map;
var reports = [];
var markers = [];
var infoWin = [];
var lastInfoWin;

function initialize() {

// Use HTML5 Geolocation to find user location.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        //document.getElementById('map-canvas').innerHTML = "Geolocation is not supported by this browser."; 
        showPosition();  
    }
 

}

function showPosition(position) {

    // Default map center in London
    var lat = 51.5286417;
    var lng =  -0.1015987;
   
    //  Overwrite default location with the device's location if browser support 
   if (position) {
       lat = position.coords.latitude;
       lng = position.coords.longitude;
    }
    
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(lat,lng)
      };
      
    map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);
    
    //Load Events
    loadEvents();
    
    drawMap();
    
//    Should we center map at the latest incident's position ? Yes
    map.setCenter(reports[0].pos);
   

}

function report()
{
        this.pos= null;
        this.type='';
        this.subtype='';
        this.time='';
        this.KnownFatalities='';
        this.KnownCasualties='';
        this.SituationDescription='';
        this.url='';
}

function loadEvents(){
    
    var report1 = new report();
    report1.pos = new google.maps.LatLng(51.469194055890355,-0.0164794921875);
    report1.type= "Earthquake physical damage";
    report1.ubtype = "Residential building collapse";
    report1.time= "14 Jun 2015 20:00";
    report1.KnownFatalities= 3;
    report1.KnownCasualties= "20+";
    report1.SituationDescription="Building has collapsed. At least 30 people are trapped in the rubble";
    
     
    var report2 = new report();
    report2.pos = new google.maps.LatLng(51.47111882613948,0.120849609375);
    report2.type = "Crime";
    report2.subtype = "Looting, commercial premises";
    report2.time = "14 Jun 2015 22:00";
    report2.KnownFatalities = "0";
    report2.KnownCasualties = "0";
    report2.SituationDescription = "Looters are attempting to smash the window of the Apple store on the corner of James St. and Michael St";

    var report3 = new report();
    report3.pos = new google.maps.LatLng(51.53950234032649,-0.097503662109375);
    report3.type = "Infrastructure Failure";
    report3.subtype = "Water supply";
    report3.time= "14 Jun 2015 23:15";
    report3.KnownFatalities = "0";
    report3.KnownCasualties = "0";
    report3.SituationDescription = "The water supply to Peckham district is contaminated – brown, muddy water is coming out of the taps. Don’t drink it!";

    
    reports.push(report1);
    reports.push(report2);
    reports.push(report3);

}

function getInfoWindow(report){
    
     var contentString =   '<h3>'+report.type+'</h3>'+
                            '<p> Subtype:'+report.subtype+'<br/>'+
                            'Time:'+report.time+'<br/>'+
                            'Known Fatalities:'+report.KnownFatalities+'<br/>'+
                            'Known Casualties:'+report.KnownCasualties+'<br/>'+
                            'Situation Description:'+report.SituationDescription+'<br/></p>';

      return new google.maps.InfoWindow({
      content: contentString
        });
    
    
    
}

/*function showReportWindow(report,marker){
    
    getInfoWindow(report).open(map,marker);
    
}*/

function addMarkersListeners(){
    
    //http://stackoverflow.com/questions/7044587/adding-multiple-markers-with-infowindows-google-maps-api
    
    for(var i=0 ; i<reports.length ; ++i)
    {
        google.maps.event.addListener(markers[i], 'click', function(i) {
         return function() {
             
             //Close previous InfoWindow first
             if(lastInfoWin)
                lastInfoWin.close();
            
            // Then open new InfoWindow
             infoWin[i].open(map, markers[i]);
             lastInfoWin = infoWin[i];
         }
       }(i));
        
        // google.maps.event.addListener(markers[i], 'click',showReportWindow(reports[i],markers[i]));
    }
}

function drawMap(){
    
    for(var i=0 ; i<reports.length ; ++i)
    {
         var marker = new google.maps.Marker({
            position: reports[i].pos,
            map: map,

         });
         
         
      markers.push(marker);
      infoWin.push(getInfoWindow(reports[i]));
      
    
    }
    
    addMarkersListeners();
}

google.maps.event.addDomListener(window, 'load', initialize);