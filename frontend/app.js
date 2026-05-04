
async function fetchTasks() {
    const response = await fetch(`/api/tasks`);
    const tasks = await response.json();
    console.log('Fetched tasks:', tasks);
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <span class="task-desc">${task.description}</span>
            </div>
            <div class="task-actions">
                <span class="status ${task.status.toLowerCase()}">${task.status}</span>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Handle delete clicks via event delegation
document.getElementById('taskList').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    await fetchTasks();
                } else {
                    console.error('Failed to delete task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    }
});

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
    await fetchTasks();
    e.target.reset();
});

fetchTasks(); // Load tasks on start