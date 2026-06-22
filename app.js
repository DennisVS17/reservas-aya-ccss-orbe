const API_URL = "https://reservas-aya-ccss-orbe.onrender.com";

// ===============================
// USUARIOS
// ===============================
const USERS = {
  dvalverde: {
    name: 'Dennis Valverde',
    role: 'Backup',
    project: 'vacaciones'
  },
  deiby: {
    name: 'Deiby Campos',
    role: 'CCSS',
    project: 'ccss'
  },
  sebastian: {
    name: 'Sebastián Madriz',
    role: 'AyA',
    project: 'aya'
  },
  lorna: {
    name: 'Lorna Vega',
    role: 'Admin',
    project: 'super'
  }
};

const DEFAULT_PASSWORDS = {
  dvalverde: 'backup2024',
  deiby: 'ccss2024',
  sebastian: 'aya2024',
  lorna: 'super2024'
};

// ===============================
let currentUser = null;
let requests = [];

// ===============================
// PASSWORDS API
// ===============================
async function getStoredPassword(username) {
  try {
    const res = await fetch(`${API_URL}/passwords/${username}`);
    return await res.json();
  } catch {
    return null;
  }
}

async function savePassword(username, password) {
  await fetch(`${API_URL}/passwords`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });
}

// ===============================
// LOGIN
// ===============================
async function doLogin() {
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;

  if (!USERS[user]) {
    alert("Usuario no existe");
    return;
  }

  const stored = await getStoredPassword(user);

  let valid = false;

  if (stored) {
    valid = stored.password === pass;
  } else {
    valid = DEFAULT_PASSWORDS[user] === pass;
  }

  if (!valid) {
    alert("Contraseña incorrecta");
    return;
  }

  currentUser = user;

  document.getElementById('nav-user').textContent = USERS[user].name;

  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  loadRequests();
}

function doLogout() {
  currentUser = null;
  location.reload();
}

// ===============================
// RESERVAS API
// ===============================
async function loadRequests() {
  const res = await fetch(`${API_URL}/reservas`);
  requests = await res.json();
  render();
}

async function submitRequest() {
  const date = document.getElementById('req-date').value;
  const note = document.getElementById('req-note').value;

  if (!date) {
    alert("Seleccioná fecha");
    return;
  }

  const u = USERS[currentUser];

  await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      fecha: date,
      proyecto: u.project,
      usuario: currentUser,
      nombre: u.name,
      nota: note,
      estado: "pending"
    })
  });

  document.getElementById('req-date').value = "";
  document.getElementById('req-note').value = "";

  loadRequests();
}

async function updateStatus(id, estado) {
  await fetch(`${API_URL}/reservas/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ estado })
  });

  loadRequests();
}

async function deleteRequest(id) {
  await fetch(`${API_URL}/reservas/${id}`, {
    method: "DELETE"
  });

  loadRequests();
}

// ===============================
// RENDER UI
// ===============================
function render() {
  const list = document.getElementById('req-list');
  list.innerHTML = "";

  requests.forEach(r => {

    const item = document.createElement('div');

    item.innerHTML = `
      <strong>${r.fecha}</strong> - ${r.nombre} (${r.proyecto})
      <br>
      Estado: ${r.estado}
      <br>
      <button onclick="updateStatus(${r.id}, 'approved')">Aprobar</button>
      <button onclick="updateStatus(${r.id}, 'rejected')">Rechazar</button>
      <button onclick="deleteRequest(${r.id})">Eliminar</button>
      <hr>
    `;

    list.appendChild(item);
  });
}
