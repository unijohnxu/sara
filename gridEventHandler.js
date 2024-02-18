function addStack(gridItem) {
    if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
    if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

    const chairContainer = gridItem.querySelector(".chair-container-in-grid"); // Check if there's a chair on grid item
    if (chairContainer) return; // Skip if there is a chair already

    // If there's no chair container, add a new stack
    const number = getLowestAvailableNumber();
    allocatedNumbers.add(number);

    const container = document.createElement("div");
    container.className = "chair-container-in-grid"; // contains both image and text

    // Chair image
    const chairImage = document.createElement("img");
    chairImage.src = "chair.png";
    chairImage.alt = "Chair";
    chairImage.className = "chair-in-grid";
    chairImage.draggable = false;

    // Chair text
    const chairText = document.createElement("span");
    chairText.textContent = `S${number}`;
    chairText.className = "chair-text-in-grid";
    chairText.style.fontSize = `${calculateFontSize(gridSize)}px`;

    // Add stack to grid item
    container.append(chairImage, chairText);
    gridItem.appendChild(container);
}

function handlePlaceMode(gridItem) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");

    // To not get mixed up with stacks
    const isChairContainer = !!chairContainer;
    const isCChair =
        isChairContainer &&
        chairContainer
            .querySelector(".chair-text-in-grid")
            .textContent.startsWith("C");

    // If stack selected already and clicked grid item is not a chair
    if (!isChairContainer && selectedStack) {
        if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
        if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

        const stackText = selectedStack.querySelector(
            ".chair-text-in-grid"
        ).textContent; // e.g., "S1"
        const cNumber = getLowestAvailableCNumber(stackText); // Get the lowest available C number for this stack

        if (cNumber === null) {
            return; // Stop if the limit is reached
        }

        const container = document.createElement("div");
        container.className = "chair-container-in-grid"; // contains both image and text

        // Chair image
        const chairImage = document.createElement("img");
        chairImage.src = "chair.png";
        chairImage.alt = "Chair";
        chairImage.className = "chair-in-grid";
        chairImage.draggable = false;

        // Chair text
        const chairText = document.createElement("span");
        chairText.textContent = `C${cNumber} (${stackText})`;
        chairText.className = "chair-text-in-grid";
        chairText.style.fontSize = `${calculateFontSize(gridSize)}px`;

        // Add C chair associated with the selected stack
        container.append(chairImage, chairText);
        gridItem.appendChild(container);

        // If clicked grid item is a chair but not a C chair, then a stack must be clicked
    } else if (chairContainer && !isCChair) {
        // Selecting or deselecting a stack
        if (selectedStack === gridItem) {
            // Deselect if the same stack is clicked again
            selectedStack.classList.remove("highlighted-stack");
            selectedStack = null;
        } else {
            // Select a new stack
            if (selectedStack)
                selectedStack.classList.remove("highlighted-stack");
            selectedStack = gridItem;
            gridItem.classList.add("highlighted-stack");
        }
    }
}

function rotateChair(gridItem) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (!chairContainer) return; // Skip if there is no chair

    const chairImage = chairContainer.querySelector(".chair-in-grid");
    // Don't rotate robot
    if (chairImage) {
        const currentRotation = parseInt(chairImage.dataset.rotation || 0); // Default of 0
        const newRotation = (currentRotation + 90) % 360;
        chairImage.style.transform = `rotate(${newRotation}deg)`;
        chairImage.dataset.rotation = newRotation.toString();
    }
}

