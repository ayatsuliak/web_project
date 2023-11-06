const TaskCancelRequest = require('../models/TaskCancelRequest')
const asyncHandler = require('express-async-handler')

const getAllTaskCancelRequests = asyncHandler(async (req, res) => {
    try {
        const taskCancelRequests = await TaskCancelRequest.find();

        if (!taskCancelRequests || taskCancelRequests.length === 0) {
            return res.status(404).json({ message: 'No task cancel requests found' });
        }

        res.status(200).json(taskCancelRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

const createTaskCancelRequest = asyncHandler(async (req, res) => {
    const { task_id, user_id, reason } = req.body;
    
    if (!task_id || !user_id || !reason) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const taskCancelRequestObject = { task_id, user_id, reason, status: 'new' };

    const taskCancelRequest = await TaskCancelRequest.create(taskCancelRequestObject);

    if (taskCancelRequest) {
        res.status(201).json({ message: 'New task cancel request created' });
    } else {
        res.status(400).json({ message: 'Invalid task cancel request data received' });
    }
});

const updateTaskCancelRequest = asyncHandler(async (req, res) => {
    const { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ message: 'Task cancel request ID and status are required' });
    }

    const taskCancelRequest = await TaskCancelRequest.findById(id).exec();

    if (!taskCancelRequest) {
        return res.status(404).json({ message: 'Task cancel request not found' });
    }

    taskCancelRequest.status = status;

    const updatedTaskCancelRequest = await taskCancelRequest.save();

    res.json({ message: 'Task cancel request updated', updatedTaskCancelRequest });
});

const deleteTaskCancelRequest = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task cancel request ID is required' });
    }

    const taskCancelRequest = await TaskCancelRequest.findById(id).exec();

    if (!taskCancelRequest) {
        return res.status(404).json({ message: 'Task cancel request not found' });
    }

    const result = await taskCancelRequest.deleteOne();

    const reply = `Task cancel request with ID ${result._id} deleted`;

    res.json(reply);
});

module.exports = {
    getAllTaskCancelRequests,
    createTaskCancelRequest,
    updateTaskCancelRequest,
    deleteTaskCancelRequest
}
