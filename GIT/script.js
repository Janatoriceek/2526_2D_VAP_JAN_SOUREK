const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('taskName').value;
    const date = document.getElementById('taskDate').value;

    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = name;
    span.className = 'task-name';
    span.onclick = () => alert('Datum splnění: ' + date);

    const button = document.createElement('button');
    button.textContent = 'Odstranit';
    button.onclick = () => li.remove();

    li.appendChild(span);
    li.appendChild(button);
    taskList.appendChild(li);

    form.reset();
});
