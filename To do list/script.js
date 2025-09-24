const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const itemsLeftSpan = document.getElementById('itemsLeft');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const editModal = document.getElementById('editModal');
const modalInput = document.getElementById('modalInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.querySelector('.modal-cancel-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let taskIndexToEdit = null; // Variable to hold the index of the task being edited

// --- Local Storage and UI Updates (No changes) ---

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateItemsLeft() {
    const activeCount = tasks.filter(task => !task.completed).length;
    itemsLeftSpan.textContent = `${activeCount} items left`;
}

// --- Rendering (No changes) ---

function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('task-item');
        emptyMessage.style.justifyContent = 'center';
        emptyMessage.style.opacity = '0.5';
        emptyMessage.textContent = 
            currentFilter === 'all' ? 'Your to-do list is empty!' : 
            currentFilter === 'active' ? 'No active tasks!' : 
            'No completed tasks yet.';
        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach((task, index) => {
        // Find the original index for editing
        const originalIndex = tasks.findIndex(t => t.text === task.text && t.completed === task.completed);

        const li = document.createElement('li');
        li.classList.add('task-item');
        if (task.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <div class="checkbox ${task.completed ? 'completed' : ''}" data-index="${originalIndex}">
                <i class="fas fa-check"></i>
            </div>
            <span class="task-text">${task.text}</span>
            <div class="actions">
                <button class="edit-btn" data-index="${originalIndex}"><i class="fas fa-pen"></i> Edit</button>
                <button class="delete-btn" data-index="${originalIndex}"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateItemsLeft();
}


// --- Event Handlers (Updated editTask) ---

function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        tasks.push({ text, completed: false });
        taskInput.value = '';
        saveTasks();
        renderTasks();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// *** UPDATED EDIT FUNCTION TO USE MODAL ***
function editTask(index) {
    taskIndexToEdit = index;
    modalInput.value = tasks[index].text;
    editModal.style.display = 'block';
    modalInput.focus();
}

function saveEdit() {
    const newText = modalInput.value.trim();
    if (newText && taskIndexToEdit !== null) {
        tasks[taskIndexToEdit].text = newText;
        saveTasks();
        renderTasks();
    }
    closeModal();
}

function closeModal() {
    editModal.style.display = 'none';
    taskIndexToEdit = null;
    modalInput.value = '';
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    renderTasks();
}

// --- Event Listeners ---

// Core interaction listeners (Add, Toggle, Delete)
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

taskList.addEventListener('click', (e) => {
    const target = e.target;
    const index = parseInt(target.closest('[data-index]')?.dataset.index);

    if (isNaN(index)) return;

    if (target.closest('.checkbox')) {
        toggleTask(index);
    } else if (target.closest('.delete-btn')) {
        deleteTask(index);
    } else if (target.closest('.edit-btn')) {
        // Opens the modal
        editTask(index); 
    }
});

// Modal listeners
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
saveEditBtn.addEventListener('click', saveEdit);

modalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveEdit();
    }
});

// Close modal if user clicks outside of it
window.addEventListener('click', (e) => {
    if (e.target == editModal) {
        closeModal();
    }
});


clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Initial render
renderTasks();