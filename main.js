const express = require('express');
require('dotenv').config();
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');



const cors = require('cors');
const getAllEvents = require('./index');

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Import Nodemailer

const MongoClient = require('mongodb').MongoClient;


const mdbUserName = process.env.MDB_USERNAME
const mdbPassword =  process.env.MDB_PASSWORD
const mdbName = process.env.DATABASE_NAME

const gmail = process.env.GMAIL



// mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
const uri = `mongodb+srv://${mdbUserName}:${mdbPassword}@${mdbName}.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error(error);
  }
}
const app = express();
const port = 8000;

app.use(cors()); // enable CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



async function addDataToMongoDB(data) {
  console.log(data);
  try {
    const database = client.db('tasteofamor');
    const collection = database.collection('orders');
    const result = await collection.insertOne(data);
    console.log(`Successfully added data to MongoDB. Inserted id: ${result.insertedId}`);
  } catch (error) {
    console.error(error);
  }
}

async function getOrdersFromMongoDB() {
  try {
    const database = client.db('tasteofamor');
    const collection = database.collection('orders');
    const cursor = await collection.find({});
    const orders = await cursor.toArray();
    console.log(`Successfully retrieved ${orders.length} orders from MongoDB.`);
    return orders;
  } catch (error) {
    console.error(error);
  }
}

connectToDatabase()


app.get('/check-availability', async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching events.');
  }
});

app.get('/get-orders', async (req, res) => {
  try {
    const orders = await getOrdersFromMongoDB();
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving orders.');
  }
});

app.delete('/delete-order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const database = client.db('tasteofamor');
    const collection = database.collection('orders');
    const result = await collection.deleteOne({ _id: new ObjectId(orderId) });
    if (result.deletedCount === 0) {
      res.status(404).send('Order not found.');
    } else {
      res.send(`Order with ID ${orderId} has been deleted.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while deleting the order.');
  }
});



app.post('/schedule-event', async (req, res) => { // Use async/await to send email
  const { name, email, phone, date, time, message, option, address, city, state } = req.body;
  console.log(`Received form submission: ${name}, ${email}, ${phone}, ${date}, ${time}, ${message}, ${option}, ${address}, ${city}, ${state}`);
  const data = { name, email, phone, date, time, message, option, address, city, state }

  // Create a Nodemailer transporter object with your email service credentials
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: gmail,
        pass: process.env.GMAIL_PASSWORD,
      },
    tls: {
        rejectUnauthorized: false
    }
});



  // Send an email with the event details
  try {
    await transporter.sendMail({
      from: gmail,
      to: gmail,
      subject: `New Event: ${name}`,
      html: `
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
        <p>Address: ${address}</p>
        <p>City: ${city}</p>
        <p>State: ${state}</p>
        <p>Date and Time: ${date}</p>
        <p>Time: ${time}</p>
        <p>Message: ${message}</p>
        <p>Option: ${option}</p>
      `,
    });


    addDataToMongoDB(data); // Call the function to add data to MongoDB
    res.send('Form submitted successfully! An email has been sent to the recipient.'); // Send success message
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while sending the email.'); // Send error message
  }
});

const secretKey = process.env.secretkey;
const admin = process.env.admin;
const pw = process.env.pw;

const user = {
  username: admin,
  password: pw
};

const encryptedUser = jwt.sign(user, secretKey); // Encrypt the user object using JWT

// Add the encrypted user to the database

async function addUserToMongoDB({ encryptedUser }) {
  try {
    await client.connect();
    const database = client.db('tasteofamor');
    const collection = database.collection('users');

    // Check if the user already exists
    const existingUser = await collection.findOne({ encryptedUser });

    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // Add the user to the database
    const result = await collection.insertOne({ encryptedUser });

    console.log(`Successfully added user to MongoDB. Inserted id: ${result.insertedId}`);
  } catch (error) {
    console.error(error);
  } 
}

// addUserToMongoDB({ encryptedUser });

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // console.log(req)

  try {
    await client.connect();
    const database = client.db('tasteofamor');
    const collection = database.collection('users');

    // Find the user in the database
    const user = await collection.findOne({ username });

    // Check if the user exists and the password matches
    if (user && user.password === password) {
      const token = jwt.sign({ username }, secretKey);
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while logging in.');
  } 
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});




