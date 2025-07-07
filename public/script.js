const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    if (taskInput.value.trim() !== '') {
        addTask(taskInput.value);
        taskInput.value = '';
    }
});

function addTask(taskText) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const span = document.createElement('span');
    span.textContent = taskText;
    li.appendChild(span);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => editTask(span, editBtn));
    li.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => li.remove());
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
}

function editTask(span, editBtn) {
    if (editBtn.textContent === 'Edit') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.className = 'edit-input';
        span.replaceWith(input);
        editBtn.textContent = 'Save';
    } else {
        const updatedText = span.previousElementSibling.value;
        span.textContent = updatedText;
        span.previousElementSibling.replaceWith(span);
        editBtn.textContent = 'Edit';
    }
}
