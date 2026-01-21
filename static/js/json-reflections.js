// static/js/json-reflections.js

// ===== Global Variables =====
let allReflections = []; // Store all reflections for filtering

// ===== DOM Elements =====
const jsonReflectionsContainer = document.getElementById("jsonReflections");
const reflectionCounter = document.getElementById("reflectionCounter");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");
const clearFilterBtn = document.getElementById("clearFilterBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const refreshJsonBtn = document.getElementById("refreshJsonBtn");

// Lab 6 form elements
const reflectionForm = document.getElementById("reflectionForm");
const newReflectionInput = document.getElementById("newReflection");
const apiMsg = document.getElementById("apiMsg");

// ===== Helper: show message =====
function setMsg(text, isError = false) {
  if (!apiMsg) return;
  apiMsg.textContent = text || "";
  apiMsg.style.fontWeight = "600";
  apiMsg.style.color = isError ? "crimson" : "green";
}

// ===== Fetch Reflections from Flask API (Lab 6) =====
async function fetchReflections() {
  try {
    const response = await fetch("/reflections");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    allReflections = data.reflections || [];

    displayReflections(allReflections);
    updateCounter(allReflections.length);
  } catch (error) {
    console.error("Error fetching reflections:", error);
    if (jsonReflectionsContainer) {
      jsonReflectionsContainer.innerHTML = `
        <div class="error-msg">
          <p>⚠️ Could not load reflections from Flask API.</p>
          <p><small>Check Flask is running and route <code>/reflections</code> exists.</small></p>
          <p><small>Error: ${error.message}</small></p>
        </div>
      `;
    }
    updateCounter(0);
  }
}

// ===== Make available globally for script.js online-sync refresh =====
// script.js checks: if (typeof loadReflections === "function") loadReflections();
window.loadReflections = fetchReflections;

// ===== POST New Reflection to Flask API (Lab 6) =====
// NOTE: This is kept for compatibility but form submit will now use submitReflectionSmart()
// (offline queue + sync) from script.js.
async function postReflection(content) {
  try {
    setMsg("Saving reflection...");

    const response = await fetch("/add_reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMsg(data.error || "Could not save reflection.", true);
      return;
    }

    setMsg("✅ Reflection saved!");
    await fetchReflections();
  } catch (error) {
    console.error("Error posting reflection:", error);
    setMsg("⚠️ Network/server error while saving reflection.", true);
  }
}

// ===== Display Reflections using DOM Manipulation =====
function displayReflections(reflections) {
  if (!jsonReflectionsContainer) return;

  jsonReflectionsContainer.innerHTML = "";

  if (reflections.length === 0) {
    jsonReflectionsContainer.innerHTML = `<p class="no-results">No reflections found.</p>`;
    return;
  }

  const sorted = [...reflections].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  sorted.forEach((reflection) => {
    const card = document.createElement("div");
    card.className = "reflection-card";
    card.dataset.id = reflection.id;

    const header = document.createElement("div");
    header.className = "reflection-header";

    const dateSpan = document.createElement("span");
    dateSpan.className = "reflection-date";
    dateSpan.textContent = `📅 ${formatDate(reflection.date)}`;

    const idSpan = document.createElement("span");
    idSpan.className = "reflection-id";
    idSpan.textContent = `#${reflection.id}`;

    header.appendChild(dateSpan);
    header.appendChild(idSpan);

    const content = document.createElement("p");
    content.className = "reflection-content";
    content.textContent = reflection.content;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑 Delete";
    deleteBtn.style.marginTop = "8px";
    deleteBtn.addEventListener("click", async () => {
      try {
        const resp = await fetch(`/reflections/${reflection.id}`, {
          method: "DELETE",
        });

        if (resp.ok) {
          setMsg(`Deleted reflection #${reflection.id}`);
          fetchReflections();
        } else {
          setMsg("Delete failed (route not added yet).", true);
        }
      } catch {
        setMsg("Delete failed (server error).", true);
      }
    });

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(deleteBtn);

    jsonReflectionsContainer.appendChild(card);
  });
}

// ===== Format Date for Display =====
function formatDate(dateString) {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// ===== Update Reflection Counter (Extra Feature) =====
function updateCounter(count) {
  if (reflectionCounter) {
    reflectionCounter.innerHTML = `📊 <strong>${count}</strong> reflection${
      count !== 1 ? "s" : ""
    } total`;
  }
}

// ===== Combined Filter (Keyword + Date) =====
function applyFilters() {
  const keyword = searchInput ? searchInput.value.trim() : "";
  const date = dateFilter ? dateFilter.value : "";

  let filtered = allReflections;

  if (keyword) {
    filtered = filtered.filter((r) =>
      (r.content || "").toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  if (date) {
    filtered = filtered.filter((r) => r.date === date);
  }

  displayReflections(filtered);
  updateCounter(filtered.length);
}

// ===== Export JSON (Extra Feature) =====
function exportToJson() {
  const dataStr = JSON.stringify({ reflections: allReflections }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "reflections-export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  alert("✅ JSON file exported successfully!");
}

// ===== Clear All Filters =====
function clearFilters() {
  if (searchInput) searchInput.value = "";
  if (dateFilter) dateFilter.value = "";
  displayReflections(allReflections);
  updateCounter(allReflections.length);
  setMsg("");
}

// ===== Event Listeners =====
if (searchInput) searchInput.addEventListener("input", applyFilters);
if (dateFilter) dateFilter.addEventListener("change", applyFilters);
if (clearFilterBtn) clearFilterBtn.addEventListener("click", clearFilters);
if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportToJson);

if (refreshJsonBtn) {
  refreshJsonBtn.addEventListener("click", () => {
    if (jsonReflectionsContainer) {
      jsonReflectionsContainer.innerHTML =
        '<p class="loading-msg">Refreshing...</p>';
    }
    fetchReflections();
  });
}

// ✅ UPDATED: Lab 7 form submit → uses submitReflectionSmart() for offline queue + sync
if (reflectionForm && newReflectionInput) {
  reflectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = newReflectionInput.value.trim();

    if (content.length < 10) {
      setMsg("⚠️ Reflection must be at least 10 characters.", true);
      return;
    }

    // Prefer Lab 7 smart submit (offline queue + sync)
    if (typeof submitReflectionSmart === "function") {
      setMsg(
        navigator.onLine
          ? "Saving reflection..."
          : "Offline: queued for sync...",
      );
      await submitReflectionSmart(content);
      setMsg(
        navigator.onLine
          ? "✅ Reflection saved!"
          : "✅ Saved offline. Will sync when online.",
      );
    } else {
      // fallback if script.js not loaded for some reason
      await postReflection(content);
    }

    newReflectionInput.value = "";
  });
}

// ===== Initialize on Page Load =====
document.addEventListener("DOMContentLoaded", () => {
  if (jsonReflectionsContainer) fetchReflections();
});
