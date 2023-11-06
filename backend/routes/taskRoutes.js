const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const uuid = require('uuid')
const checkTaskLimit = require('../middleware/checkTaskLimit')
const tasksController = require('../controllers/tasksController')

router.get('/user/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;

      // Отримати всі завдання конкретного користувача
      const tasks = await Task.find({ user_id: userId });

      if (!tasks || tasks.length === 0) {
          return res.status(404).json({ message: 'No tasks found for this user' });
      }

      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/user/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;

      const result = await Task.deleteMany({ user_id: userId });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'No tasks found for this user' });
      }

      res.status(200).json({ message: 'All tasks for this user have been deleted' });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

// router.get('/tasks/:taskId', async (req, res) => {
//   try {
//     const taskId = req.params.taskId;

//     // Знайдіть завдання за ID у базі даних
//     const task = await Task.findById(taskId);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     res.status(200).json(task);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

router.patch('/update-status/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const newStatus = req.body.status; // Отримайте новий статус із запиту

    if (newStatus === undefined) {
      return res.status(400).json({ message: 'New status is required' });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Оновіть статус завдання
    task.status = newStatus;
    await task.save();

    res.json({ message: 'Task status updated', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/tasks', async (req, res) => {
  try {
      const number = req.body.data;

      // Генеруємо унікальний ідентифікатор для завдання
      const taskId = uuid.v4();

      // Зберігаємо taskId та завдання в базі даних

      // Повертаємо клієнту створений ідентифікатор
      res.json({ taskId, message: 'Task created successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/cancel-task/:taskId', async (req, res) => {
    try {
      const taskId = req.params.taskId;
  
      // Видаліть запис з таблиці Task за допомогою findByIdAndDelete
      const deletedTask = await Task.findByIdAndDelete(taskId);
  
      if (!deletedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Повідомте клієнта про успішне видалення задачі
      res.json({ message: 'Task canceled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.route('/')
    .get(tasksController.getAllTasks) //read
    .post(checkTaskLimit, tasksController.createNewTask) //create
    .patch(tasksController.updateTask) //update
    .delete(tasksController.deleteTask)

module.exports = router