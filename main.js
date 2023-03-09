const express = require('express');
const cors = require('cors');
const getAllEvents = require('./index');
const bodyParser = require('body-parser');


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

app.post('/schedule-event', (req, res) => {
  const { name, email, phone, dateTime, message, option } = req.body;
  console.log(`Received form submission: ${name}, ${email}, ${phone}, ${dateTime}, ${message}, ${option}`);
  // TODO: Handle form submission here
  res.send('Form submitted successfully!');
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
