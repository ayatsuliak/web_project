function clearUserTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; 
}

const token = localStorage.getItem('accessToken');
let userId;

async function fetchUserTasks() {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        try {
            const response = await fetch('/auth/get-logged-in-user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const user = await response.json();
                usernameElement.textContent = user.username;
                userId = user.id; 
                await displayUserTasks(userId);
            } else {
                console.error('Помилка отримання даних користувача');
            }
        } catch (error) {
            console.error(error);
        }
    }
}

async function displayUserTasks(userId) {
    const taskList = document.getElementById('task-list');

    const response = await fetch(`/tasks/user/${userId}`);
    if (!response.ok) {
        console.error('Помилка отримання завдань користувача');
        return;
    }

    const tasks = await response.json();

    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const taskItem = document.createElement('div');
        taskItem.textContent = `Data: ${task.data}\tResult: ${task.answer}`; 
        taskList.appendChild(taskItem);
    });
}

fetchUserTasks();

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', async () => {            
    const response = await fetch('/auth/logout');
    if (response.ok) {  
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            window.location.href = 'login.html';
        } else {
            window.location.href = 'login.html';
        }
    }
});  

const deleteAllTasksButton = document.getElementById('delete-all-tasks');

deleteAllTasksButton.addEventListener('click', async () => {
    try {
        const response = await fetch(`/tasks/user/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            clearUserTasks();
        } else {
            console.error('Помилка видалення завдань користувача:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Помилка видалення завдань користувача:', error);
    }
});