// ========== Dynamic NAVIGATION ==========
const navHTML = `
  <nav>
    <a href="index.html">Home</a>
    <a href="journal.html">Journal</a>
    <a href="about.html">About</a>
    <a href="projects.html">Projects</a>
    <button id="themeBtn">🌙</button>
  </nav>
`;

document.getElementById("nav-container").innerHTML = navHTML;


// ========== Dark / Light Mode Toggle ==========
document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    // Change icon
    const btn = document.getElementById("themeBtn");
    btn.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
});


// ========== Example of DOM Manipulation (Homepage Date) ==========
const dateBox = document.getElementById("dateBox");
if (dateBox) {
    const today = new Date().toDateString();
    dateBox.textContent = "Today’s Date: " + today;
}
