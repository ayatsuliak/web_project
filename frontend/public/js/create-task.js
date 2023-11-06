let cancelCalculation = false;
        let calculationTimeout;
        const tasks = []; // Масив для зберігання інформації про завдання

        const numberForm = document.getElementById('number-form');
        const resultMessage = document.getElementById('result');
        const createButton = document.getElementById('create-button');

        numberForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const numberInput = document.getElementById('number');
            const number = parseInt(numberInput.value);

            if (cancelCalculation) {
                resultMessage.textContent = 'Розрахунок скасовано';
                clearTimeout(calculationTimeout);
                return;
            }

            const currentTaskId = tasks.length + 1;
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.id = `task-${currentTaskId}`;

            const taskText = document.createElement('div');
            taskText.className = 'task-text';
            taskText.textContent = `Завдання ${currentTaskId}: Очікування`;

            const cancelButton = document.createElement('button');
            cancelButton.className = 'cancel-button';
            cancelButton.textContent = 'Скасувати';

            cancelButton.addEventListener('click', () => {
                cancelTask(currentTaskId);
            });

            taskDiv.appendChild(taskText);
            taskDiv.appendChild(cancelButton);

            document.getElementById('task-progress').appendChild(taskDiv);

            const timeoutSeconds = 15;
            calculationTimeout = setTimeout(() => {
                taskText.textContent = `Завдання ${currentTaskId}: В процесі`;
                simulateTaskCompletion(currentTaskId, number);
            }, timeoutSeconds * 1000);

            tasks.push({ id: currentTaskId, timeout: calculationTimeout });
        });

        function updateTaskStatus(taskId, status) {
            const taskText = document.querySelector(`#task-${taskId} .task-text`);
            if (taskText) {
                taskText.textContent = `Завдання ${taskId}: ${status}`;
            }
        };

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