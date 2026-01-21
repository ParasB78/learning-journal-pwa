// ===== Save Journal Entry =====
const saveBtn = document.getElementById("saveEntryBtn");
const entryText = document.getElementById("journalInput");
const entriesList = document.getElementById("savedEntries");

// Load existing entries on page load
if (entriesList) {
    const saved = JSON.parse(localStorage.getItem("journalEntries")) || [];
    saved.forEach(entry => {
        const p = document.createElement("p");
        p.textContent = entry;
        entriesList.appendChild(p);
    });
}

// Save entry on click
if (saveBtn) {
    saveBtn.addEventListener("click", () => {
        const text = entryText.value.trim();
        if (!text) return alert("Please write something!");

        let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
        entries.push(text);

        localStorage.setItem("journalEntries", JSON.stringify(entries));

        const p = document.createElement("p");
        p.textContent = text;
        entriesList.appendChild(p);

        entryText.value = "";
        alert("Entry saved!");
    });
}


// ===== Save Theme Preference =====
if (document.body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}
