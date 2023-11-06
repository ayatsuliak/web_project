const express = require('express')
const router = express.Router()
const taskCancelRequestsController = require('../controllers/taskCancelRequestsController')

router.route('/')
    .get(taskCancelRequestsController.getAllTaskCancelRequests) //read
    .post(taskCancelRequestsController.createTaskCancelRequest) //create
    .patch(taskCancelRequestsController.updateTaskCancelRequest) //update
    .delete(taskCancelRequestsController.deleteTaskCancelRequest)

module.exports = router