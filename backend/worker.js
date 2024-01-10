const calculateHappyNumber = require('./controllers/happyNumberController');
const { Task } = require('./models/Task');

console.log('Worker started');

const processTask = async (task) => {
  try {
    const { _id: taskId, status } = task;

    if (status !== 'waiting') {
      console.log(`Task ${taskId} is not in waiting state. Skipping processing.`);
      return;
    }
    const currentStatus = await Task.findById(taskId).select('status').lean();
    if (currentStatus.status === 'waiting') {
      task.status = 'processing';
      await task.save();
    } else {
      console.log(`Task ${taskId} status has changed. Skipping setting status to 'completed'.`);
    }

    try {
      const answer = await calculateHappyNumber(task.data);

      const currentStatus = await Task.findById(taskId).select('status').lean();
      
      if (currentStatus.status === 'processing') {
        task.answer = answer;
        task.status = 'completed';
        await task.save();
      } else {
        console.log(`Task ${taskId} status has changed. Skipping setting status to 'completed'.`);
      }
    } catch (error) {
      console.error(`Error calculating answer for task ${taskId}: ${error.message}`);
      task.status = 'failed';
      await task.save();
    }
  } catch (error) {
    console.error(`Error processing task: ${error.message}`);
  }
};

const processPendingTasks = async () => {
  const pendingTasks = await Task.find({ status: 'waiting' });

  for (const task of pendingTasks) {
    await processTask(task);
  }

  setTimeout(processPendingTasks, 0);
};

processPendingTasks();

module.exports = { processTask };
