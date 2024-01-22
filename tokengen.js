const { google } = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send']; // Scope for sending emails

const credentials = require('./client_secret.json'); // Your OAuth2 client credentials JSON file

const tokenPath = './token.json'; // Path to store the token file

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id, client_secret, redirect_uris[0]
);

function getAccessToken(oAuth2Client, callback) {
  fs.readFile(tokenPath, (err, token) => {
    if (err) {
      return getNewToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this URL:', authUrl);
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error('Error retrieving access token', err);
      }
      oAuth2Client.setCredentials(token);
      fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err) {
          return console.error('Error writing token to file', err);
        }
        console.log('Token stored to', tokenPath);
      });
      callback(oAuth2Client);
    });
  });
}

// Authenticate and obtain the access token
getAccessToken(oAuth2Client, (auth) => {
  console.log('Access token obtained:', auth.credentials.access_token);
  console.log('Refresh token obtained:', auth.credentials.refresh_token);
});
