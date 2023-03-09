const express = require('express');
require('dotenv').config();

const cors = require('cors');
const getAllEvents = require('./index');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Import Nodemailer

const app = express();
const port = 8000;

app.use(cors()); // enable CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/check-availability', async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching events.');
  }
});

app.post('/schedule-event', async (req, res) => { // Use async/await to send email
  const { name, email, phone, dateTime, message, option } = req.body;
  console.log(`Received form submission: ${name}, ${email}, ${phone}, ${dateTime}, ${message}, ${option}`);

  // Create a Nodemailer transporter object with your email service credentials
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'jtorresuci@gmail.com',
        pass: process.env.GMAIL_PASSWORD,
      },
    tls: {
        rejectUnauthorized: false
    }
});

  // Send an email with the event details
  try {
    await transporter.sendMail({
      from: 'jtorresuci@gmail.com',
      to: 'jtorresuci@gmail.com',
      subject: `New Event: ${name}`,
      html: `
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
        <p>Date and Time: ${dateTime}</p>
        <p>Message: ${message}</p>
        <p>Option: ${option}</p>
      `,
    });

    res.send('Form submitted successfully! An email has been sent to the recipient.'); // Send success message
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while sending the email.'); // Send error message
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
