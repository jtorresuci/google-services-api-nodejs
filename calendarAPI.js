const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Load the service account credentials from a JSON file
const serviceAccount = require('./taste-380101-0dcc6ac72035.json');

// Set up the JWT client with the service account credentials
const jwtClient = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

// Authenticate with the Google Calendar API
jwtClient.authorize((err, tokens) => {
  if (err) {
    console.error('Error authenticating with Google Calendar API:', err);
    return;
  }

  // Set up the Calendar API client with the JWT client
  const calendar = google.calendar({ version: 'v3', auth: jwtClient });

  const options = {
    calendarId: 'af7f84f6570f9183c81c4cd633b791535ce1b612a7548ec40e1cba74b57fbd10@group.calendar.google.com',
    timeMin: new Date().toISOString(),
    // maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }
  
  calendar.events.list(options, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err)
    const events = res.data.items
    if (events.length) {
      console.log('Upcoming Events:')
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date
        console.log(`${start} - ${event.summary}`)
      })
    } else {
      console.log('No upcoming events found.')
    }
  })
  
  });

