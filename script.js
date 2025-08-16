// --- Main Application State and UI Handlers ---
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.section');
    const themeToggle = document.getElementById('theme-toggle');

    // Handle navigation between sections
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(`${button.dataset.section}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Handle dark/light theme toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.dataset.theme === 'dark';
        document.body.dataset.theme = isDark ? '' : 'dark';
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
});

// --- Utility Functions ---
// Creates a delay to visualize the algorithm step by step
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Global state for sorting and pathfinding
let isSorting = false;
let isPaused = false;
let isPathfinding = false;

// --- Sorting Visualizer Logic ---
const sortContainer = document.getElementById('sorting-container');
const generateArrayBtn = document.getElementById('generate-array-btn');
const startSortBtn = document.getElementById('start-sort-btn');
const pauseSortBtn = document.getElementById('pause-sort-btn');
const sortAlgorithmSelect = document.getElementById('sort-algorithm');
const arrayInput = document.getElementById('array-input');
const createCustomArrayBtn = document.getElementById('create-custom-array-btn');
const speedInput = document.getElementById('animation-speed');
const speedValueSpan = document.getElementById('speed-value');
const stepsCountSpan = document.getElementById('steps-count');
const timeComplexitySpan = document.getElementById('time-complexity');
const sortNotesBtn = document.getElementById('sort-notes-btn');

let array = [];
let animationSpeed = 500; // Default speed, a high value for a slower animation
let steps = 0;

// Notes content for the modal
const notes = {
    sorting: {
        bubble: {
            title: "Bubble Sort",
            body: "This is the simplest way to sort numbers. It works by **comparing two numbers next to each other** and swapping them if they're in the wrong order. It repeats this process until the whole list is sorted. It gets its name because the largest numbers \"bubble\" up to the end of the list. <br><br> <strong>Time Complexity: $O(n^2)$</strong>"
        },
        insertion: {
            title: "Insertion Sort",
            body: "This algorithm builds the final sorted list one item at a time. It goes through the list, taking one number at a time and **inserting it into the correct spot** in the already-sorted part of the list. <br><br> <strong>Analogy:</strong> Think of sorting a hand of playing cards. You pick up one card at a time and put it in the right place in your hand. <br><br> <strong>Time Complexity: $O(n^2)$</strong>"
        },
        merge: {
            title: "Merge Sort",
            body: "This is a **\"divide and conquer\"** algorithm. It first breaks the list into smaller and smaller pieces until each piece has only one number. Then, it **merges the pieces back together in the correct sorted order**. <br><br> <strong>Time Complexity: $O(n \log n)$</strong>"
        },
        quick: {
            title: "Quick Sort",
            body: "This is another **\"divide and conquer\"** algorithm. It chooses one number as a **\"pivot\"** and then moves all smaller numbers to its left and all larger numbers to its right. It then repeats this process on the smaller groups of numbers until everything is sorted. <br><br> <strong>Time Complexity: $O(n \log n)$ on average.</strong>"
        },
        heap: {
            title: "Heap Sort",
            body: "This algorithm uses a special tree-like structure called a **\"heap\"**. It first rearranges the numbers so that the biggest number is always at the top. It then **removes the biggest number and places it at the end**, and repeats this process until the list is sorted. <br><br> <strong>Time Complexity: $O(n \log n)$</strong>"
        }
    },
    pathfinding: {
        bfs: {
            title: "Breadth-First Search (BFS)",
            body: "BFS explores a grid **level by level**. It checks all direct neighbors of a point before moving on to the next layer of neighbors. This guarantees it will find the shortest path in a simple grid. <br><br> <strong>Analogy:</strong> Imagine a ripple spreading out in a pond. It touches everything on the first ring before moving to the second, then the third, and so on. <br><br> <strong>Time Complexity: $O(V + E)$ where V is nodes and E is edges.</strong>"
        },
        dfs: {
            title: "Depth-First Search (DFS)",
            body: "DFS explores as far as possible down one path before trying another. If it hits a dead end, it goes back to the last place it could have made a different choice and tries a new path. <br><br> <strong>Analogy:</strong> You're in a maze and at every fork, you just pick one path and keep going until you can't anymore. Then, you backtrack to the last fork and try a new one. <br><br> <strong>Time Complexity: $O(V + E)$ where V is nodes and E is edges.</strong>"
        },
        dijkstra: {
            title: "Dijkstra's Algorithm",
            body: "Dijkstra's is used to find the **shortest path in a grid where each step has a cost**. It works by visiting nodes in order of their cost from the start. Since our grid has no weights, it will also find the shortest path. <br><br> <strong>Analogy:</strong> You're at home and want to find the fastest route to a store. You always check the closest, unvisited roads first. <br><br> <strong>Time Complexity: $O(E + V \log V)$</strong>"
        },
        aStar: {
            title: "A* Search",
            body: "A* is a smarter version of Dijkstra's. It uses a **heuristic** (a simple guess) to estimate how close a spot is to the goal. It prioritizes checking spots that are both close to the start and appear to be in the right direction towards the end. This makes it much faster than Dijkstra's on large grids. <br><br> <strong>Analogy:</strong> You're navigating on a map. You don't just consider the roads you've traveled but also how much closer a new road gets you to your destination. <br><br> <strong>Time Complexity: $O(E + V \log V)$</strong>"
        }
    }
};

// This array maps the slider value to a descriptive speed string
const speedMap = {
    '1': 'Very Slow', '25': 'Slow', '50': 'Medium', '75': 'Fast', '100': 'Very Fast'
};

// Displays a message to the user, fading out after a delay
const showMessage = (message) => {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: var(--container-bg); color: var(--text-color); padding: 10px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000;
        opacity: 0; transition: opacity 0.5s ease-in-out;
    `;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
        msgDiv.style.opacity = 1;
    }, 10);
    setTimeout(() => {
        msgDiv.style.opacity = 0;
        setTimeout(() => msgDiv.remove(), 500);
    }, 3000);
};

