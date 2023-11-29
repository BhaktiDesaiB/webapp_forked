const express = require('express');
const sequelize = require('./database');
const User = require('./models/Users');
const {Assignment, Assignment_links} = require('./models/Assignments');
const {Submission, SubmissionCountTable} = require('./models/Submission');
const {Submission, SubmissionCountTable} = require('./models/Submission');
const basicAuth = require('./Token');
const logger = require('./logger/logger');
const { Op } = require('sequelize');

const stats = require('node-statsd');
const statsdClient = new stats();

const dotenv = require('dotenv');
dotenv.config();

const { Op } = require('sequelize');

const AWS = require('aws-sdk');
const profileName = 'dev';
// Create a credentials object using the specified profile
const credentials = new AWS.SharedIniFileCredentials({ profile: profileName });
// Set the AWS credentials in the AWS SDK configuration
AWS.config.credentials = credentials;

// Initialize other AWS configurations as needed
AWS.config.update({ region: 'us-east-1' });
const sns = new AWS.SNS();
const topicArn = 'arn:aws:sns:us-east-1:607251300885:DownloadRepo';

const app = express();
// Enable JSON request body parsing
app.use(express.json());

//handling all the other http requests
app.use('/healthz', (req , res , next) => {
  if(req.method !== 'GET')
  {
      res.setHeader('Cache-Control','no-cache , no-store , must-revalidate');
      res.setHeader('Pragma','no-cache');
      logger.error('method not allowed',error);
      res.status(405).json(); //irrespective of db on or off
  }
  else
  {
      next(); //if wrong api call
  }  
});

//handling patch the other http requests
app.use('/', (req , res , next) => {
  if(req.method === 'PATCH')
  {
      res.setHeader('Cache-Control','no-cache , no-store , must-revalidate');
      res.setHeader('Pragma','no-cache');
      logger.error('method not allowed',error);
      res.status(405).json(); //irrespective of db on or off
  }
  else
  {
      next(); //if wrong api call
  }  
});

// Health check route to test database connectivity
app.get('/healthz', async (req, res) => {
  const expectedKeys = ['key1', 'key2']; // expected keys
  const unexpectedKeys = Object.keys(req.query).filter(
    (key) => !expectedKeys.includes(key)
  );
  if (unexpectedKeys.length > 0) {
    // If there are unexpected query parameters, return a 404 error
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    logger.warn('/healthz: status check fail!');
    res.status(404).json();
  } else {
    try {
    // Attempt to authenticate with the database
    await sequelize.authenticate();
    logger.info('/healthz: status check ok!');
    //statsd count for healthz hits
    statsdClient.increment('healthz.get.success',1);
    // Set response headers to disable caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json();
  } catch (error) {
    console.error('error info : ', error);
    logger.error('/healthz: status check fail!',error);
    //statsd count for healthz hits
    statsdClient.increment('healthz.get.fail',1);
    res.status(503).send();
  }
}
});

// Route to retrieve all assignments with Basic Authentication required
app.get('/v1/assignments', basicAuth, async (req, res) => {
  try {
    // Use Sequelize to query the "Assignment" table for all assignments
    const assignments = await Assignment.findAll();
    // Send the retrieved assignments as a JSON response
    logger.warn('/v1/assignments: displaying all the assignmemts!');
    //statsd count for assignment-get-all hits
    statsdClient.increment('assignment.get',1);
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error:', error);
    logger.error('/v1/assignments: unable to retrieve assignments!',error);
    res.status(500).json({ error: 'Unable to retrieve' }); 
  }
});

// Route to get assignment details by ID
app.get('/v1/assignments/:id',basicAuth, async (req, res) => {
  try {
    // Extract the assignment ID from the route parameter
    const { id } = req.params;

    // Use Sequelize to find the assignment by its ID
    const assignment = await Assignment.findOne({ where: { id } });

    if (!assignment) {
      // Handle the case where the assignment with the provided ID does not exist
      logger.warn('/v1/assignments: assignment id not found!');
      return res.status(404).json({ error: 'Assignment not found' });
    }
    // Return the assignment details as a JSON response
    logger.info('/v1/assignments: displaying the assignmemt with specified id!',assignment);
    //statsd count for assignment-get hits
    statsdClient.increment('assignment.get',1);
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error:', error);
    logger.error('/v1/assignments: unable to retrieve assignments!',error);
    res.status(500).json({ error: 'Unable to retrieve assignment details' });
  }
});

