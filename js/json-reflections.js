/**
 * JSON Reflections Handler - Lab 5
 * FGCT6021 Mobile Application Development
 * 
 * This script fetches reflections from the JSON file and displays them
 * using DOM manipulation. Includes extra features: counter, filter, export.
 */

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

// ===== Fetch Reflections from JSON File =====
async function fetchReflections() {
    try {
        // Fetch the JSON file from backend folder
        const response = await fetch("backend/reflections.json");
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        allReflections = data.reflections || [];
        
        // Display reflections
        displayReflections(allReflections);
        
        // Update counter
        updateCounter(allReflections.length);
        
    } catch (error) {
        console.error("Error fetching reflections:", error);
        jsonReflectionsContainer.innerHTML = `
            <div class="error-msg">
                <p>⚠️ Could not load reflections from JSON file.</p>
                <p><small>Make sure you're running from a local server, not directly opening the HTML file.</small></p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
        updateCounter(0);
    }
}

// ===== Display Reflections using DOM Manipulation =====
function displayReflections(reflections) {
    // Clear container
    jsonReflectionsContainer.innerHTML = "";
    
    if (reflections.length === 0) {
        jsonReflectionsContainer.innerHTML = `
            <p class="no-results">No reflections found.</p>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sorted = [...reflections].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Create DOM elements for each reflection
    sorted.forEach(reflection => {
        // Create card container
        const card = document.createElement("div");
        card.className = "reflection-card";
        card.dataset.id = reflection.id;
        
        // Create header with date and ID
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
        
        // Create content paragraph
        const content = document.createElement("p");
        content.className = "reflection-content";
        content.textContent = reflection.content;
        
        // Assemble card
        card.appendChild(header);
        card.appendChild(content);
        
        // Add to container
        jsonReflectionsContainer.appendChild(card);
    });
}

// ===== Format Date for Display =====
function formatDate(dateString) {
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ===== Update Reflection Counter (Extra Feature) =====
function updateCounter(count) {
    if (reflectionCounter) {
        reflectionCounter.innerHTML = `📊 <strong>${count}</strong> reflection${count !== 1 ? 's' : ''} total`;
    }
}

// ===== Filter Reflections by Keyword (Extra Feature) =====
function filterByKeyword(keyword) {
    const filtered = allReflections.filter(r => 
        r.content.toLowerCase().includes(keyword.toLowerCase())
    );
    displayReflections(filtered);
    updateCounter(filtered.length);
}

// ===== Filter Reflections by Date (Extra Feature) =====
function filterByDate(dateString) {
    const filtered = allReflections.filter(r => r.date === dateString);
    displayReflections(filtered);
    updateCounter(filtered.length);
}

// ===== Combined Filter (Keyword + Date) =====
function applyFilters() {
    const keyword = searchInput ? searchInput.value.trim() : "";
    const date = dateFilter ? dateFilter.value : "";
    
    let filtered = allReflections;
    
    if (keyword) {
        filtered = filtered.filter(r => 
            r.content.toLowerCase().includes(keyword.toLowerCase())
        );
    }
    
    if (date) {
        filtered = filtered.filter(r => r.date === date);
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
}

// ===== Event Listeners =====
if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
}

if (dateFilter) {
    dateFilter.addEventListener("change", applyFilters);
}

if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", clearFilters);
}

if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", exportToJson);
}

if (refreshJsonBtn) {
    refreshJsonBtn.addEventListener("click", () => {
        jsonReflectionsContainer.innerHTML = '<p class="loading-msg">Refreshing...</p>';
        fetchReflections();
    });
}

// ===== Initialize on Page Load =====
document.addEventListener("DOMContentLoaded", () => {
    if (jsonReflectionsContainer) {
        fetchReflections();
    }
});

