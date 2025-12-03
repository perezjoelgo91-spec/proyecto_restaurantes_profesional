// Guardar reseñas
document.getElementById("reviewForm")?.addEventListener("submit", function(e){
  e.preventDefault();

  const form = e.target;
  if(!form.checkValidity()){
    form.classList.add("was-validated");
    return;
  }

 const review = {
    resto: document.getElementById("resto").value,
    rating: document.getElementById("rating").value,
    category: document.querySelector("input[name='cat']:checked").value,
    comment: document.getElementById("comment").value,

    // --- NUEVOS DATOS DE GOOGLE ---
    googleRating: document.getElementById("googleRating").value || null,
    googleTotal: document.getElementById("googleTotal").value || null,
    googleAddress: document.getElementById("googleAddress").value || null
};

  let list = JSON.parse(localStorage.getItem("reviews") || "[]");
  list.push(review);
  localStorage.setItem("reviews", JSON.stringify(list));

  window.location.href = "result.html";
});

// Mostrar reseñas en index
if(document.getElementById("recentReviews")){
  let list = JSON.parse(localStorage.getItem("reviews") || "[]");
  list.slice(-3).reverse().forEach(r => {
    document.getElementById("recentReviews").innerHTML += cardHTML(r);
  });
}

// Mostrar todas las reseñas
if(document.getElementById("allReviews")){
  let list = JSON.parse(localStorage.getItem("reviews") || "[]");
  list.reverse().forEach(r => {
    document.getElementById("allReviews").innerHTML += cardHTML(r);
  });
}

function cardHTML(r){
  return `
  <div class="col-md-4 mb-4">
    <div class="card review-card shadow-sm">
      <div class="card-body">

        <h5 class="fw-bold">${r.resto}</h5>

        ${
          r.googleRating 
          ? `<p class="text-success">⭐ ${r.googleRating} (Google – ${r.googleTotal} reseñas)</p>`
          : `<p class="text-muted">Sin datos de Google</p>`
        }

        <p class="text-warning">${"⭐".repeat(r.rating)} (Tu calificación)</p>

        ${
          r.googleAddress
          ? `<p class="small text-secondary">📍 ${r.googleAddress}</p>`
          : ""
        }

        <span class="badge bg-primary">${r.category}</span>

        <p class="mt-2">${r.comment}</p>

      </div>
    </div>
  </div>`;
}
// --- Buscar restaurantes cerca de mí ---
function buscarRestaurantes() {
    if (!navigator.geolocation) {
        alert("Tu navegador no permite geolocalización.");
        return;
    }

    navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const location = new google.maps.LatLng(lat, lng);

    const map = new google.maps.Map(document.createElement("div")); // mapa oculto
    const service = new google.maps.places.PlacesService(map);

    const request = {
        location: location,
        radius: 2000,
        type: ["restaurant"]
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            mostrarRestaurantes(results);
        } else {
            alert("No se pudieron obtener restaurantes cercanos.");
        }
    });
}

function error() {
    alert("No se pudo obtener tu ubicación.");
}

function mostrarRestaurantes(restaurantes) {
    const lista = document.getElementById("listaRestaurantes");
    lista.innerHTML = "";

    restaurantes.slice(0, 10).forEach(resto => {
        const nombre = resto.name;
        const rating = resto.rating || "Sin datos";
        const totalResenas = resto.user_ratings_total || 0;
        const direccion = resto.vicinity || "Dirección no disponible";

        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";

        li.innerHTML = `
            <strong>${nombre}</strong><br>
            ⭐ ${rating} (${totalResenas} reseñas)<br>
            📍 <small>${direccion}</small>
        `;

        li.onclick = () => {
            document.getElementById("resto").value = nombre;
            document.getElementById("googleRating").value = rating;
            document.getElementById("googleTotal").value = totalResenas;
            document.getElementById("googleAddress").value = direccion;
        };

        lista.appendChild(li);
    });
}