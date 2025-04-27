const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { google } = require('googleapis'); // Import googleapis to interact with Google Sheets
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');  // Import dotenv
dotenv.config();  // Load environment variables from .env

const app = express();

// Enable CORS for all origins (or specify your frontend origin)
app.use(cors({
    origin: 'https://preview--frosting-fantasy-creations.lovable.app', // specify your frontend's origin here
  }));
app.use(express.json());

// Set up Google Sheets API authentication
const sheets = google.sheets('v4');

// Load service account credentials
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Handling newline character in private key
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
};
// Authenticate with Google API
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// The ID of the Google Sheets document
const SPREADSHEET_ID = '188h_2rUCNihZqmvU6855finY9j7VB0HgoPIhhHIennI'; // Replace with your actual spreadsheet ID

// Endpoint to submit the order
app.post('/api/submit-order', async (req, res) => {
  try {
    // Authenticate the client
    const authClient = await auth.getClient();
    
    // Get the Google Sheets API
    const sheetsAPI = google.sheets({ version: 'v4', auth: authClient });

    // Data to be added to the sheet
    const orderData = req.body; // Assuming the body contains all necessary fields

    // Prepare the row to add to the sheet
    const row = [
      orderData.name,
      orderData.kilograms_cake,
      orderData.flavour,
      orderData.cake_design,
      orderData.email || orderData.phone_number, // Only use email or phone number
      orderData.delivery_preference,
      orderData.preferredtime,
    ];

    // Add the order to the sheet (assumes data starts from the second row)
    const response = await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2', // Adjust the range as needed
      valueInputOption: 'RAW',
      resource: {
        values: [row], // Add the row
      },
    });

    // Check for success and send response
    if (response.status === 200) {
      res.status(200).json({ message: 'Order submitted to Google Sheets successfully!' });
    } else {
      res.status(500).json({ error: 'Failed to add order to Google Sheets' });
    }
  } catch (error) {
    console.error('Error occurred while writing to Google Sheets:', error);
    res.status(500).json({ error: 'Error occurred while forwarding data to Google Sheets' });
  }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
