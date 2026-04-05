const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'api_v3_log.txt');

function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
}

async function test(modelName) {
  log(`TESTING MODEL: ${modelName}`);
  const apiKey = 'AIzaSyD5rpVdGTxWZV-8H7owtLtsFso9KU-zPqI';
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  
  try {
    const model = google(modelName);
    const { text } = await generateText({
      model,
      prompt: 'Hello',
    });
    log(`SUCCESS [${modelName}]: ${text}`);
  } catch (err) {
    log(`FAILED [${modelName}]: ${err.message}`);
  }
}

fs.writeFileSync(logFile, 'Log v3 Initialized\n');

(async () => {
  await test('gemini-1.5-flash');
  await test('gemini-2.0-flash');
  await test('gemini-2.5-flash');
  await test('gemini-3-flash');
})();
