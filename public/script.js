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

        const span = document.createElement('span');
        span.textContent = task.description;
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

// Delete task from backend
async function deleteTask(id) {
    await fetch(`/tasks/${id}`, {
        method: 'DELETE'
    });
    loadTasks(); // Refresh list
}

// Initial load
loadTasks();
