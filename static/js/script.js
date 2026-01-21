// static/js/script.js

// ========== Dynamic NAVIGATION (Flask routes) ==========
const navHTML = `
  <nav>
    <a href="/">Home</a>
    <a href="/journal">Journal</a>
    <a href="/about">About</a>
    <a href="/projects">Projects</a>
    <button id="themeBtn" type="button">🌙</button>
  </nav>
`;

const navContainer = document.getElementById("nav-container");
if (navContainer) {
  navContainer.innerHTML = navHTML;
}

// ========== Dark / Light Mode Toggle ==========
const themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    // Change icon
    themeBtn.textContent = document.body.classList.contains("dark-theme")
      ? "☀️"
      : "🌙";
  });
}

// ========== Example of DOM Manipulation (Homepage Date) ==========
const dateBox = document.getElementById("dateBox");
if (dateBox) {
  const today = new Date().toDateString();
  dateBox.textContent = "Today’s Date: " + today;
}

// ========== Service Worker Registration (Lab 7) ==========
// Your Flask serves SW from route: /sw.js (root scope)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service worker registered");
    } catch (err) {
      console.log("Service worker registration failed:", err);
    }
  });
}

// =======================================================
// OFFLINE QUEUE + STATUS (Lab 7 Extra Feature)
// =======================================================
const queueKey = "queued_reflections";

// Show/hide offline banner (only if it exists on the page)
function updateOfflineBanner() {
  const el = document.getElementById("offlineBanner");
  if (!el) return;
  el.style.display = navigator.onLine ? "none" : "block";
}

// Save reflection while offline
function enqueueReflection(content) {
  const q = JSON.parse(localStorage.getItem(queueKey) || "[]");
  q.push({ content });
  localStorage.setItem(queueKey, JSON.stringify(q));
}

// Sync queued reflections when back online
async function flushQueue() {
  const q = JSON.parse(localStorage.getItem(queueKey) || "[]");
  if (!q.length) return;

  const remaining = [];
  for (const item of q) {
    try {
      await fetch("/add_reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } catch (e) {
      remaining.push(item);
    }
  }
  localStorage.setItem(queueKey, JSON.stringify(remaining));
}

// When internet comes back: update banner, sync, refresh reflections if available
window.addEventListener("online", async () => {
  updateOfflineBanner();
  await flushQueue();

  // Reload reflections only on journal page (where loadReflections exists)
  if (typeof loadReflections === "function") {
    await loadReflections();
  }
});

// When internet goes off: show banner
window.addEventListener("offline", () => {
  updateOfflineBanner();
});

// Run once on page load
document.addEventListener("DOMContentLoaded", () => {
  updateOfflineBanner();
});

// Also run immediately (safe with defer scripts, helps on some browsers)
updateOfflineBanner();

// =======================================================
// Helper called by json-reflections.js (Lab 7 queue support)
// =======================================================
window.submitReflectionSmart = async function submitReflectionSmart(content) {
  content = (content || "").trim();

  if (!navigator.onLine) {
    enqueueReflection(content);
    alert("Offline: reflection saved locally and will sync when online.");
    return;
  }

  const res = await fetch("/add_reflection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Failed to save reflection");
    return;
  }

  if (typeof loadReflections === "function") {
    await loadReflections();
  }
};
