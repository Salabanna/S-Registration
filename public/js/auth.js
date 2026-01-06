async function handleAuthForm(e) {
e.preventDefault();
const path = location.pathname.endsWith('/register.html') ? '/api/register' : '/api/login';
const payload = {};
if (path.endsWith('register')) {
payload.name = document.getElementById('name').value;
}
payload.email = document.getElementById('email').value;
payload.password = document.getElementById('password').value;


const res = await fetch(path, {
method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
});
const data = await res.json();
if (res.ok && data.token) {
localStorage.setItem('token', data.token);
location.href = '/dashboard.html';
} else {
alert(data.message || 'Error');
}
}


const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', handleAuthForm);
const registerForm = document.getElementById('registerForm');
if (registerForm) registerForm.addEventListener('submit', handleAuthForm);