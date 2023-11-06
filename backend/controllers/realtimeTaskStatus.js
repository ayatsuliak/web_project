const express = require('express');
const { Server } = require('socket.io');

const app = express();

const PORT = process.env.PORT || 3500;
app.set('port', PORT);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server);

// Отримати статус завдання і відправити його користувачеві
app.get('/task-status/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    // Отримати статус завдання з бази даних
    const status = getStatusForTask(taskId); // Ваша логіка для отримання статусу
    res.json({ status });
});

io.on('connection', (socket) => {
    // Приєднання користувача через WebSocket

    socket.on('subscribeToTask', (taskId) => {
        // Підписати користувача на оновлення статусу завдання
        socket.join(taskId);
    });

    socket.on('unsubscribeFromTask', (taskId) => {
        // Відписати користувача від оновлень статусу завдання
        socket.leave(taskId);
    });
});

// Відправити оновлення статусу завдання користувачеві, який підписаний на нього
function sendTaskStatusUpdate(taskId, status) {
    io.to(taskId).emit('taskStatusUpdate', { taskId, status });
}

// Клієнтський код (JavaScript)
// При підписці на завдання, запит на оновлення статусу і відображення його
function subscribeToTask(taskId) {
    socket.emit('subscribeToTask', taskId);

    socket.on('taskStatusUpdate', ({ taskId, status }) => {
        // Оновити статус завдання на сторінці
        updateTaskStatusOnPage(taskId, status);
    });
}

// При відписці від завдання
function unsubscribeFromTask(taskId) {
    socket.emit('unsubscribeFromTask', taskId);
}

// Запит на отримання статусу завдання та відображення його
async function getAndDisplayTaskStatus(taskId) {
    try {
        const response = await fetch(`/task-status/${taskId}`);
        const data = await response.json();
        const status = data.status;
        updateTaskStatusOnPage(taskId, status);
    } catch (error) {
        console.error('Error getting task status', error);
    }
}

// Оновлення статусу завдання на сторінці
function updateTaskStatusOnPage(taskId, status) {
    const taskElement = document.getElementById(`task-${taskId}`);

    if (taskElement) {
        // Оновіть текст або стиль елемента на сторінці, щоб відображати новий статус.
        taskElement.textContent = `Task ${taskId}: ${status}`;
    }
}