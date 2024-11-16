const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const { promises: fsPromises } = require('fs');
const path = require('path');

const getDirname = () => {
  return __dirname;
};

const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logsDir = path.join(getDirname(), '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir);
    }

    await fsPromises.appendFile(path.join(logsDir, logName), logItem);
  } catch (err) {
    console.error(err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logger, logEvents };