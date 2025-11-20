// ===== Copy All Entries (Clipboard API) =====
const copyBtn = document.getElementById("copyEntriesBtn");

if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const entries = document.getElementById("savedEntries").innerText;

        if (!entries.trim()) {
            alert("No entries to copy!");
            return;
        }

        try {
            await navigator.clipboard.writeText(entries);
            alert("Entries copied to clipboard!");
        } catch (err) {
            alert("Clipboard access denied.");
        }
    });
}
