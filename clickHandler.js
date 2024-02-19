// Used for mouse holding functionality
let lastGridItem;
let isMouseDown = false;
let isQuickClick; // Variable to determine if it's a quick click

function gridMouseDown(event) {
    if (event.button === 0) {
        // Left click
        isMouseDown = true;
        isQuickClick = true;

        if (currentMode === "rotate") {
            setTimeout(() => {
                if (isMouseDown) {
                    // If the mouse is still down, it's a hold
                    isQuickClick = false; // Not a quick click
                    handleGridClick(event);
                }
            }, 500); // Differentiate between click and hold
        } else {
            handleGridClick(event);
        }
    }
}

function documentMouseDown(event) {
    const rotateControlPanel = document.getElementById("rotateControlPanel");

    // Check if rotateControlPanel exists and is currently displayed
    if (rotateControlPanel && rotateControlPanel.style.display !== "none") {
        // Check if the click is outside the rotateControlPanel
        if (!rotateControlPanel.contains(event.target)) {
            // Hide the control panel and remove highlighting from the active chair if any
            rotateControlPanel.style.display = "none";
            if (activeChair) {
                activeChair.classList.remove("highlighted-yellow");
                activeChair = null; // Reset active chair
            }
        }
    }
}

function documentMouseUp(event) {
    if (isMouseDown && isQuickClick && currentMode === "rotate") {
        handleGridClick(event);
    }
    isMouseDown = false; // Reset mouse down status
}

gridContainer.addEventListener("mousedown", gridMouseDown);
gridContainer.addEventListener("touchstart", gridMouseDown);
document.addEventListener("mousedown", documentMouseDown);
document.addEventListener("touchstart", documentMouseDown);
document.addEventListener("mouseup", documentMouseUp);
document.addEventListener("touchend", documentMouseUp);

// When mouse is held down and hovering over a grid item
gridContainer.addEventListener("mouseover", (event) => {
    const gridItem = event.target.closest(".grid-item");
    if (isMouseDown && gridItem !== lastGridItem) {
        isQuickClick = true;
        handleGridClick(event);
    }
});

// // Prevent images from being dragged
// gridContainer.addEventListener("dragstart", (event) => {
//     event.preventDefault();
// });

// Functionality depends on which mode is active
function handleGridClick(event) {
    const gridItem = event.target.closest(".grid-item");
    if (!gridItem) return; // Exit if clicked object is not a grid item#

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
        case "delete":
            deleteChair(gridItem);
            break;
        case "robot":
            addOrRemoveRobot(gridItem);
            break;
        default:
            toggleHighlight(gridItem);
            break;
    }

    lastGridItem = gridItem;
}
