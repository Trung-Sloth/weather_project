document.addEventListener('popstate', () => {
  if (window.location.pathname !== '/map') return;

  const firebaseConfig = {
    apiKey: "AIzaSyAmd8V46CLS11cyu1UnjqBwtcBUXybnyNA",
    authDomain: "map-1-b0eae.firebaseapp.com",
    databaseURL: "https://map-1-b0eae-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "map-1-b0eae",
    storageBucket: "map-1-b0eae.appspot.com",
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const map = L.map('map').setView([10.850324, 106.772186], 20);

  //   L.tileLayer('https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=WxV6QKoeVDywcxuiW3su', // Map bth
  //   { 
  //     tileSize: 256,
  //     zoomOffset: 0,
  //     maxZoom: 22
  //   }).addTo(map);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', //Map ve tinh
    {
      maxZoom: 19
    }).addTo(map);

  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  let currentMarker1 = null;
  let currentMarker2 = null;
  let currentMarker3 = null;
  var n = 0;
  var x1 = 0, x2 = 0, x3 = 0;
  var y1 = 0, y2 = 0, y3 = 0;

  map.on('click', function (e) {
    n = n + 1;
    if (n % 3 == 1) {
      const lat1 = e.latlng.lat.toFixed(6);
      const lng1 = e.latlng.lng.toFixed(6);
      x1 = lat1;
      y1 = lng1;

      if ((n % 3 == 1) && (n > 3)) {
        map.removeLayer(currentMarker1);
      }
      currentMarker1 = L.marker([lat1, lng1], { icon: redIcon }).addTo(map);
    }

    if (n % 3 == 2) {
      const lat2 = e.latlng.lat.toFixed(6);
      const lng2 = e.latlng.lng.toFixed(6);
      x2 = lat2;
      y2 = lng2;

      if ((n % 3 == 2) && (n > 3)) {
        map.removeLayer(currentMarker2);
      }
      currentMarker2 = L.marker([lat2, lng2], { icon: greenIcon }).addTo(map);
    }

    if (n % 3 == 0) {
      const lat3 = e.latlng.lat.toFixed(6);
      const lng3 = e.latlng.lng.toFixed(6);
      x3 = lat3;
      y3 = lng3;

      if ((n % 3 == 0) && (n > 3)) {
        map.removeLayer(currentMarker3);
      }
      currentMarker3 = L.marker([lat3, lng3], { icon: blueIcon }).addTo(map);
    }
  });

  const toggleBtn = document.getElementById('toggleBtn');
  const mapPin = document.getElementById('map-pin');
  const mapDiv = document.getElementById('map');
  const confirmBtn = document.getElementById('confirmBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  toggleBtn.addEventListener('click', () => {
    if (confirmBtn.style.display == 'none') {
      confirmBtn.style.display = 'block';
    }
    else confirmBtn.style.display = 'none';

    if (deleteBtn.style.display == 'none') {
      deleteBtn.style.display = 'block';
    }
    else deleteBtn.style.display = 'none';

    if (mapDiv.style.display === 'none') {
      mapDiv.style.display = 'block';
      toggleBtn.innerText = 'Hide map';
      map.invalidateSize();
      toggleBtn.style.opacity = '0.4';
    }
    else {
      mapDiv.style.display = 'none';
      document.getElementById('status1').innerText = '';
      document.getElementById('status2').innerText = '';
      document.getElementById('status3').innerText = '';
      toggleBtn.innerText = 'Show map';
      toggleBtn.style.opacity = '1.0';
    }

    if (mapPin.style.display == 'none') {
      mapPin.style.display = 'block';
    }
    else mapPin.style.display = 'none';
  });

  confirmBtn.addEventListener('click', () => {
    if (n != 0) {
      document.getElementById('status1').innerText = `Vĩ độ 1=${x1}, Kinh độ 1=${y1}`;
      document.getElementById('status2').innerText = `Vĩ độ 2=${x2}, Kinh độ 2=${y2}`;
      document.getElementById('status3').innerText = `Vĩ độ 3=${x3}, Kinh độ 3=${y3}`;
    }
    else {
      document.getElementById('status1').innerText = '';
      document.getElementById('status2').innerText = '';
      document.getElementById('status3').innerText = '';
    }

    db.ref("Toa-do-1").set({
      lat: parseFloat(x1),
      lng: parseFloat(y1),
    })
    db.ref("Toa-do-2").set({
      lat: parseFloat(x2),
      lng: parseFloat(y2),
    })
    db.ref("Toa-do-3").set({
      lat: parseFloat(x3),
      lng: parseFloat(y3),
    })
  });

  deleteBtn.addEventListener('click', () => {
    n = 0;
    map.removeLayer(currentMarker1);
    map.removeLayer(currentMarker2);
    map.removeLayer(currentMarker3);
    document.getElementById('status1').innerText = '';
    document.getElementById('status2').innerText = '';
    document.getElementById('status3').innerText = '';
  });

  const uavIcon = new L.Icon({
    iconUrl: 'http://getdrawings.com/free-icon/uav-icon-62.png',
    iconSize: [45, 45],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    shadowSize: [41, 41]
  });

  let firebaseMarker = null;

  db.ref("Toa-do-hien-tai").on("value", (snapshot) => {
    const data = snapshot.val();
    if (data && data.lat_cur && data.lng_cur) {
      const lat = data.lat_cur;
      const lng = data.lng_cur;

      if (firebaseMarker) {
        map.removeLayer(firebaseMarker);
        // Add previous position marker
        var prevLat = firebaseMarker.getLatLng().lat;
        var prevLng = firebaseMarker.getLatLng().lng;
        prevFirebaseMarker = L.marker([prevLat, prevLng], { icon: prevPos })
          .addTo(map)
      }

      firebaseMarker = L.marker([lat, lng], { icon: uavIcon })
        .addTo(map)
    }
  });

  // Marker for previous position
  var prevPos = new L.Icon({
    iconUrl: 'https://vectorified.com/images/red-dot-icon-8.png',
    iconSize: [12, 12],
    iconAnchor: [4, 4],
    popupAnchor: [0, -20],
    shadowSize: [41, 41]
  });
  let prevFirebaseMarker = null;

});