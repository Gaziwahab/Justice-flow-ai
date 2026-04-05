const apiKey = 'AIzaSyD5rpVdGTxWZV-8H7owtLtsFso9KU-zPqI';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
const fs = require('fs');

async function test() {
  const logFile = 'api_log.txt';
  fs.writeFileSync(logFile, 'Starting API test...\n');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello, are you working?' }]
        }]
      })
    });
    
    const data = await response.json();
    fs.appendFileSync(logFile, `Response Status: ${response.status}\n`);
    fs.appendFileSync(logFile, `Response Data: ${JSON.stringify(data, null, 2)}\n`);
    console.log('TEST_COMPLETE');
  } catch (err) {
    fs.appendFileSync(logFile, `Error: ${err.message}\n`);
    console.error(err);
  }
}

test();
