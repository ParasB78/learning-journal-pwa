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
