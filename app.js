const API_URL = "https://reservas-aya-ccss-orbe.onrender.com";

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

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

let currentUser = null;
let requests = [];
let viewDate = new Date();

// ===============================
// PASSWORDS
// ===============================
async function getStoredPassword(username) {
  const res = await fetch(`${API_URL}/passwords/${username}`);
  return await res.json();
}

async function savePassword(username, password) {
  await fetch(`${API_URL}/passwords`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  });
}

// ===============================
// LOGIN
// ===============================
async function doLogin() {
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;

  if (!USERS[user]) return alert("Usuario inválido");

  const stored = await getStoredPassword(user);

  let valid = stored
    ? stored.password === pass
    : DEFAULT_PASSWORDS[user] === pass;

  if (!valid) return alert("Contraseña incorrecta");

  currentUser = user;

  document.getElementById('nav-user').textContent =
    USERS[user].name + " · " + USERS[user].role;

  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  loadRequests();
}

function doLogout() {
  location.reload();
}

// ===============================
// API
// ===============================
async function loadRequests() {
  const res = await fetch(`${API_URL}/reservas`);
  requests = await res.json();
  render();
}

async function submitRequest() {
  const date = document.getElementById('req-date').value;
  const note = document.getElementById('req-note').value;

  if (!date) return alert("Seleccioná fecha");

  const u = USERS[currentUser];

  await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      fecha: date,
      proyecto: u.project,
      usuario: currentUser,
      nombre: u.name,
      nota: note,
      estado: "pending"
    })
  });

  loadRequests();
}

async function updateStatus(id, estado) {
  await fetch(`${API_URL}/reservas/${id}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
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
// CALENDARIO
// ===============================
function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = "";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  document.getElementById('cal-title').textContent =
    MONTHS[month] + " " + year;

  const daysInMonth = new Date(year, month+1, 0).getDate();

  for (let d=1; d<=daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    const day = document.createElement("div");
    day.className = "cal-day";
    day.textContent = d;

    const r = requests.filter(x => x.fecha===dateStr && x.estado!=="rejected");

    if (r.length === 1) {
      day.style.background = "#dbeafe";
    }

    if (r.length > 1) {
      day.style.background = "#fecaca";
    }

    grid.appendChild(day);
  }
}

// ===============================
// LISTA
// ===============================
function renderRequests() {
  const list = document.getElementById('req-list');

  list.innerHTML = requests.map(r => `
    <div class="req-item">
      <strong>${r.fecha}</strong>
      <br>${r.nombre} · ${r.proyecto}
      <br>Estado: ${r.estado}
      <br>
      <button onclick="updateStatus(${r.id},'approved')">✅</button>
      <button onclick="updateStatus(${r.id},'rejected')">❌</button>
      <button onclick="deleteRequest(${r.id})">🗑</button>
    </div>
  `).join("");
}

// ===============================
function render() {
  renderCalendar();
  renderRequests();
}
``
