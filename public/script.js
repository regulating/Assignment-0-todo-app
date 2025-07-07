const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const newTask = document.createElement('li');
    newTask.textContent = taskInput.value;
    taskInput.value = '';
    taskList.appendChild(newTask);
});