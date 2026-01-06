// public/js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
});

async function loadProfile() {
  const token = localStorage.getItem("token");

  // If user is not logged in → send them to login page
  if (!token) {
    location.href = "/";
    return;
  }

  try {
    const res = await fetch("/api/me", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    // If token expired or invalid → redirect to login
    if (res.status === 401) {
      localStorage.removeItem("token");
      alert("Session expired. Please log in again.");
      location.href = "/";
      return;
    }

    const data = await res.json();

    const container = document.getElementById("profile");
    container.innerHTML = `
      <h2>Welcome, ${escapeHtml(data.name)}</h2>
      <p>Email: ${escapeHtml(data.email)}</p>
      <h3>Your Enrolled Courses</h3>
    `;

    if (!data.enrolledCourses || data.enrolledCourses.length === 0) {
      container.innerHTML += `
        <p>You have not enrolled in any courses.</p>
        <a href="/courses.html">Browse Courses</a>
      `;
      return;
    }

    // Display enrolled courses
    const list = document.createElement("div");

    data.enrolledCourses.forEach(course => {
      const el = document.createElement("div");
      el.className = "course";

      el.innerHTML = `
        <h4>${escapeHtml(course.title)}</h4>
        <p>${escapeHtml(course.description || "")}</p>
      `;
      list.appendChild(el);
    });

    container.appendChild(list);

  } catch (err) {
    console.error("Profile load error:", err);
    alert("Failed to load profile. Try again later.");
  }
}


// Escape HTML to prevent XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
