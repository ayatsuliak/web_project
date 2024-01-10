const { Task } = require('../models/Task')
const calculateHappyNumber = require('../controllers/happyNumberController')
const { processTask } = require('../worker');
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const MAX_TASKS = 5;
const MAX_DATA_VALUE = 100000;

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
    const { data } = req.body;   
    
    if (!data || data > MAX_DATA_VALUE) {
        return res.status(400).json({ message: `Invalid data. Data must be a positive integer not greater than ${MAX_DATA_VALUE}.` })
    }

    const token = req.headers.authorization.split(' ')[1];

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user_id = payload.UserInfo._id;

    const activeTaskCount = await Task.countDocuments({ user_id });

    if (activeTaskCount > MAX_TASKS) {
        return res.status(400).json({ message: 'Limit of active tasks reached' });
    }

    try {
        const taskObject = { user_id, data }        
        const task = await Task.create(taskObject);
        res.status(201).json({ message: 'New task created', data: { id: task._id, user_id, data } });
    } catch (error) {
        console.error('Error creating and processing task:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const updateTask = asyncHandler(async (req, res) => {
    const { id, data, status } = req.body; 

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
        task.status = status; 
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