// Route to create a new assignment and concatenate user ID and assignment ID
app.post('/v1/assignments', basicAuth, async (req, res) => {
  try {
    // Extract the email from the authorization header (Basic Auth)
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // Use Sequelize to find the user by email and retrieve their ID
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.error('/v1/assignments: unable to find user!',error);
      return res.status(404).json({ error: 'User not found' });
    }

     // Check if the password matches
    //  if (user.password !== password){
    //   logger.error('/v1/assignments: incorrect credentials!', error);
    //   return res.status(401).json({ error: 'Incorrect credentials' });
    // }


    // Extract assignment data from the request body
    const { name, points, num_of_attempts, deadline } = req.body;

    // Use Sequelize to create a new assignment in the "Assignment" table
    const newAssignment = await Assignment.create({
      name,
      points,
      num_of_attempts,
      deadline,
    });

    // Concatenate user ID and assignment ID with an underscore ('_')
    const concatenatedId = `${user.id}_${newAssignment.id}`;

    // Insert the concatenated ID into the "Assignment_links" table
    const assignmentLink = await Assignment_links.create({
      id: concatenatedId,
    });

      // Include the newly created assignment in the response
      const responsePayload = {
        concatenatedId,
        newAssignment,
        assignmentLink, // Include the newAssignment object
      };

    // Return the response payload in the JSON response
    logger.info('/v1/assignments: new assignment created!',responsePayload);
    //statsd count for assignment-add hits
    statsdClient.increment('assignment-add',1);
    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Error:', error);
    logger.error('/v1/assignments: assignment cannot be created!',error);
    res.status(400).json({ error: 'Unable to create assignment' });
  }
});

// POST endpoint for submitting assignments
app.post('/v1/assignments/:id/submissions', basicAuth, async (req, res) => {
  try {
    const { submission_url } = req.body;
    const { id }  = req.params;
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');
    // Use Sequelize to find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Handle the case where the user with the provided email does not exist
      logger.error("User not found with email" + email, error);
      return res.status(404).json({ error: 'User not found' });
    }
    // Use Sequelize to find the assignment by its ID
    const assignment = await Assignment.findOne({ where: { id } });
    if (!assignment) {
      // Handle the case where the assignment with the provided ID does not exist
      logger.error("Assignment not found with id:"+id,error);
      return res.status(404).json({ error: 'Assignment not found' });
    }
    // Check if the submission deadline has passed
    const currentDate = new Date();
    const deadline = new Date(assignment.deadline);
     if (currentDate > deadline) {
      return res.status(403).json({ error: 'Submission deadline has passed' });
    }
    // Check if the user has already exceeded the retries
    const retriesConfig = assignment.num_of_attempts || 1; // Assuming a default of 1 attempt
    let userSubmissions = await SubmissionCountTable.count({
      where: { email:{[Op.like]: `%${email}`, }, },
    });
    console.log(userSubmissions);
    if (userSubmissions >= retriesConfig) {
      return res.status(403).json({ error: 'Exceeded maximum number of attempts' });
    }
    // Create submission entry in the database
    const newSubmission = await Submission.create({
      assignment_id: assignment.id,
      submission_url: submission_url,
      // Other submission data from req.body
    });
    userSubmissions++;
    const newSubmissionCount = await SubmissionCountTable.create({
      email: email,
    })
    // Post URL to SNS topic along with user info
    const snsMessage = {
      userEmail: user.email,
      // submissionUrl: `https://dbwebapp.me/submissions/${newSubmission.id}`
      submission_url: req.body
      // Other relevant data
    };
    // Publish message to SNS topic
    sns.publish(topicArn, JSON.stringify(snsMessage), (err, data) => {
      if (err) {
        console.error('Error publishing to SNS:', err);
      } else {
        console.log('Message published to SNS:', data);
      }
    });
    logger.info('created');
    res.status(201).json({ message: 'Submission successful' });
  } catch (error) {
    console.error('Error:', error);
    logger.error('unable',error);
    res.status(400).json({ error: 'Unable to process submission' });
  }
});

