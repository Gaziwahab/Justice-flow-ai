const apiKey = 'AIzaSyD5rpVdGTxWZV-8H7owtLtsFso9KU-zPqI';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function verify() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('API Key is valid.');
      console.log('Available models summary:');
      if (data.models) {
        data.models.forEach(m => {
          console.log(`- ${m.name}`);
        });
      } else {
        console.log('No models returned, but request was successful.');
      }
    } else {
      console.error('API Verification Failed:');
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

verify();
