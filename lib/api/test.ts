import { fetchWithAuth } from '@/lib/utils/http';
import { API_CONFIG } from '@/lib/config';

async function testAPI() {
  try {
    const url = 'https://whatsbot2.xwhost.com.br/db/telegram_bot/expArr/send_logs?key=&value=&type=&query=&projection=';
    const response = await fetchWithAuth(url);
    const data = await response.json();
    
    console.log('API Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      dataLength: Array.isArray(data) ? data.length : 'not an array',
      firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();