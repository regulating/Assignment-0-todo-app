const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

taskForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const description = taskInput.value.trim();
    if (description !== '') {
        await addTask(description);
        taskInput.value = '';
        loadTasks();
    }
});

// Load tasks from backend
async function loadTasks() {
    const res = await fetch('/tasks');
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
    console.log(`Attempting to toggle task ${id} to completed: ${isCompleted}`); // Debugging log
    try {
        const res = await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: isCompleted ? 1 : 0 })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Failed to toggle task completion. Server response:', res.status, errorData); // Debugging log
        } else {
            console.log(`Task ${id} completion successfully updated on server.`); // Debugging log
        }
    } catch (error) {
        console.error('Network or unexpected error during task completion toggle:', error); // Debugging log
    } finally {
        loadTasks(); // Always refresh list
    }
}

// Delete task from backend
async function deleteTask(id) {
    await fetch(`/tasks/${id}`, {
        method: 'DELETE'
    });
    loadTasks(); // Refresh list
}

// Initial load
loadTasks();