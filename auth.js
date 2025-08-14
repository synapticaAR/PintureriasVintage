
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('pass');
const users = JSON.parse(localStorage.getItem('pv-users')||'{}');

function saveUsers(){ localStorage.setItem('pv-users', JSON.stringify(users)); }
function ok(msg){ alert(msg); window.location.href = 'index.html'; }

document.getElementById('register').onclick = ()=>{
  const n = nameEl.value.trim(), e=emailEl.value.trim().toLowerCase(), p=passEl.value;
  if(!n||!e||!p) return alert('Completá nombre, email y contraseña.');
  if(users[e]) return alert('Ese email ya está registrado.');
  users[e] = {name:n, pass:p};
  localStorage.setItem('pv-current', JSON.stringify({email:e, name:n}));
  saveUsers(); ok('¡Cuenta creada! Ya estás logueado.');
};

document.getElementById('login').onclick = ()=>{
  const e=emailEl.value.trim().toLowerCase(), p=passEl.value;
  if(!e||!p) return alert('Completá email y contraseña.');
  if(!users[e] || users[e].pass!==p) return alert('Credenciales inválidas.');
  localStorage.setItem('pv-current', JSON.stringify({email:e, name:users[e].name}));
  ok('¡Bienvenido!');
};
