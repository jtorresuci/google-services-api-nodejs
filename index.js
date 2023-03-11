const { google } = require("googleapis");
const { JWT } = require("google-auth-library");

const serviceAccount = require(process.env.GCAL_API_FILEPATH);
const MongoClient = require('mongodb').MongoClient;



// Mongo DB URI Settings
const mdbUserName = process.env.MDB_USERNAME
const mdbPassword =  process.env.MDB_PASSWORD
const mdbName = process.env.DATABASE_NAME

const gcalId = process.env.GCALENDAR_ID


const uri = `mongodb+srv://${mdbUserName}:${mdbPassword}@${mdbName}.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true });

const secretKey = process.env.secretkey; // Define your secret key


async function registerUser(username, password) {
  try {
    await client.connect();
    const database = client.db('tasteofamor');
    const collection = database.collection('users');

    // Check if user already exists
    const existingUser = await collection.findOne({ username });

    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // If user doesn't exist, add to database
    const result = await collection.insertOne({ username, password });
    console.log(`Successfully registered user. Inserted id: ${result.insertedId}`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

// Example usage:
// registerUser(process.env.admin, process.env.pw);





async function getAllEvents() {
  try {
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });


    const authorize = await jwtClient.authorize();
    const calendar = google.calendar({ version: "v3", auth: jwtClient });

    const options = {
      calendarId:
        gcalId,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    };

    const response = await calendar.events.list(options);
    const events = response.data.items;

    if (events.length) {
      console.log("Upcoming Events:");
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log("No upcoming events found.");
    }

    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

module.exports = getAllEvents;
