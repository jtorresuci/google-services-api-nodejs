const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const serviceAccount = require('./taste-380101-cd773a196ea7.json');

async function getAllEvents() {
  try {
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const authorize = await jwtClient.authorize();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const options = {
      calendarId: 'af7f84f6570f9183c81c4cd633b791535ce1b612a7548ec40e1cba74b57fbd10@group.calendar.google.com',
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    };

    const response = await calendar.events.list(options);
    const events = response.data.items;

    if (events.length) {
      console.log('Upcoming Events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

module.exports = getAllEvents;
