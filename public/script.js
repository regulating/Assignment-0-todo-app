const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

// Global variable to store current filter
let currentFilter = 'all'; // Default filter

// Get filter buttons
const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');

// Add event listeners for filter buttons
filterAllBtn.addEventListener('click', () => {
    console.log('Filter All button clicked.'); // Debugging log
    setFilter('all');
});
filterActiveBtn.addEventListener('click', () => {
    console.log('Filter Active button clicked.'); // Debugging log
    setFilter('active');
});
filterCompletedBtn.addEventListener('click', () => {
    console.log('Filter Completed button clicked.'); // Debugging log
    setFilter('completed');
});

function setFilter(filter) {
    console.log(`setFilter function called with filter: ${filter}`); // Debugging log
    currentFilter = filter;
    // Update active class on buttons (for styling later)
    filterAllBtn.classList.remove('active');
    filterActiveBtn.classList.remove('active');
    filterCompletedBtn.classList.remove('active');
    document.getElementById(`filter-${filter}`).classList.add('active');
    loadTasks(); // Reload tasks with new filter
}

taskForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const description = taskInput.value.trim();
    if (description !== '') {
        await addTask(description);
        taskInput.value = '';
        loadTasks(); // Load tasks with current filter
    }
});

// Load tasks from backend
async function loadTasks() {
    let url = '/tasks';
    if (currentFilter === 'active') {
        url += '?status=active';
    } else if (currentFilter === 'completed') {
        url += '?status=completed';
    }
    console.log(`Fetching tasks with filter: ${currentFilter}, URL: ${url}`);

    const res = await fetch(url);
    const tasks = await res.json();

    taskList.innerHTML = ''; // Clear list

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed === 1;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, checkbox.checked));
        li.appendChild(checkbox);

        const span = document.createElement('span');
        span.textContent = task.description;
        if (task.completed === 1) {
            span.style.textDecoration = 'line-through';
            span.style.color = '#888';
        }
        li.appendChild(span);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.addEventListener('click', () => editTask(task.id, span, editBtn));
        li.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

// Add task to backend
async function addTask(description) {
    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    });
}

// Edit task in backend
async function editTask(id, span, editBtn) {
    if (editBtn.textContent === 'Edit') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.className = 'edit-input';
        span.replaceWith(input);
        editBtn.textContent = 'Save';
    } else {
        const updatedText = editBtn.previousElementSibling.value;
        await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: updatedText })
        });
        const spanNew = document.createElement('span');
        spanNew.textContent = updatedText;
        editBtn.previousElementSibling.replaceWith(spanNew);
        editBtn.textContent = 'Edit';
        loadTasks(); // Refresh list
    }
}

// Toggle task completion in backend
async function toggleTaskCompletion(id, isCompleted) {
    console.log(`Attempting to toggle task ${id} to completed: ${isCompleted}`);
    try {
        const res = await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: isCompleted ? 1 : 0 })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Failed to toggle task completion. Server response:', res.status, errorData);
        } else {
            console.log(`Task ${id} completion successfully updated on server.`);
        }
    } catch (error) {
        console.error('Network or unexpected error during task completion toggle:', error);
    } finally {
        loadTasks(); // Always refresh list with current filter
    }
}

// Delete task from backend
async function deleteTask(id) {
    await fetch(`/tasks/${id}`, {
        method: 'DELETE'
    });
    loadTasks(); // Refresh list with current filter
}

// Initial load
loadTasks();