const https = require('https');

const url = 'https://whatsbot2.xwhost.com.br/db/telegram_bot/expArr/send_logs?key=&value=&type=&query=&projection=';
const auth = Buffer.from('UcTjKKp6:Tx2uwwFX').toString('base64');

const options = {
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json'
  }
};

console.log('Testing API connection...\n');

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Data length:', Array.isArray(jsonData) ? jsonData.length : 'not an array');
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('\nFirst item sample:');
        console.log(JSON.stringify(jsonData[0], null, 2));
      }
    } catch (error) {
      console.error('Failed to parse response:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Request failed:', error.message);
});