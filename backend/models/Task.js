const mongoose = require('mongoose')

const alowwedStatuses = ['processing', 'completed', 'failed', 'cancelled', 'waiting']

const taskSchema = new mongoose.Schema({
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        data: {
            type: Number,
            required: true
        },
        answer: {
            type: Boolean,
            required: false
        },
        result: {
            type: Boolean,
            default: true
        },
        status: {
            type: String, 
            default: 'waiting',
            enum: alowwedStatuses
        }
    },
    { 
        timestamps: true
    }
)

module.exports = mongoose.model('Task', taskSchema)