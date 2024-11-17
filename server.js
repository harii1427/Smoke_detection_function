const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse incoming JSON requests

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable for email
    pass: process.env.EMAIL_PASS, // Use environment variable for password
  },
});

// Smoke level data storage (consider replacing with a database for production)
let smokeData = [];

// Threshold for sending an email alert
const SMOKE_THRESHOLD = 20; // Replace with your desired threshold

// Function to send email alert
const sendEmailAlert = async (smokeLevel) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: 'hariharan5295@gmail.com', // Recipient email
    subject: 'Smoke Alert - High Level Detected!',
    text: `Warning! High smoke level detected: ${smokeLevel}. Immediate action is required.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Alert email sent successfully!');
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
};

// Root route for verifying deployment
app.get('/', (req, res) => {
  res.send('Smoke Detection API is running!');
});

// Route to handle smoke level data
app.post('/smoke_level', async (req, res) => {
  try {
    const { smoke_level } = req.body;

    if (typeof smoke_level === 'undefined') {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    console.log(`Received smoke level: ${smoke_level}`);
    smokeData.push(smoke_level);

    // Trigger email alert if smoke level exceeds the threshold
    if (smoke_level > SMOKE_THRESHOLD) {
      await sendEmailAlert(smoke_level);
    }

    res.status(200).json({ message: 'Smoke level received successfully' });
  } catch (error) {
    console.error('Error processing smoke level:', error);
    res.status(500).json({ error: 'Error processing data' });
  }
});

// Route to get smoke level data
app.get('/get_smoke_data', (req, res) => {
  res.json(smokeData);
});

// Start the server
const PORT = process.env.PORT || 5000; // Use the PORT environment variable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
