const https = require('https');

const url = 'https://whatsbot2.xwhost.com.br/db/telegram_bot/expArr/send_logs';
const auth = Buffer.from('UcTjKKp6:Tx2uwwFX').toString('base64');

const options = {
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
};

console.log('Testing API connection...\n');
console.log('Timestamp:', new Date().toISOString());

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      console.log('Data length:', Array.isArray(jsonData) ? jsonData.length : 'not an array');
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('\nFirst item:');
        console.log(JSON.stringify(jsonData[0], null, 2));
        console.log('\nLast item:');
        console.log(JSON.stringify(jsonData[jsonData.length - 1], null, 2));
      }
    } catch (error) {
      console.error('Failed to parse response:', error.message);
      console.error('Raw data:', data);
    }
  });
}).on('error', (error) => {
  console.error('Request failed:', error.message);
});