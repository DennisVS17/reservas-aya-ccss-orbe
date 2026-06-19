const API_URL = "https://reservas-aya-ccss-orbe.onrender.com";

// ============================================================
//  USUARIOS DEL SISTEMA
// ============================================================
const USERS = {
  dvalverde: {
    name: 'Dennis Valverde',
    role: 'Backup',
    project: 'vacaciones',
    chipClass: 'orange',
    canDirectAdd: true
  },
  deiby: {
    name: 'Deiby Campos',
    role: 'Coordinador CCSS',
    project: 'ccss',
    chipClass: '',
    canDirectAdd: false
  },
  sebastian: {
    name: 'Sebastián Madriz',
    role: 'Coordinador AyA',
    project: 'aya',
    chipClass: 'green',
    canDirectAdd: false
  },
  lorna: {
    name: 'Lorna Vega',
    role: 'Supervisora',
    project: 'super',
    chipClass: 'purple',
    canDirectAdd: true
  }
};

const DEFAULT_PASSWORDS = {
  dvalverde: 'backup2024',
  deiby: 'ccss2024',
  sebastian: 'aya2024',
  lorna: 'super2024'
};

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOWS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

let currentUser = null;
let requests = [];
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();
const today = new Date();

// ============================================================
// PASSWORDS (API)
// ============================================================
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
}

// ============================================================
// LOGIN
// ============================================================
async function doLogin() {
  const username = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;

  const stored = await getStoredPassword(username);

  let valid = false;

  if (stored) {
    valid = stored.password === pass;
  } else {
    valid = DEFAULT_PASSWORDS[username] === pass;
  }

  if (!valid) {
    alert("Credenciales incorrectas");
    return;
  }

  currentUser = username;
  showApp();
}

// ============================================================
// APP
// ============================================================
async function showApp() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  await loadRequests();
}

// ============================================================
// REQUESTS API
// ============================================================
async function loadRequests() {
  try {
    const res = await fetch(`${API_URL}/reservas`);
    requests = await res.json();
  } catch {
    requests = [];
  }
  render();
}

async function submitRequest() {
  const dateVal = document.getElementById('req-date').value;

  const u = USERS[currentUser];

  await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      fecha: dateVal,
      proyecto: u.project,
      usuario: currentUser,
      nombre: u.name,
      nota: "",
      estado: "pending"
    })
  });

  await loadRequests();
}

async function updateStatus(id, estado) {
  await fetch(`${API_URL}/reservas/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ estado })
  });
}

async function deleteRequest(id) {
  await fetch(`${API_URL}/reservas/${id}`, {
    method: "DELETE"
  });
  await loadRequests();
}

// ============================================================
// UI SIMPLE
// ============================================================
function render() {
  const list = document.getElementById('req-list');
  list.innerHTML = "";

  requests.forEach(r => {
    const el = document.createElement('div');
    el.textContent = `${r.fecha} - ${r.nombre} (${r.proyecto})`;
    list.appendChild(el);
  });
}
