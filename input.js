// This is only used in input.html

document.getElementById("saveData").addEventListener("click", function () {
    const jsonData = document.getElementById("jsonData").value;
    try {
        // Parse to ensure valid JSON
        const parsedData = JSON.parse(jsonData);
        // Save to localStorage
        localStorage.setItem("gridData", JSON.stringify(parsedData));
        // Redirect to index.html
        window.location.href = "index.html";
    } catch (error) {
        alert("Invalid JSON data.");
    }
});
