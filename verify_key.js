const apiKey = 'AIzaSyD5rpVdGTxWZV-8H7owtLtsFso9KU-zPqI';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
const fs = require('fs');

fetch(url)
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync('verification_output.json', JSON.stringify(data, null, 2));
    console.log('DONE');
  })
  .catch(err => {
    fs.writeFileSync('verification_error.txt', err.toString());
    console.error(err);
  });
