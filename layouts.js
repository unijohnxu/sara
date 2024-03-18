// layouts.js
document.addEventListener("DOMContentLoaded", function () {
    const selectElement = document.getElementById("savedLayouts");

    // Iterate over all items in local storage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        try {
            // Attempt to parse the item value as JSON
            const parsed = JSON.parse(value);

            // If parsing was successful and the result is an object (to further ensure it's JSON-like)
            if (typeof parsed === "object" && parsed !== null) {
                // This item is JSON, so create an option element for it
                const option = document.createElement("option");
                option.value = key;
                option.textContent = key;
                selectElement.appendChild(option);
            }
        } catch (e) {
            // Parsing failed, the item value is not JSON, so ignore this item
        }
    }
});

// In layouts.js
document.getElementById("loadLayout").addEventListener("click", function () {
    const selectedLayout = document.getElementById("savedLayouts").value;
    if (selectedLayout) {
        // Redirect to the grid page with the layout name as a query parameter
        window.location.href = `index.html?layoutName=${encodeURIComponent(
            selectedLayout
        )}`;
    } else {
        alert("Selected layout not found.");
    }
});
