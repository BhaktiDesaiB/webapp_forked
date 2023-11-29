const winston = require('winston');
const moment = require('moment-timezone');

// Define a custom timestamp format
const customTimestamp = winston.format((info) => {
  info.timestamp = moment().tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
  return info;
});

// Define the log format
const logFormat = winston.format.combine(
  customTimestamp(),
  winston.format.simple()
);

// Create a Winston logger with multiple transports for different log levels
const logger = winston.createLogger({
  level: 'info', // Minimum log level to capture
  format: logFormat,
  transports: [
    // Log 'info' and above messages to a file
    new winston.transports.File({
      filename: "var/log/csye6225.log",
      level: 'info',
    },
    // Log 'warning' and above messages to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'error',
    }),
    // {
    //   // Log 'error' and 'warning' messages to a separate file
    //   filename: "var/log/csye6225.log",
    //   level: 'error',
    // }),
 
    // Log 'warning' and above messages to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'warn',
    }),
    ),
  ],
});
 
module.exports = logger;
