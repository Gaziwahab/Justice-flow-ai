const fs = require('fs');
const logFile = 'C:\\Users\\gaziw\\OneDrive\\Desktop\\v0-secure-voice-platform-main\\v0-secure-voice-platform-main\\api_test_log.txt';

function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
}

async function run() {
  try {
    log('STARTING_TEST');
    const apiKey = 'AIzaSyD5rpVdGTxWZV-8H7owtLtsFso9KU-zPqI';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    log('FETCHING: ' + url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with OK if you receive this.' }] }]
      })
    });
    
    log('STATUS: ' + response.status);
    const data = await response.json();
    log('DATA: ' + JSON.stringify(data, null, 2));
    log('FINISHED_SUCCESSFULLY');
  } catch (err) {
    log('ERROR: ' + err.stack);
  }
}

fs.writeFileSync(logFile, 'Log Initialized\n');
run();
