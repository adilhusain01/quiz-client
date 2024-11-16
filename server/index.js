const express = require('express');
const connectDB = require('./config/db');
const quizRoutes = require('./routes/quizRoutes');
const cors = require('cors');
const {logger} = require('./middleware/logEvents');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger);
app.use('/api/quiz' , quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