function deleteChair(gridItem) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (!chairContainer) return; // Skip if there is no chair

    // Check if stack or C chair
    const chairTextContent = chairContainer.querySelector(
        ".chair-text-in-grid"
    ).textContent;

    if (chairTextContent.startsWith("S")) {
        // Deleting a stack, remove it along with all associated C chairs
        const stackId = chairTextContent; // e.g., "S1"
        gridItem.removeChild(chairContainer); // Remove the S chair

        // Remove all C chairs associated with this stack
        document
            .querySelectorAll(
                ".grid-item .chair-container-in-grid .chair-text-in-grid"
            )
            .forEach((chairText) => {
                // for all chairs
                if (chairText.textContent.includes(`(${stackId})`)) {
                    // e.g. "(S1)"
                    const cChairContainer = chairText.closest(
                        ".chair-container-in-grid"
                    ); // select C chair
                    cChairContainer.parentElement.removeChild(cChairContainer); // delete C chair
                }
            });

        // Clear allocated C numbers for this stack
        if (allocatedCNumbersByStack[stackId]) {
            delete allocatedCNumbersByStack[stackId];
        }

        const stackNumber = parseInt(stackId.substring(1));

        document
            .querySelectorAll(".chair-text-in-grid")
            .forEach((chairText) => {
                const isStack = chairText.textContent.startsWith("S");
                const isCChair = chairText.textContent.startsWith("C");
                let currentNumber;

                if (isStack) {
                    currentNumber = parseInt(
                        chairText.textContent.substring(1)
                    );
                } else if (isCChair) {
                    currentNumber = parseInt(
                        chairText.textContent.match(/\(S(\d+)\)/)[1]
                    );
                }

                // Renumber stacks
                if (currentNumber > stackNumber) {
                    const newNumber = currentNumber - 1;
                    const newText = isStack
                        ? `S${newNumber}`
                        : chairText.textContent.replace(
                              `S${currentNumber}`,
                              `S${newNumber}`
                          );
                    chairText.textContent = newText;

                    // Update allocatedCNumbersByStack for C chairs
                    if (isCChair) {
                        if (
                            allocatedCNumbersByStack[`S${newNumber}`] ===
                            undefined
                        ) {
                            allocatedCNumbersByStack[`S${newNumber}`] =
                                allocatedCNumbersByStack[`S${currentNumber}`];
                            delete allocatedCNumbersByStack[
                                `S${currentNumber}`
                            ];
                        }
                    }
                }
            });

        // Update allocatedNumbers set
        allocatedNumbers.delete(stackNumber);
        const updatedNumbers = new Set(
            [...allocatedNumbers].map((num) =>
                num > stackNumber ? num - 1 : num
            )
        );
        allocatedNumbers.clear();
        updatedNumbers.forEach((num) => allocatedNumbers.add(num));
    } else if (chairTextContent.startsWith("C")) {
        // Deleting a C chair, remove it individually
        // Parse the stack ID and C number from the chair's text
        const match = chairTextContent.match(/C(\d+) \(S(\d+)\)/);
        if (match) {
            const stackId = `S${match[2]}`;
            gridItem.removeChild(chairContainer);
            // Decrement the count since we're removing a C chair
            if (allocatedCNumbersByStack[stackId] > 0) {
                allocatedCNumbersByStack[stackId]--;
            }

            let currentNumber = 1;
            document
                .querySelectorAll(`.chair-text-in-grid`)
                .forEach((element) => {
                    if (element.textContent.includes(`(${stackId})`)) {
                        element.textContent = `C${currentNumber++} (${stackId})`; // Update C chair number
                    }
                });
        }
    }
}

function addOrRemoveRobot(gridItem) {
    if (gridItem.querySelector(".chair-container-in-grid")) return; // Skip if there's a chair
    if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

    const hasRobot = gridItem.querySelector(".robot-in-grid"); // Check if there's a robot on grid item

    // Remove an existing robot from the grid, if any
    const existingRobot = document.querySelector(".robot-in-grid");
    if (existingRobot) existingRobot.parentElement.removeChild(existingRobot);

    // If there was no robot in the clicked grid item, add a new one
    if (!hasRobot) {
        const robotImage = document.createElement("img");
        robotImage.src = "robot.png";
        robotImage.alt = "Robot";
        robotImage.className = "robot-in-grid";
        robotImage.draggable = false;
        gridItem.appendChild(robotImage);
    }
}

function toggleHighlight(item) {
    // Check if the item is a stack or C chair and toggle highlight
    const chairText =
        item.querySelector(".chair-text-in-grid")?.textContent || "";
    if (chairText.startsWith("S") || chairText.startsWith("C")) {
        if (
            item.classList.contains("highlighted-stack") ||
            item.classList.contains("highlighted-chair")
        ) {
            // Unhighlight the stack and associated C chairs
            document
                .querySelectorAll(".highlighted-stack, .highlighted-chair")
                .forEach((el) =>
                    el.classList.remove(
                        "highlighted-stack",
                        "highlighted-chair"
                    )
                );
        } else {
            // Clear existing highlights
            document
                .querySelectorAll(".highlighted-stack, .highlighted-chair")
                .forEach((el) =>
                    el.classList.remove(
                        "highlighted-stack",
                        "highlighted-chair"
                    )
                );

            if (chairText.startsWith("S")) {
                // Highlight the stack
                item.classList.add("highlighted-stack");
                // Highlight associated C chairs
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent.includes(`(${chairText})`)) {
                            el.closest(".grid-item").classList.add(
                                "highlighted-chair"
                            );
                        }
                    });
            } else if (chairText.startsWith("C")) {
                // Highlight the C chair
                item.classList.add("highlighted-chair");
                // Extract the stack ID from the C chair text
                const stackId = chairText.match(/\((S\d+)\)/)[1];
                // Highlight the associated stack
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent === stackId) {
                            el.closest(".grid-item").classList.add(
                                "highlighted-stack"
                            );
                        }
                    });
                // Highlight all C chairs associated with this stack
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent.includes(`(${stackId})`)) {
                            el.closest(".grid-item").classList.add(
                                "highlighted-chair"
                            );
                        }
                    });
            }
        }
    }
}
