var map;
var reports = [];
var markers = [];
var infoWin = [];
var lastInfoWin;

var searchTxtEle ;

// Event Date Element
var startDateEle ;
var endDateEle ;

// Event type Element
var isEarthQEle ;
var isCrimeEle ;
var isInfraEle ;
 
// Error Msg Element
var errorMsgEle ;
    
function IsSupportHTML5(){
    return navigator.geolocation;
}

function initialize() {

// Use HTML5 Geolocation to find user location.
    if (IsSupportHTML5()) {
        navigator.geolocation.getCurrentPosition(showPosition,PositionError);
    } else {
        //document.getElementById('map-canvas').innerHTML = "Geolocation is not supported by this browser."; 
        
        showPosition();  
        
        //If Browser doesn't support HTML5
        document.getElementById("startdatelabel").value += "dd/mm/yyyy";
        document.getElementById("enddatelabel").value += "dd/mm/yyyy";
    }
 
 
    // Register Event when user would like to use filter
    if (document.getElementById("btnfilter").addEventListener) {
        document.getElementById("btnfilter").addEventListener('click',processFilter,false);
    } else if (document.getElementById("btnfilter").attachEvent)  {
        // For IE8 or prior
        document.getElementById("btnfilter").attachEvent('onclick', processFilter);
    }

   
    // Search Text Element
    searchTxtEle = document.getElementById("searchText");

    // Event Date Element
    startDateEle = document.getElementById("evtStartDate");
    endDateEle = document.getElementById("evtEndDate");

    // Event type Element
    isEarthQEle =  document.getElementById("earthq");
    isCrimeEle =  document.getElementById("crime");
    isInfraEle =  document.getElementById("infra");

    // Error Msg Element
    errorMsgEle = document.getElementById("errMsg");

    // reset style
    resetStyle();
}

function PositionError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            showError("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            showError(innerHTML = "Location information is unavailable.");
            break;
        case error.TIMEOUT:
            showError(innerHTML = "The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            showError(innerHTML = "An unknown error occurred.");
            break;
    }
    
    // If Browser support HTML5 but can't get current position. Use default.
    showPosition();
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
    report1.subtype = "Residential building collapse";
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

// Week 05 : Main function to process the criteria
function processFilter(){
    
    //Reset stype
    resetStyle();
    
    //Validation 
    if(isFailValidateFilter())
        return;
    
    // Search by Event Description (can be Blank)
//    var searchTxt = searchTxtEle.value;
//    
//     // Event Date (dd/mm/yyyy)
//    var startDate = startDateEle.value;
//    var endDate = startDateEle.value;
//    
//    // Event type
//    var isEarthQ =  isEarthQEle.checked;
//    var isCrime =  isCrimeEle.checked;
//    var isInfra =  isInfraEle.checked;
//    
    // Create query and send to Application server (AJAX)

 
    
}

// Week 05 : Style reset
function resetStyle()
{
    document.getElementById("filterEventType").setAttribute("style","");
    document.getElementById("filterDate").setAttribute("style","");
    errorMsgEle.innerHTML = "";
}
// Week 05 : Validation function to process the criteria
function isFailValidateFilter(){
    
      var error = false;
    // Validate Date format
      if (isFailValidateDateformat(startDateEle.value)||isFailValidateDateformat(endDateEle.value))
    {
        showError("Please input start and end date in dd/mm/yyyy format or leave it blank");
        
        document.getElementById("filterDate").setAttribute("style","color:red;");
        error = true;
    }
    
    var sd = startDateEle.value.split("/");
    var startDate =  new Date();
    startDate.setDate(sd[0]);
    startDate.setMonth(sd[1]-1); // Month in this method is 0-11
    startDate.setYear(sd[2]);
    
    var ed = endDateEle.value.split("/");
    var endDate =  new Date();
    endDate.setDate(ed[0]);
    endDate.setMonth(ed[1]-1);
    endDate.setYear(ed[2]);
    
    var tod = new Date(); // Today
    // Event type
    var isEarthQ =  isEarthQEle.checked;
    var isCrime =  isCrimeEle.checked;
    var isInfra =  isInfraEle.checked;
  
    
    //Validation 1 : start date must be before or equal today
    if ( startDate > tod)
    {
        showError("Start date can't beyond today");
         // Highlight input to red 
         document.getElementById("filterDate").setAttribute("style","color:red;");
        
    }
    
    //Vadation 2 : end date must be before or equal today
    /*if ( endDate > tod)
    {
        showError("End date can't beyond today");
         // Highlight input to red 
         document.getElementById("filterDate").setAttribute("style","color:red;");
        
    }*/
    
    // Validation 3 : end date must be after or equal start date
    if (startDate > endDate)
    {
         showError("Start date must come before End date");
         // Highlight input to red 
         document.getElementById("filterDate").setAttribute("style","color:red;");
         

         error = true;
    }
   
    //Validation 4 : If All event types unticked, warn user
    
    if (!(isEarthQ||isCrime||isInfra))
    {
        showError("No Event type selected");
        
        document.getElementById("filterEventType").setAttribute("style","color:red;");
        error = true;
    }
    
    return error;
}

// Week 5 : validate Date format user input (dd/mm/yyyy)

function isFailValidateDateformat(usrdate){
    
    // User doesn't specify the date or all white space
    
    if(typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function() {
                    usrdate = usrdate.replace(/^\s+|\s+$/g, '').leng; 
                }
    }else {
        usrdate = usrdate.trim()
       
    }
    
     if (usrdate.length === 0)
            return false;
        

        
    var dateArray = usrdate.split("/");

    if(dateArray.length === 3)
    {
        
        // Case 1: 1/1/ (no year) or no date /5/2000
        // Not necessary , check isNum instead
        //if (dateArray[0].length === 0 || dateArray[1].length === 0 || dateArray[2].length === 0)
        //    return true;
        
        // Case 1: User inputs character 01/Feb/2000
        if (!(isNum(dateArray[0]) && isNum(dateArray[1]) && isNum(dateArray[2])))
            return true;
        
        // Case 2: Mount is not in 1-12
        if(dateArray[1]>12 || dateArray[1]<1)
            return true;
        // Case 3: If month in rage 1-12 , check date
        else {
            
                 var maxdate = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    
                // Leap years
                if(dateArray[2] % 400 === 0 || (dateArray[2]  % 100 !== 0 && dateArray[2]  % 4 === 0))
                {
                    maxdate[1] = 29;
                }
                
                
                if (dateArray[0] > maxdate[dateArray[1]-1]){
                        return true;
                }
            
        }
            
      
    }
    
    return false; //Doesn't match all bad cases
    
}

// Week 5 : 
function isNum(n)
{
    // n must start with/without whitespace ,follow by one number or more and end with/without whitespace 
     var reg = /^\s*\d+\s*$/; 
     return reg.test(n);
    
}
// Week 5 :  Add error to unorder list
function showError(errText)
{
    var item = document.createElement("li");
    var errtext = document.createTextNode(errText);
    item.appendChild(errtext);

     errorMsgEle.appendChild(item);
   
}
google.maps.event.addDomListener(window, 'load', initialize);