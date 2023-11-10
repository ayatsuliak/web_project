require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger } = require(path.join(__dirname, 'middleware/logger'))
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')
const PORT = process.env.PORT || 3500
const PORT2 = process.env.PORT2
PORT3 = process.env.PORT3

console.log(process.env.NODE_ENV)

connectDB()

// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//       // Додаємо необхідні заголовки CORS для OPTIONS запиту
//       res.header("Access-Control-Allow-Origin", req.headers.origin);
//       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//       res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//       res.header("Access-Control-Allow-Credentials", "true");
//       res.sendStatus(204); // Відправляємо статус 204 No Content для OPTIONS запиту
//   } else {
//       // Продовжуємо обробку інших запитів
//       next();
//   }
// });

const configureCORS = {
  origin: 'http://localhost:3500', // Replace with the actual origin of your client application
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

app.use(logger)

app.use(cors(configureCORS))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join('frontend/public/pages')));
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/tasks', require('./routes/taskRoutes'))

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

const app2 = express();

app2.get('/', (req, res) => {
  const requestPort = req.app.get('port');
  res.send(`Server on port ${PORT2} is working`);
});

app2.use(logger)
app2.use(express.json())
app2.use(cookieParser())
app2.use(cors(configureCORS))
app2.use('/', express.static(path.join('frontend/public/pages')));
app2.use('/tasks', require('./routes/taskRoutes'))
app2.use('/auth', require('./routes/authRoutes'))
app2.use('/users', require('./routes/userRoutes'))

app2.listen(PORT2, () => {
  console.log(`Server running on port ${PORT2}`);
});

// app.get('/', (req, res) => {
//   const requestPort = req.app.get('port');
//   res.send(`Server on port ${PORT} is working`);
// });


const app3 = express();

app3.get('/', (req, res) => {
  const requestPort = req.app.get('port');
  res.send(`Server on port ${PORT3} is working`);
});

app3.use(logger)
app3.use(express.json())
app3.use(cookieParser())
app3.use(cors(configureCORS))
app3.use('/', express.static(path.join('frontend/public/pages')));
app3.use('/tasks', require('./routes/taskRoutes'))
app3.use('/auth', require('./routes/authRoutes'))
app3.use('/users', require('./routes/userRoutes'))

app3.listen(PORT3, () => {
  console.log(`Server running on port ${PORT3}`);
});
