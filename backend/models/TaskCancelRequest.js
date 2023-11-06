const mongoose = require('mongoose')

const allowedStatuses = ["new", "in_progress", "completed"];

const taskCancelRequestSchema = new mongoose.Schema({
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Task'
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        reason: {
            type: String,
            required: true
        }
    },
    { 
        timestamps: true
    }
)

module.exports = mongoose.model('TaskCancelRequest', taskCancelRequestSchema)