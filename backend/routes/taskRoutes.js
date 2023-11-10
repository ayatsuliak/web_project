const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const uuid = require('uuid')
const tasksController = require('../controllers/tasksController')
const cors = require('cors');

const alowwedStatuses = ['processing', 'completed', 'failed', 'cancelled', 'waiting'];

router.use(cors({
  origin: 'http://localhost:3500',  // Replace with the actual origin of your client application
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}));

router.get('/user/:userId', cors(), async (req, res) => {
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

router.get('/tasks/status', cors(), async (req, res) => {
  try {
      const tasks = await Task.find({}, { _id: 1, status: 1 });

      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/cancel-task/:taskId', cors(), async (req, res) => {
    try {
      const taskId = req.params.taskId;
  
      const deletedTask = await Task.findByIdAndDelete(taskId);
  
      if (!deletedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.json({ message: 'Task canceled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.route('/')
    .get(tasksController.getAllTasks) 
    .post(tasksController.createNewTask) 
    .patch(tasksController.updateTask) 
    .delete(tasksController.deleteTask)

module.exports = router