// Route to update an assignment by ID
app.put('/v1/assignments/:id', basicAuth, async (req, res) => {
  try {
    // Extract the assignment ID from the route parameter
    const { id } = req.params;

    // Extract the authenticated user's email from Basic Authentication
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // Use Sequelize to find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Handle the case where the user with the provided email does not exist
      logger.error('/v1/assignments: Unable to find user!',error);
      return res.status(404).json({ error: 'User not found' });
    }

    // Use Sequelize to find the assignment by its ID
    const assignment = await Assignment.findOne({ where: { id } });

    if (!assignment) {
      // Handle the case where the assignment with the provided ID does not exist
      logger.warn('/v1/assignments: provide correct assignment id!');
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Concatenate user ID and assignment ID with an underscore ('_')
    const concatenatedId = `${user.id}_${assignment.id}`;
    console.log(concatenatedId);

    // Use Sequelize to find the concatenated ID in the Assignment_links table
    const assignmentLink = await Assignment_links.findOne({ where: { id: concatenatedId } });

    if (!assignmentLink) {
      // Handle the case where the user is not authorized to update the assignment
      logger.error('/v1/assignments: not authorized to update!',error);
      return res.status(403).json({ error: 'You are not authorized to update this assignment' });
    }

    // Extract assignment data from the request body
    const { name, points, num_of_attempts, deadline } = req.body;

    // Update the assignment with the new data
    await assignment.update({
      name,
      points,
      num_of_attempts,
      deadline,
    });

    // Return the updated assignment as a JSON response
    logger.info('/v1/assignments: updated successfully!',assignment);
    //statsd count for assignment-put hits
    statsdClient.increment('assignment.put',1);
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error:', error);
    logger.error('/v1/assignments: Unable to update assignment!',error);
    res.status(500).json({ error: 'Unable to update assignment' });
  }
});

// Route to delete an assignment by ID
app.delete('/v1/assignments/:id', basicAuth, async (req, res) => {
  try {
    // Extract the assignment ID from the route parameter
    const { id } = req.params;

    // Extract the authenticated user's email from Basic Authentication
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // Use Sequelize to find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Handle the case where the user with the provided email does not exist
      logger.error('/v1/assignments: Unable to find user!',error);
      return res.status(404).json({ error: 'User not found' });
    }

    // Use Sequelize to find the assignment by its ID
    const assignment = await Assignment.findOne({ where: { id } });

    if (!assignment) {
      // Handle the case where the assignment with the provided ID does not exist
      logger.warn('/v1/assignments: provide correct assignment id!');
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // const retriesConfig = assignment.num_of_attempts || 1; // Assuming a default of 1 attempt
    // let userSubmissions = await SubmissionCountTable.count({
    //   where: { email:{[Op.like]: `%${email}`, }, },
    // });
    // console.log(userSubmissions);
    // if (userSubmissions <= retriesConfig) {
    //   return res.status(403).json({ error: 'cant be deleted' });
    // }
    
    // Concatenate user ID and assignment ID with an underscore ('_')
    const concatenatedId = `${user.id}_${assignment.id}`;

    // Use Sequelize to find the concatenated ID in the Assignment_links table
    const assignmentLink = await Assignment_links.findOne({ where: { id: concatenatedId } });

    if (!assignmentLink) {
      // Handle the case where the user is not authorized to delete the assignment
      logger.error('/v1/assignments: not authorized to delete!',error);
      return res.status(403).json({ error: 'You are not authorized to delete this assignment' });
    }

    // Delete the assignment from the database
    await assignment.destroy();

    // Delete the corresponding record in the Assignment_links table
    await assignmentLink.destroy();
    

    // Return a success message as a JSON response
    //statsd count for assignment-delete hits
    statsdClient.increment('assignment.delete',1);
    logger.info('/v1/assignments: assignment deleted successfully!');
    res.status(200).json({ message: 'Assignment and Assignment_links record deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    logger.error('/v1/assignments: Unable to update assignment!',error);
    res.status(500).json({ error: 'Unable to delete assignment' });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running`);
  });

  module.exports = app;