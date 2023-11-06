const TaskHistory = require('../models/TaskHistory')
const asyncHandler = require('express-async-handler')

const getAllTaskHistories = asyncHandler(async (req, res) => {
    try {
        const taskHistories = await TaskHistory.find();

        if (!taskHistories || taskHistories.length === 0) {
            return res.status(404).json({ message: 'No task histories found' });
        }

        res.status(200).json(taskHistories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

const createNewTaskHistory = asyncHandler(async (req, res) => {
    const { task_id, result } = req.body;

    if (!task_id || result === undefined) {
        return res.status(400).json({ message: 'Task ID and result are required' });
    }

    const taskHistoryObject = { task_id, result };

    const taskHistory = await TaskHistory.create(taskHistoryObject);

    if (taskHistory) {
        res.status(201).json({ message: 'New task history created' });
    } else {
        res.status(400).json({ message: 'Invalid task history data received' });
    }
});

const updateTaskHistory = asyncHandler(async (req, res) => {
    const { id, result } = req.body;

    if (!id || result === undefined) {
        return res.status(400).json({ message: 'Task history ID and result are required' });
    }

    const taskHistory = await TaskHistory.findById(id).exec();

    if (!taskHistory) {
        return res.status(404).json({ message: 'Task history not found' });
    }

    taskHistory.result = result;

    const updatedTaskHistory = await taskHistory.save();

    res.json({ message: 'Task history updated', updatedTaskHistory });
});

const deleteTaskHistory = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task history ID required' });
    }

    const taskHistory = await TaskHistory.findById(id).exec();

    if (!taskHistory) {
        return res.status(404).json({ message: 'Task history not found' });
    }

    const result = await taskHistory.deleteOne();

    const reply = `Task history with ID ${result._id} deleted`;

    res.json(reply);
});

module.exports = {
    getAllTaskHistories,
    createNewTaskHistory,
    updateTaskHistory,
    deleteTaskHistory
};