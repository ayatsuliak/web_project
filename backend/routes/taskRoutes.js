const express = require('express')
const router = express.Router()
const { Task, deleteCancelledTasks } = require('../models/Task')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const tasksController = require('../controllers/tasksController')
const cors = require('cors');

const alowwedStatuses = ['processing', 'completed', 'failed', 'cancelled', 'waiting'];

router.get('/user/:userId', cors(), async (req, res) => {
  await deleteCancelledTasks();
  try {
      const userId = req.params.userId;

      const tasks = await Task.find({ user_id: userId });

      if (!tasks || tasks.length === 0) {
          return res.status(404).json({ message: 'No tasks found for this user' });
      }

      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/user/:userId', cors(), async (req, res) => {
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

router.patch('/:taskId/status', cors(), async (req, res) => {
  const { taskId } = req.params;
  const { newStatus } = req.body;

  if (!alowwedStatuses.includes(newStatus)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const task = await Task.findByIdAndUpdate(taskId, { status: newStatus });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:taskId/status', cors(), async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ status: task.status });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:taskId/answer', async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({ message: 'Task is not completed yet' });
    }

    return res.status(200).json({ answer: task.answer });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.route('/')
    .get(tasksController.getAllTasks) 
    .post(tasksController.createNewTask) 
    .patch(tasksController.updateTask) 
    .delete(tasksController.deleteTask)

module.exports = router