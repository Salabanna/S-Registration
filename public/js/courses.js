// public/js/courses.js
document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  try {
    // Try to get the current user's enrolled courses (if logged in)
    const token = localStorage.getItem('token');
    let enrolledIds = new Set();

    if (token) {
      try {
        const meRes = await fetch('/api/me', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.enrolledCourses && Array.isArray(meData.enrolledCourses)) {
            meData.enrolledCourses.forEach(c => {
              // each c may be object or id depending on API - handle both
              enrolledIds.add(typeof c === 'string' ? c : (c._id || c.id));
            });
          }
        } else {
          // if token invalid/expired, remove it
          if (meRes.status === 401) {
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.warn('Could not fetch profile:', err);
      }
    }

    await loadCourses(enrolledIds);
  } catch (err) {
    console.error('Initialization error:', err);
    showMessage('Failed to initialize courses page. Check console for details.', 'error');
  }
}

async function loadCourses(enrolledIds = new Set()) {
  const container = document.getElementById('courses');
  if (!container) return;
  container.innerHTML = '<p>Loading courses...</p>';

  try {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('Failed to load courses');
    const courses = await res.json();

    container.innerHTML = '';
    if (!courses || courses.length === 0) {
      container.innerHTML = '<p>No courses available at the moment.</p>';
      return;
    }

    courses.forEach(course => {
      const id = course._id || course.id;
      const el = document.createElement('div');
      el.className = 'course';
      el.innerHTML = `
        <h3>${escapeHtml(course.title)}</h3>
        <p>${escapeHtml(course.description || '')}</p>
        <div style="display:flex;gap:10px;align-items:center">
          <small>${escapeHtml(course.code || '')}</small>
          <button data-id="${id}">Enroll</button>
        </div>
      `;

      const btn = el.querySelector('button');
      if (enrolledIds.has(id)) {
        btn.textContent = 'Enrolled';
        btn.disabled = true;
      }

      btn.addEventListener('click', async () => {
        await handleEnroll(btn, id);
      });

      container.appendChild(el);
    });
  } catch (err) {
    console.error('Error loading courses:', err);
    container.innerHTML = '<p>Unable to load courses right now. Try again later.</p>';
  }
}

async function handleEnroll(button, courseId) {
  const token = localStorage.getItem('token');
  if (!token) {
    // not logged in
    if (confirm('You need to login to enroll. Go to login page now?')) {
      location.href = '/';
    }
    return;
  }

  // disable button while processing
  const previousText = button.textContent;
  button.disabled = true;
  button.textContent = 'Enrolling...';

  try {
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ courseId })
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(data.message || 'Enrolled successfully!', 'success');
      button.textContent = 'Enrolled';
      button.disabled = true;
    } else {
      // handle auth errors by redirecting to login
      if (res.status === 401) {
        localStorage.removeItem('token');
        showMessage('Session expired. Please login again.', 'error');
        setTimeout(() => location.href = '/', 1200);
        return;
      }

      const msg = data.message || 'Failed to enroll';
      showMessage(msg, 'error');
      button.textContent = previousText;
      button.disabled = false;
    }
  } catch (err) {
    console.error('Enroll error:', err);
    showMessage('Network error while enrolling. Try again later.', 'error');
    button.textContent = previousText;
    button.disabled = false;
  }
}

function showMessage(text, type = 'info', timeout = 2500) {
  // Simple non-blocking message bubble
  let msgBox = document.getElementById('global-msg-box');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'global-msg-box';
    Object.assign(msgBox.style, {
      position: 'fixed',
      right: '20px',
      top: '20px',
      zIndex: 9999,
      minWidth: '180px',
      padding: '10px 14px',
      borderRadius: '8px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    });
    document.body.appendChild(msgBox);
  }
  msgBox.textContent = text;
  if (type === 'success') msgBox.style.background = '#2b8a3e';
  else if (type === 'error') msgBox.style.background = '#c53030';
  else msgBox.style.background = '#333';

  msgBox.style.opacity = '1';
  clearTimeout(msgBox._hideTimeout);
  msgBox._hideTimeout = setTimeout(() => {
    msgBox.style.opacity = '0';
  }, timeout);
}

// Escaping to avoid basic XSS if data contains markup
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
