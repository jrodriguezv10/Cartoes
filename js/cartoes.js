google.maps.event.addDomListener(window, 'load', initializedMap);
function initializedMap() {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
        center: new google.maps.LatLng(-25.383948, -49.246980),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
        styles: mapStylesGray
    }

    map = new google.maps.Map(mapCanvas, mapOptions);

    requestFromWeb();
}

function requestFromWeb() {
  $.ajax({
       url: 'http://transporteservico.urbs.curitiba.pr.gov.br/convenios/?h=44de3&v=db9b2',
       type: 'GET',
       success: function(response) {
           console.log(response);
       },
       error: function(response) {
           reject(Error("Problems getting data"));
       }
   });
}
