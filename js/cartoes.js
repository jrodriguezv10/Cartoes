let server = 'https://raw.githubusercontent.com/jrodriguezv10/Routes/master/linhas';
var map;
var colors = ["#378D3B", "#D22E2E", "#2F3E9E",
  "#1875D1", "#7A1EA1", "#d35400",
  "#16a085", "##666666"
];

var rutaImg = "https://raw.githubusercontent.com/jrodriguezv10/Routes/master/img/markers";
var markersUrl = [rutaImg + "/markerVerde.png", rutaImg + "/markerRojo.png", rutaImg + "/markerAzul.png",
  rutaImg + "/markerCeleste.png", rutaImg + "/markerMorado.png", rutaImg + "/markerNaranja.png",
  rutaImg + "/markerTurquesa.png", rutaImg + "/markerPlomo.png"
];
var loaders = [];
var totalRequests = 0;

google.maps.event.addDomListener(window, 'load', initializedMap);

function initializedMap() {
  var mapCanvas = document.getElementById('map');
  var mapOptions = {
    center: new google.maps.LatLng(-25.467328, -49.254101),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    styles: mapStylesGray
  }

  map = new google.maps.Map(mapCanvas, mapOptions);

  console.log("Total registers: " + data.length);
  console.log("Total stops: " + stops.length);

  getStops('0003778603');

}
/*********************************************
 * The stops are Tubos or Terminais.
 * ---------------------------------------------
 * Need previous algorith to determinate if the
 * user takes the bus on the Street, Tubo or Terminal
 * ---------------------------------------------
 * In case of Street, need to do a match between
 * departure time and register time to determinate
 * the location where the user took the bus.
 **********************************************/
function getStops(cardNumber) {
  var stopsId = [];
  var stopsTaken = [];
  var possibleShapes = [];
  var possibleSentidos = [];

  $.each(data, function(i, row) {
    if (row.NUMEROCARTAO == cardNumber) {
      stopsId.push(parseInt(row.CODVEICULO));
      console.log(row);
    }
  });

  $.each(stopsId, function(i, stopTaken) {
    $.each(stops, function(j, stop) {
      if (stop.gid == stopTaken) {
        stopsTaken.push(stop);
        possibleShapes.push([]);
        possibleSentidos.push([]);
        printMarker(stop, i);
      }
    });
  });

  console.log(stopsTaken);

  $.each(stopsTaken, function(i, stopTaken) {
    $.each(stops, function(j, stop) {
      if (stop.nome == stopTaken.nome) {
        possibleShapes[i].push(stop.cd_linha);
        possibleSentidos[i].push(stop.sentido);
      }
    });
  });

  /*$.each(possibleShapes, function(i, possibleShape) {
    var deleteDuplicatesShape = [];
    var deleteDuplicatesSentido = [];
    $.each(possibleShape, function(j, shape) {
      if ($.inArray(shape, deleteDuplicatesShape) === -1) {
        deleteDuplicatesShape.push(shape);
        deleteDuplicatesSentido.push(possibleSentidos[i][j]);
      }
    });
    possibleShapes[i] = deleteDuplicatesShape;
    possibleSentidos[i] = deleteDuplicatesSentido;
  });*/

  getShapesFromAPI(possibleShapes, possibleSentidos);

}



function getShapesFromAPI(possibleShapes, possibleSentidos) {
  $.each(possibleShapes, function(i, possibleShape) {
    loaders.push([]);
    $.each(possibleShape, function(j, shape) {
      loaders[i].push(false);
    });
  });

  $.each(possibleShapes, function(i, possibleShape) {
    $.each(possibleShape, function(j, shape) {
      if(shape!=30){
        requestShape(shape, i, j, possibleSentidos[i][j]);
      }
      totalRequests++;
    });
  });

}

function requestShape(linha, i, j, sentido) {
  console.log("[" + linha +"] - " + sentido + " (" + i + "," + j + ")");
  $.ajax({
        url: server + '/shapes/Shape' + linha + '.json',
        type: 'GET',
        dataType: "json",
        success: function(shape) {
            drawShape(shape, sentido, i);
            loaders[i][j] = true;//not used now
            if(isLoadComplete()){
              console.log("complete");
            }


        },
        error: function(response) {
            //reject(Error("Problems getting Shape"));
        }
    });

}

function isLoadComplete(){
  var totalComplete = 0;
  $.each(loaders, function(i, loader) {
    $.each(loader, function(j, complete) {
      if(complete){
        totalComplete++;
      }
    });
  });

  return totalComplete == totalRequests;
}

function drawShape(shape, sentido, index) {
  var routeLine = [];

    $.each(shape, function(i, item) {
        routeLine.push({
            lat: parseFloat(item.LAT.replace(",", ".")),
            lng: parseFloat(item.LON.replace(",", "."))
        });
    });

    var routePath = new google.maps.Polyline({
        path: routeLine,
        geodesic: true,
        strokeColor: colors[index],
        strokeOpacity: 1.0,
        strokeWeight: 1
    });
    routePath.setMap(map);

}

function printMarker(stop, index) {
  var iconURL = markersUrl[index];
  var latLng = new google.maps.LatLng(
    stop.latitude,
    stop.longitude
  );

  console.log(stop.latitude + "," +
  stop.longitude);
  var marker = new google.maps.Marker({
    position: latLng,
    icon: iconURL
  });

  marker.addListener('click', function() {
    var contentString = '';
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    infowindow.open(map, marker);
  });

  marker.setMap(map);
}

//0003203835 OPC
//0003778603 no Linha (use this)









//dota
