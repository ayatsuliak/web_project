const express = require('express')
const router = express.Router()
const taskHistoriesController = require('../controllers/taskHistoriesController')

router.route('/')
    .get(taskHistoriesController.getAllTaskHistories) //read
    .post(taskHistoriesController.createNewTaskHistory) //create
    .patch(taskHistoriesController.updateTaskHistory) //update
    .delete(taskHistoriesController.deleteTaskHistory)

module.exports = router