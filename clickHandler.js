// Used for mouse holding functionality
let lastGridItem;
let isMouseDown = false;
let isQuickClick; // Variable to determine if it's a quick click
let holdTimeoutId; // Variable to store the timeout ID
let hoveredGridItem = null; // Variable to track the chair that was under the mouse during pointerdown
let clickedGridItem = null;

gridContainer.addEventListener("pointerdown", (event) => {
    if (event.button === 0) {
        isMouseDown = true;
        isQuickClick = true;

        if (currentMode === "rotate") {
            clickedGridItem = event.target.closest(".grid-item");
            // Track the grid item under the mouse during pointerdown
            holdTimeoutId = setTimeout(() => {
                if (
                    isMouseDown &&
                    clickedGridItem === hoveredGridItem &&
                    clickedGridItem != null
                ) {
                    // If the mouse is still down, it's a hold
                    isQuickClick = false; // Not a quick click
                    handleGridClick(event);
                }
            }, 300); // Differentiate between click and hold
        } else {
            hoveredGridItem = null;
            handleGridClick(event);
        }
    }
});

document.addEventListener("pointerdown", (event) => {
    highlightInaccessibleChairs();
    const rotateControlPanel = document.getElementById("rotateControlPanel");

    // Check if rotateControlPanel exists and is currently displayed
    if (rotateControlPanel && rotateControlPanel.style.display !== "none") {
        // Check if the click is outside the rotateControlPanel
        const gridItem = event.target.closest(".grid-item");
        if (!rotateControlPanel.contains(event.target)) {
            // Hide the control panel and remove highlighting from the active chair if any
            rotateControlPanel.style.display = "none";
            if (selectedRotatingChair) {
                selectedRotatingChair.classList.remove("highlighted-yellow");
                selectedRotatingChair = null; // Reset active chair
            }
        }
    }
});

document.addEventListener("pointerup", (event) => {
    if (isMouseDown && isQuickClick && currentMode === "rotate") {
        handleGridClick(event);
    }

    isMouseDown = false; // Reset mouse down status
    clearTimeout(holdTimeoutId);
});

// When mouse is held down and hovering over a grid item
document.addEventListener("pointerover", (event) => {
    const gridItem = event.target.closest(".grid-item");
    hoveredGridItem = gridItem;

    if (isMouseDown && gridItem !== lastGridItem) {
        if (
            clickedGridItem &&
            clickedGridItem != gridItem &&
            currentMode === "rotate"
        ) {
            rotateChair(clickedGridItem, isQuickClick);
            clickedGridItem = null;
        }

        if (!clickedGridItem) {
            isQuickClick = true;
            handleGridClick(event);
            isQuickClick = false;
        }
    }

    // Previewing implementation
    previewChair(hoveredGridItem);
});

function handleGridClick(event) {
    clickedGridItem = null;

    const gridItem = event.target.closest(".grid-item");
    if (!gridItem) return; // Exit if clicked object is not a grid item

    // Clear any previously shown preview chair
    const existingPreview = document.querySelector(".preview-chair-container");
    const existingRobotPreview = document.querySelector(
        ".preview-robot-in-grid"
    );
    if (existingPreview) existingPreview.remove();
    if (existingRobotPreview) existingRobotPreview.remove();

    switch (currentMode) {
        case "stack":
            addStack(gridItem);
            break;
        case "place":
            handlePlaceMode(gridItem);
            break;
        case "rotate":
            rotateChair(gridItem, isQuickClick);
            break;
        case "move":
            moveChair(gridItem);
            break;
        case "delete":
            deleteChair(gridItem);
            break;
        case "robot":
            addOrRemoveRobot(gridItem);
            break;
        case "obstacle":
            addOrRemoveObstacle(gridItem);
            break;
        default:
            toggleHighlight(gridItem);
            break;
    }

    lastGridItem = gridItem;

    highlightInaccessibleChairs();
}

document.getElementById("rotationButton").addEventListener("click", () => {
    const rotationRangeValue = document.getElementById("rotationRange").value;
    defaultRotationDegree = parseInt(rotationRangeValue); // Update the default rotation degree
});

function previewChair(gridItem) {
    // Clear any previously shown preview chair
    const existingPreview = document.querySelector(".preview-chair-container");
    const existingRobotPreview = document.querySelector(
        ".preview-robot-in-grid"
    );
    if (existingPreview) existingPreview.remove();
    if (existingRobotPreview) existingRobotPreview.remove();

    if (
        !gridItem ||
        gridItem.querySelector(".chair-container-in-grid") ||
        gridItem.querySelector(".robot-in-grid") ||
        gridItem.classList.contains("black")
    ) {
        // Exit if not hovering over a grid item or if the grid item contains a chair, a robot, or is an obstacle
        return;
    }

    // Show a preview chair based on the current mode
    if (currentMode === "stack") {
        const previewChairContainer = createPreviewChair();
        gridItem.appendChild(previewChairContainer);
    } else if (
        currentMode === "move" &&
        selectedMovingChair &&
        !isMultiSelectEnabled
    ) {
        // Get the rotation degree of the selected moving chair
        const selectedChairImage =
            selectedMovingChair.querySelector(".chair-in-grid");
        const rotationDegree = selectedChairImage
            ? parseInt(selectedChairImage.dataset.rotation) || 0
            : defaultRotationDegree;

        const previewChairContainer = createPreviewChair(rotationDegree);
        gridItem.appendChild(previewChairContainer);
    } else if (currentMode === "place" && selectedStack) {
        const stackText = selectedStack.querySelector(
            ".chair-text-in-grid"
        ).textContent; // e.g., "S1"
        if (
            allocatedCNumbersByStack[stackText] < maxChairsPerStack ||
            allocatedCNumbersByStack[stackText] === undefined
        ) {
            const previewChairContainer = createPreviewChair();
            gridItem.appendChild(previewChairContainer);
        }
    } else if (currentMode === "robot") {
        const previewRobot = document.createElement("img");
        previewRobot.src = "robot.png";
        previewRobot.alt = "Preview Robot";
        previewRobot.className = "preview-robot-in-grid";
        gridItem.appendChild(previewRobot);
    }
}

function createPreviewChair(rotationDegree = defaultRotationDegree) {
    // Create a container for the preview chair
    const container = document.createElement("div");
    container.className = "preview-chair-container";

    const previewChair = document.createElement("img");
    previewChair.src = "chair.png";
    previewChair.alt = "Preview Chair";
    previewChair.className = "preview-chair-in-grid";
    // Apply the given rotation
    previewChair.style.transform = `rotate(${rotationDegree}deg)`;

    // Append the preview chair image to the container
    container.appendChild(previewChair);

    return container;
}
