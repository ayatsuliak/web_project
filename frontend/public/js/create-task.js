const token = localStorage.getItem('accessToken');

let cancelCalculation = false;
let calculationTimeout;
const tasks = []; 
const numberForm = document.getElementById('number-form');
const resultMessage = document.getElementById('result');
const createButton = document.getElementById('create-button');

const setLoggedInUser = async () => {
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
            } else {
                console.error('Помилка отримання даних користувача');
            }
        } catch (error) {
            console.error(error);
        }
    }
};

setLoggedInUser();

const errorMessage = document.getElementById('error-message');

function createTaskElement(taskId) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.id = `task-${taskId}`;

    const taskText = document.createElement('div');
    taskText.className = 'task-text';
    taskText.textContent = `Task ${taskId}: Waiting`;

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancel';

    cancelButton.addEventListener('click', () => {
        cancelTask(taskId);
    });

    taskDiv.appendChild(taskText);
    taskDiv.appendChild(cancelButton);

    document.getElementById('task-progress').appendChild(taskDiv);

    return taskText;
}

numberForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const numberInput = document.getElementById('number');
    const number = parseInt(numberInput.value);

    if (cancelCalculation) {
        resultMessage.textContent = 'Calculation cancelled';
        clearTimeout(calculationTimeout);
        return;
    }

    const currentTaskId = tasks.length + 1;
    const taskText = createTaskElement(currentTaskId);

    const timeoutSeconds = 5;

    const createTaskRequest = {
        data: number,
        userId: userId,
    };

    calculationTimeout = setTimeout(async () => {
        taskText.textContent = `Task ${currentTaskId}: Processing...`;
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(createTaskRequest),
            });

            if (response.ok) {
                const data = await response.json();
                resultMessage.textContent = data.message;
                taskText.textContent = `Task ${currentTaskId}: Completed, Result: ${data.data.answer}`;
                //updateTaskStatus(serverPort, data.data.id, 'completed');
            } else {
                if (response.status === 400) {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message;
                } else {
                errorMessage.textContent = 'Error creating task';
                }
                taskText.textContent = `Task ${currentTaskId}: Failed`;
                //updateTaskStatus(serverPort, data.data.id, 'failed');
            }
        } catch (error) {
            errorMessage.textContent = 'An error occurred';
            taskText.textContent = `Task ${currentTaskId}: Failed`;
            //(serverPort, data.data.id, 'failed');
        }
    }, timeoutSeconds * 1000);

    tasks.push({ id: currentTaskId, timeout: calculationTimeout });
});


async function updateTaskStatus(serverPort, taskId, status) {
    try {
        const response = await fetch(`http://localhost:${serverPort}/tasks/${taskId}/status`, { 
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ newStatus: status }), 
        });

        if (response.ok) {
            const data = await response.json();
            const taskElement = document.getElementById(`task-${taskId}`);
            if (taskElement) {
                taskElement.textContent = `Task ${taskId}: ${status}`;
            }
        } else {
            console.error('Помилка оновлення статусу завдання на сервері');
        }
    } catch (error) {
        console.error('Помилка оновлення статусу завдання', error);
    }
}

function cancelTask(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
        clearTimeout(task.timeout);
        const taskDiv = document.getElementById(`task-${taskId}`);
        if (taskDiv) {
            taskDiv.remove();
        }
    }
}

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