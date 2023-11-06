const mongoose = require('mongoose')

//const allowedStatuses = ["new", "in_progress", "completed"];

const taskHistorySchema = new mongoose.Schema({
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Task'
        },
        result: {
            type: Boolean,
            required: true
        }
    },
    { 
        timestamps: true
    }
)

module.exports = mongoose.model('TaskHistory', taskHistorySchema)