// Generates a new array with random values and renders the bars
const generateNewArray = () => {
    if (isSorting) return;
    array = [];
    const arraySize = Math.floor(Math.random() * (70 - 15 + 1)) + 15;
    for (let i = 0; i < arraySize; i++) {
        array.push(Math.floor(Math.random() * (400 - 20 + 1)) + 20);
    }
    renderBars();
    steps = 0;
    stepsCountSpan.textContent = `Steps: 0`;
};

// Renders the bars based on the current array
const renderBars = () => {
    sortContainer.innerHTML = '';
    const arraySize = array.length;
    const barWidth = 100 / arraySize - 0.5;
    array.forEach(value => {
        const barContainer = document.createElement('div');
        barContainer.classList.add('bar-container');
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value}px`;
        bar.style.width = `${barWidth}%`;
        const barValue = document.createElement('span');
        barValue.classList.add('bar-value');
        barValue.textContent = value;
        
        bar.appendChild(barValue);
        barContainer.appendChild(bar);
        sortContainer.appendChild(barContainer);
    });
};

// Updates the visual representation of the bars
const updateVisualizer = (indices, className, duration) => {
    const barContainers = document.querySelectorAll('.bar-container');
    indices.forEach(index => {
        if (barContainers[index]) {
            barContainers[index].querySelector('.bar').classList.add(className);
        }
    });
    return new Promise(resolve => setTimeout(() => {
        indices.forEach(index => {
            if (barContainers[index]) {
                barContainers[index].querySelector('.bar').classList.remove(className);
            }
        });
        resolve();
    }, duration));
};

// Swaps two elements in the array and their corresponding bars
const swap = async (arr, i, j) => {
    const barContainers = document.querySelectorAll('.bar-container');
    await updateVisualizer([i, j], 'swapping', animationSpeed);
    [arr[i], arr[j]] = [arr[j], arr[i]];
    barContainers[i].querySelector('.bar').style.height = `${arr[i]}px`;
    barContainers[j].querySelector('.bar').style.height = `${arr[j]}px`;
    barContainers[i].querySelector('.bar-value').textContent = arr[i];
    barContainers[j].querySelector('.bar-value').textContent = arr[j];
    await updateVisualizer([i, j], 'swapping', animationSpeed);
    steps++;
    stepsCountSpan.textContent = `Steps: ${steps}`;
};

// --- Sorting Algorithms (with async for visualization) ---

const bubbleSort = async () => {
    const n = array.length;
    const barContainers = document.querySelectorAll('.bar-container');
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            await updateVisualizer([j, j + 1], 'comparing', animationSpeed);
            if (array[j] > array[j + 1]) {
                await swap(array, j, j + 1);
            }
            if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        }
        barContainers[n - 1 - i].querySelector('.bar').classList.add('sorted');
    }
    barContainers[0].querySelector('.bar').classList.add('sorted');
};

const insertionSort = async () => {
    const n = array.length;
    const barContainers = document.querySelectorAll('.bar-container');
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        barContainers[i].querySelector('.bar').classList.add('swapping');
        while (j >= 0 && array[j] > key) {
            await updateVisualizer([j, i], 'comparing', animationSpeed);
            await delay(animationSpeed);
            array[j + 1] = array[j];
            barContainers[j+1].querySelector('.bar').style.height = `${array[j+1]}px`;
            barContainers[j+1].querySelector('.bar-value').textContent = array[j+1];
            j--;
            steps++;
            stepsCountSpan.textContent = `Steps: ${steps}`;
            if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        }
        array[j + 1] = key;
        barContainers[j+1].querySelector('.bar').style.height = `${array[j+1]}px`;
        barContainers[j+1].querySelector('.bar-value').textContent = array[j+1];
        barContainers[i].querySelector('.bar').classList.remove('swapping');
        
    }
    // All elements are sorted at the end of the outer loop
    for(let i=0; i<n; i++) {
        barContainers[i].querySelector('.bar').classList.add('sorted');
    }
};

const mergeSort = async (arr, l, r) => {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    await mergeSort(arr, l, m);
    await mergeSort(arr, m + 1, r);
    await merge(arr, l, m, r);
};

const merge = async (arr, l, m, r) => {
    const barContainers = document.querySelectorAll('.bar-container');
    let tempArr = new Array(r - l + 1);
    let i = l, j = m + 1, k = 0;
    
    while (i <= m && j <= r) {
        await updateVisualizer([i, j], 'comparing', animationSpeed);
        if (arr[i] <= arr[j]) {
            tempArr[k++] = arr[i++];
        } else {
            tempArr[k++] = arr[j++];
        }
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
    }
    while (i <= m) {
        tempArr[k++] = arr[i++];
    }
    while (j <= r) {
        tempArr[k++] = arr[j++];
    }
    for (let p = 0; p < tempArr.length; p++) {
        arr[l + p] = tempArr[p];
        barContainers[l + p].querySelector('.bar').style.height = `${arr[l + p]}px`;
        barContainers[l + p].querySelector('.bar-value').textContent = arr[l + p];
        barContainers[l + p].querySelector('.bar').classList.add('swapping');
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        await delay(animationSpeed);
        steps++;
        stepsCountSpan.textContent = `Steps: ${steps}`;
    }
    for (let p = 0; p < tempArr.length; p++) {
        barContainers[l + p].querySelector('.bar').classList.remove('swapping');
    }
};

const quickSort = async (arr, low, high) => {
    if (low >= high) {
        if(low === high) document.querySelectorAll('.bar-container')[low].querySelector('.bar').classList.add('sorted');
        return;
    }
    const barContainers = document.querySelectorAll('.bar-container');
    let pivotIndex = await partition(arr, low, high);
    barContainers[pivotIndex].querySelector('.bar').classList.add('sorted');
    await quickSort(arr, low, pivotIndex - 1);
    await quickSort(arr, pivotIndex + 1, high);
};

const partition = async (arr, low, high) => {
    const barContainers = document.querySelectorAll('.bar-container');
    let pivot = arr[high];
    barContainers[high].querySelector('.bar').classList.add('comparing');
    let i = low - 1;
    for (let j = low; j < high; j++) {
        await updateVisualizer([j], 'comparing', animationSpeed);
        if (arr[j] < pivot) {
            i++;
            await swap(arr, i, j);
        }
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
    }
    await swap(arr, i + 1, high);
    barContainers[high].querySelector('.bar').classList.remove('comparing');
    return i + 1;
};

const heapSort = async () => {
    const n = array.length;
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(array, n, i);
    }
    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        await swap(array, 0, i);
        document.querySelectorAll('.bar-container')[i].querySelector('.bar').classList.add('sorted');
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        // Call max heapify on the reduced heap
        await heapify(array, i, 0);
    }
    document.querySelectorAll('.bar-container')[0].querySelector('.bar').classList.add('sorted');
};

const heapify = async (arr, n, i) => {
    const barContainers = document.querySelectorAll('.bar-container');
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }

    if (largest !== i) {
        await updateVisualizer([i, largest], 'comparing', animationSpeed);
        await swap(arr, i, largest);
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        await heapify(arr, n, largest);
    }
};


// --- Sorting Control Handlers ---
generateArrayBtn.addEventListener('click', () => {
    generateNewArray();
});

createCustomArrayBtn.addEventListener('click', () => {
    if (isSorting) return;
    const input = arrayInput.value.split(',').map(val => parseInt(val.trim()));
    if (input.some(isNaN) || input.length < 2) {
        showMessage('Invalid input. Please enter comma-separated numbers.');
        return;
    }
    array = input;
    renderBars();
    steps = 0;
    stepsCountSpan.textContent = `Steps: 0`;
});

sortAlgorithmSelect.addEventListener('change', () => {
    sortNotesBtn.disabled = false;
});

startSortBtn.addEventListener('click', async () => {
    if (isSorting) return;
    if (array.length === 0) {
        showMessage('Please generate or create an array first!');
        return;
    }
    isSorting = true;
    isPaused = false;
    startSortBtn.disabled = true;
    generateArrayBtn.disabled = true;
    createCustomArrayBtn.disabled = true;
    pauseSortBtn.disabled = false;
    sortNotesBtn.disabled = true;
    
    const algorithm = sortAlgorithmSelect.value;
    const complexity = {
        'bubble': '$O(n^2)$',
        'insertion': '$O(n^2)$',
        'merge': '$O(n \log n)$',
        'quick': '$O(n \log n)$',
        'heap': '$O(n \log n)$'
    };
    timeComplexitySpan.textContent = `Time: ${complexity[algorithm]}`;

    await delay(500); // Give a brief pause before starting

    const barContainers = document.querySelectorAll('.bar-container');
    for (const barContainer of barContainers) {
        barContainer.querySelector('.bar').classList.remove('sorted');
    }
    steps = 0;
    
    switch (algorithm) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'insertion':
            await insertionSort();
            break;
        case 'merge':
            await mergeSort(array, 0, array.length - 1);
            break;
        case 'quick':
            await quickSort(array, 0, array.length - 1);
            break;
        case 'heap':
            await heapSort();
            break;
    }
    
    // Finalize sorted state
    for (const barContainer of document.querySelectorAll('.bar-container')) {
        barContainer.querySelector('.bar').classList.add('sorted');
    }

    showMessage('Sorting complete!');
    isSorting = false;
    isPaused = false;
    startSortBtn.disabled = false;
    generateArrayBtn.disabled = false;
    createCustomArrayBtn.disabled = false;
    pauseSortBtn.disabled = true;
    pauseSortBtn.textContent = 'Pause';
    sortNotesBtn.disabled = false;
});

pauseSortBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseSortBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

speedInput.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    animationSpeed = 1000 - (value * 10);
    
    let speedText = 'Very Slow';
    if (value > 25) speedText = 'Slow';
    if (value > 50) speedText = 'Medium';
    if (value > 75) speedText = 'Fast';
    if (value > 90) speedText = 'Very Fast';
    
    speedValueSpan.textContent = speedText;
});

// Initial setup
generateNewArray();

sortNotesBtn.addEventListener('click', () => {
    const algo = sortAlgorithmSelect.value;
    const note = notes.sorting[algo];
    showNotesModal(note.title, note.body);
});

// --- Pathfinding Visualizer Logic ---
const pathfindingContainer = document.getElementById('grid');
const generateMazeBtn = document.getElementById('generate-maze-btn');
const setStartBtn = document.getElementById('set-start-btn');
const setEndBtn = document.getElementById('set-end-btn');
const startPathBtn = document.getElementById('start-path-btn');
const resetPathBtn = document.getElementById('reset-path-btn');
const pathAlgorithmSelect = document.getElementById('path-algorithm');
const pathStepsSpan = document.getElementById('path-steps');
const visitedNodesSpan = document.getElementById('visited-nodes');
const pathNotesBtn = document.getElementById('path-notes-btn');

let isSettingStart = false;
let isSettingEnd = false;
let startNode = null;
let endNode = null;
let grid = [];
const ROWS = 25;
const COLS = 50;
let visitedCount = 0;

// Creates the grid and initializes nodes
const createGrid = () => {
    pathfindingContainer.innerHTML = '';
    pathfindingContainer.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    grid = [];
    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            const node = document.createElement('div');
            node.classList.add('node');
            node.dataset.row = row;
            node.dataset.col = col;
            node.addEventListener('click', () => handleNodeClick(node, row, col));
            pathfindingContainer.appendChild(node);
            currentRow.push({
                row, col, isWall: false,
                isStart: false, isEnd: false,
                distance: Infinity, isVisited: false,
                previousNode: null, weight: 1
            });
        }
        grid.push(currentRow);
    }
    startNode = null;
    endNode = null;
    resetState();
};

const resetState = () => {
    visitedCount = 0;
    visitedNodesSpan.textContent = `Visited Nodes: 0`;
    pathStepsSpan.textContent = `Path Length: 0`;
    isPathfinding = false;
    startPathBtn.disabled = false;
    pathfindingContainer.querySelectorAll('.node').forEach(node => {
        if (!node.classList.contains('start') && !node.classList.contains('end') && !node.classList.contains('wall')) {
            node.classList.remove('visited', 'path');
        }
    });
};

const handleNodeClick = (node, row, col) => {
    if (isPathfinding) return;

    if (isSettingStart) {
        if (startNode) startNode.classList.remove('start');
        startNode = node;
        node.classList.add('start');
        node.classList.remove('wall', 'end');
        isSettingStart = false;
        setStartBtn.textContent = 'Set Start Node';
        showMessage('Start node set!');
    } else if (isSettingEnd) {
        if (endNode) endNode.classList.remove('end');
        endNode = node;
        node.classList.add('end');
        node.classList.remove('wall', 'start');
        isSettingEnd = false;
        setEndBtn.textContent = 'Set End Node';
        showMessage('End node set!');
    } else if (!node.classList.contains('start') && !node.classList.contains('end')) {
        node.classList.toggle('wall');
        grid[row][col].isWall = node.classList.contains('wall');
    }
};

// Generates a random maze by adding walls
const generateMaze = () => {
    if (isPathfinding) return;
    resetState();
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = pathfindingContainer.children[row * COLS + col];
            if (Math.random() < 0.25 && !node.classList.contains('start') && !node.classList.contains('end')) {
                node.classList.add('wall');
                grid[row][col].isWall = true;
            } else {
                node.classList.remove('wall');
                grid[row][col].isWall = false;
            }
        }
    }
};

// --- Pathfinding Algorithms ---

const bfs = async (start, end) => {
    const queue = [start];
    const visited = new Set();
    visited.add(`${start.row}-${start.col}`);
    start.distance = 0;

    while (queue.length > 0) {
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        const current = queue.shift();
        
        visitedCount++;
        visitedNodesSpan.textContent = `Visited Nodes: ${visitedCount}`;

        const nodeElement = pathfindingContainer.children[current.row * COLS + current.col];
        if (!nodeElement.classList.contains('start') && !nodeElement.classList.contains('end')) {
            nodeElement.classList.add('visited');
        }
        await delay(20);

        if (current.row === end.row && current.col === end.col) {
            return reconstructPath(current);
        }

        const neighbors = getNeighbors(current.row, current.col);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
            if (!visited.has(neighborKey) && !neighbor.isWall) {
                visited.add(neighborKey);
                neighbor.previousNode = current;
                queue.push(neighbor);
            }
        }
    }
    return null; // Path not found
};

const dfs = async (start, end) => {
    const stack = [start];
    const visited = new Set();
    visited.add(`${start.row}-${start.col}`);
    start.distance = 0;

    while (stack.length > 0) {
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        const current = stack.pop();

        visitedCount++;
        visitedNodesSpan.textContent = `Visited Nodes: ${visitedCount}`;

        const nodeElement = pathfindingContainer.children[current.row * COLS + current.col];
        if (!nodeElement.classList.contains('start') && !nodeElement.classList.contains('end')) {
            nodeElement.classList.add('visited');
        }
        await delay(20);

        if (current.row === end.row && current.col === end.col) {
            return reconstructPath(current);
        }

        const neighbors = getNeighbors(current.row, current.col).reverse();
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
            if (!visited.has(neighborKey) && !neighbor.isWall) {
                visited.add(neighborKey);
                neighbor.previousNode = current;
                stack.push(neighbor);
            }
        }
    }
    return null; // Path not found
};

const dijkstra = async (start, end) => {
    const distances = {};
    const visited = new Set();
    const unvisitedNodes = [];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            distances[`${node.row}-${node.col}`] = Infinity;
            unvisitedNodes.push(node);
        }
    }
    distances[`${start.row}-${start.col}`] = 0;

    while (unvisitedNodes.length > 0) {
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        unvisitedNodes.sort((a, b) => distances[`${a.row}-${a.col}`] - distances[`${b.row}-${b.col}`]);
        const current = unvisitedNodes.shift();

        if (current.isWall) continue;
        if (distances[`${current.row}-${current.col}`] === Infinity) return null;

        visited.add(current);
        visitedCount++;
        visitedNodesSpan.textContent = `Visited Nodes: ${visitedCount}`;

        const nodeElement = pathfindingContainer.children[current.row * COLS + current.col];
        if (!nodeElement.classList.contains('start') && !nodeElement.classList.contains('end')) {
            nodeElement.classList.add('visited');
        }
        await delay(20);

        if (current.row === end.row && current.col === end.col) {
            return reconstructPath(current);
        }
        
        const neighbors = getNeighbors(current.row, current.col);
        for (const neighbor of neighbors) {
            if (visited.has(neighbor)) continue;
            const newDist = distances[`${current.row}-${current.col}`] + neighbor.weight;
            if (newDist < distances[`${neighbor.row}-${neighbor.col}`]) {
                distances[`${neighbor.row}-${neighbor.col}`] = newDist;
                neighbor.previousNode = current;
            }
        }
    }
    return null;
};

const aStar = async (start, end) => {
    const openSet = [];
    const cameFrom = {};
    const gScore = {}; // Cost from start to current node
    const fScore = {}; // Estimated cost from start to end

    // Priority Queue-like behavior using an array
    const addToOpenSet = (node) => {
        openSet.push(node);
        openSet.sort((a, b) => fScore[`${a.row}-${a.col}`] - fScore[`${b.row}-${b.col}`]);
    };

    const getLowestFScoreNode = () => {
        return openSet.shift();
    };

    for(let r = 0; r < ROWS; r++) {
        for(let c = 0; c < COLS; c++) {
            gScore[`${r}-${c}`] = Infinity;
            fScore[`${r}-${c}`] = Infinity;
        }
    }

    gScore[`${start.row}-${start.col}`] = 0;
    fScore[`${start.row}-${start.col}`] = heuristic(start, end);
    addToOpenSet(start);

    while(openSet.length > 0) {
        if (isPaused) await new Promise(resolve => pauseSortBtn.addEventListener('click', () => resolve(), { once: true }));
        const current = getLowestFScoreNode();
        
        visitedCount++;
        visitedNodesSpan.textContent = `Visited Nodes: ${visitedCount}`;

        const nodeElement = pathfindingContainer.children[current.row * COLS + current.col];
        if (!nodeElement.classList.contains('start') && !nodeElement.classList.contains('end')) {
            nodeElement.classList.add('visited');
        }
        await delay(20);

        if (current.row === end.row && current.col === end.col) {
            return reconstructPath(current);
        }

        const neighbors = getNeighbors(current.row, current.col);
        for (const neighbor of neighbors) {
            if(neighbor.isWall) continue;
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
            const tentativeGScore = gScore[`${current.row}-${current.col}`] + 1;

            if (tentativeGScore < gScore[neighborKey]) {
                neighbor.previousNode = current;
                gScore[neighborKey] = tentativeGScore;
                fScore[neighborKey] = gScore[neighborKey] + heuristic(neighbor, end);
                if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                    addToOpenSet(neighbor);
                }
            }
        }
    }
    return null; // Path not found
};

// Helper for A* heuristic (Manhattan distance)
const heuristic = (nodeA, nodeB) => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
};


// Reconstructs the path from end to start and highlights it
const reconstructPath = async (currentNode) => {
    const path = [];
    let steps = 0;
    while (currentNode.previousNode) {
        path.push(currentNode);
        currentNode = currentNode.previousNode;
        steps++;
    }
    
    pathStepsSpan.textContent = `Path Length: ${steps}`;

    // Animate the path
    for (let i = path.length - 1; i >= 0; i--) {
        const node = path[i];
        const nodeElement = pathfindingContainer.children[node.row * COLS + node.col];
        if (!nodeElement.classList.contains('start') && !nodeElement.classList.contains('end')) {
            nodeElement.classList.remove('visited');
            nodeElement.classList.add('path');
        }
        await delay(40);
    }

    return path;
};

// Gets valid neighbors for a given node
const getNeighbors = (row, col) => {
    const neighbors = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Right, Left, Down, Up
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            neighbors.push(grid[newRow][newCol]);
        }
    }
    return neighbors;
};

// --- Pathfinding Control Handlers ---
createGrid();

pathAlgorithmSelect.addEventListener('change', () => {
    pathNotesBtn.disabled = false;
});

setStartBtn.addEventListener('click', () => {
    isSettingStart = true;
    isSettingEnd = false;
    setStartBtn.textContent = 'Click on grid...';
    setEndBtn.textContent = 'Set End Node';
});

setEndBtn.addEventListener('click', () => {
    isSettingEnd = true;
    isSettingStart = false;
    setEndBtn.textContent = 'Click on grid...';
    setStartBtn.textContent = 'Set Start Node';
});

generateMazeBtn.addEventListener('click', () => {
    generateMaze();
});

startPathBtn.addEventListener('click', async () => {
    if (isPathfinding) return;
    if (!startNode || !endNode) {
        showMessage('Please set both start and end nodes.');
        return;
    }
    isPathfinding = true;
    startPathBtn.disabled = true;
    
    // Reset node states for a new search
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            node.distance = Infinity;
            node.isVisited = false;
            node.previousNode = null;
            const nodeElement = pathfindingContainer.children[row * COLS + col];
            if (!nodeElement.classList.contains('start') && !nodeElement.classList.contains('end') && !nodeElement.classList.contains('wall')) {
                nodeElement.classList.remove('visited', 'path');
            }
        }
    }
    
    const startGridNode = grid[startNode.dataset.row][startNode.dataset.col];
    const endGridNode = grid[endNode.dataset.row][endNode.dataset.col];
    
    const algorithm = pathAlgorithmSelect.value;
    let foundPath = null;
    switch (algorithm) {
        case 'bfs':
            foundPath = await bfs(startGridNode, endGridNode);
            break;
        case 'dfs':
            foundPath = await dfs(startGridNode, endGridNode);
            break;
        case 'dijkstra':
            foundPath = await dijkstra(startGridNode, endGridNode);
            break;
        case 'aStar':
            foundPath = await aStar(startGridNode, endGridNode);
            break;
    }

    if (foundPath) {
        showMessage('Path found!');
    } else {
        showMessage('No path found.');
    }

    isPathfinding = false;
    startPathBtn.disabled = false;
});

resetPathBtn.addEventListener('click', () => {
    if (isPathfinding) return;
    createGrid();
    showMessage('Grid reset.');
});

pathNotesBtn.addEventListener('click', () => {
    const algo = pathAlgorithmSelect.value;
    const note = notes.pathfinding[algo];
    showNotesModal(note.title, note.body);
});

// --- Modal Logic ---
const notesModal = document.getElementById('notes-modal');
const closeButton = document.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

const showNotesModal = (title, body) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    notesModal.style.display = 'block';
};

closeButton.addEventListener('click', () => {
    notesModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === notesModal) {
        notesModal.style.display = 'none';
    }
});