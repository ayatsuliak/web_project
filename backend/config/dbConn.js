// const mongoose = require('mongoose')

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.DATABASE_URL)
//     } catch (err) {
//         console.log(err)
//     }
// }

// module.exports = connectDB
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

const store = new MongoDBStore({
    uri: process.env.DATABASE_URL,
    collection: 'sessions'
});

const sessionMiddleware = session({
    secret: process.env.ACCESS_TOKEN_SECRET, 
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: { secure: true }
});

module.exports = { connectDB, sessionMiddleware };
