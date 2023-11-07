const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const moment = require('moment');

const currentDate = moment().format('YYYY-MM-DD');

// Define the log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
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
    }),
 
    // Log 'error' and 'warning' messages to a separate file
    new winston.transports.File({
      filename: "var/log/csye6225.log",
      level: 'error',
    }),
 
    // Log 'warning' and above messages to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'warn',
    }),

    // // Add CloudWatch transport
    // new WinstonCloudWatch({
    //     logGroupName: 'csye6225', //CloudWatch Log Group name
    //     logStreamName: `webapp-${currentDate}`, // Use a dynamic log stream name based on date
    //     awsAccessKeyId: 'YourAccessKeyId', // Replace with your AWS Access Key ID
    //     awsSecretKey: 'YourSecretKey', // Replace with your AWS Secret Key
    //     awsRegion: 'us-east-1', // Replace with your AWS region
    //     level: 'info', // Log level for CloudWatch
    //   }),
  ],
});
 
module.exports = logger;