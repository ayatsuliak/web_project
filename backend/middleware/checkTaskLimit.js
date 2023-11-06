const Task = require('../models/Task');

const MAX_TASKS = 2;

module.exports = async (req, res, next) => {
  const user_id = req.body.user_id; // Припускаємо, що ви передаєте user_id в тілі запиту

  // Підрахувати кількість активних задач для користувача
  const activeTaskCount = await Task.countDocuments({ user_id, result: true });

  //const taskLimit = 2; // Задайте максимальний ліміт задач

  if (activeTaskCount >= MAX_TASKS) {
    return res.status(400).json({ message: 'Limit of active tasks reached' });
  }

  next();
};