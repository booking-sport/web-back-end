const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const playerRouter = require('./routes/playerRouter');
const managerRouter = require('./routes/managerRouter');
const adminRouter = require('./routes/adminRouter');

require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    credentials: true,
    // TODO: change origin on deployment
    origin: "http://localhost:3000",
  })
);

app.use('/api/players', playerRouter);
app.use('/api/managers', managerRouter);
app.use('/api/admins', adminRouter);

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors;
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    errors
  });
});

module.exports = app;