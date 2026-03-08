
async function fetchTasks() {
    const response = await fetch(`/api/tasks`);
    const tasks = await response.json();
    console.log('Fetched tasks:', tasks);
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title} - ${task.description} (${task.status})`;
        taskList.appendChild(li);
    });
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;
    await fetch(`/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status })
    });
    fetchTasks();
});

fetchTasks(); // Load tasks on start