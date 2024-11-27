const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse incoming JSON requests

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smokedetection4@gmail.com', // Replace with your email
    pass: 'egsk zbna fwgy wrdn', // Use your Gmail app password
  },
});

// MongoDB URI (replace <db_password> with your actual password)
const mongoURI = 'mongodb+srv://hariharan5295:hari123@cluster0.kacxfek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Define a Mongoose schema for storing smoke level data
const smokeSchema = new mongoose.Schema({
  smoke_level: Number,
  timestamp: { type: Date, default: Date.now },
});

const Smoke = mongoose.model('Smoke', smokeSchema);

// Smoke level data storage (will be handled by MongoDB)
const SMOKE_THRESHOLD = 10; // Replace with your desired threshold

// Function to send email alert
const sendEmailAlert = async (smokeLevel) => {
  const mailOptions = {
    from: 'smokedetection4@gmail.com', // Sender email
    to: 'sec22me002@sairamtap.edu.in', // Recipient email
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

// Route to handle smoke level data
app.post('/smoke_level', async (req, res) => {
  try {
    const { smoke_level } = req.body;

    if (typeof smoke_level === 'undefined') {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    console.log(`Received smoke level: ${smoke_level}`);

    // Insert smoke level data into MongoDB using Mongoose
    const smokeData = new Smoke({ smoke_level });
    await smokeData.save();

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
app.get('/get_smoke_data', async (req, res) => {
  try {
    const smokeData = await Smoke.find();
    res.json(smokeData);
  } catch (error) {
    console.error('Error fetching smoke data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
