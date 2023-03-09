const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const serviceAccount = require('./taste-380101-cd773a196ea7.json');

async function createEvent(eventData) {
  try {
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const authorize = await jwtClient.authorize();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const event = {
      summary: eventData.summary,
      location: eventData.location,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone,
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone,
      },
      reminders: {
        useDefault: true,
      },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: 'af7f84f6570f9183c81c4cd633b791535ce1b612a7548ec40e1cba74b57fbd10@group.calendar.google.com',
      resource: event,
    });

    console.log(`Event created: ${createdEvent.data.htmlLink}`);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

module.exports = createEvent;
