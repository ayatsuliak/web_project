const Task = require('../models/Task')
const checkTaskLimit = require('../middleware/checkTaskLimit')
const calculateHappyNumber = require('../controllers/happyNumberController')
const asyncHandler = require('express-async-handler')

const getAllTasks = asyncHandler(async (req, res) => {
    try {
        const tasks = await Task.find();

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found' });
        }

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }    
});

const createNewTask = asyncHandler(async (req, res) => {
    const { data } = req.body    
    if (!data) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //const token = req.headers.authorization.split(' ')[1];

    //const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user_id = req.session.userId;

    checkTaskLimit(req, res, async () => {
        const answer = calculateHappyNumber(data);
        const taskObject = { user_id, data, answer, status: 'waiting' }        
        const task = await Task.create(taskObject)
    
        if (task) {
            res.status(201).json({ message: `New task created`, data: { id: task._id, user_id, data, answer } });
        } else {
            res.status(400).json({ message: 'Invalid task data received' })
        }
    }); 
})

const updateTask = asyncHandler(async (req, res) => {
    const { id, data, status } = req.body; // Додали status до деструктуризації

    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await Task.findById(id).exec();

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (data) {
        task.data = data;
    }

    if (status) {
        task.status = status; // Оновлення статусу
    }

    const updatedTask = await task.save();

    res.json({ message: 'Task updated', updatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task ID Required' });
    }

    const task = await Task.findById(id).exec();

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    task.result = false;
    task.updatedAt = new Date();

    const updatedTask = await task.save();

    res.json({ message: 'Task canceled', updatedTask });
});

module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
}