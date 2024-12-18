import { fetchWithAuth } from '@/lib/utils/http';

async function testAPI() {
  try {
    const url = 'https://whatsbot2.xwhost.com.br/db/telegram_bot/expArr/send_logs';
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('API Response:', {
      status: response.status,
      dataLength: Array.isArray(data) ? data.length : 'not an array',
      timestamp: new Date().toISOString(),
      firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null,
      lastItem: Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null
    });

    return data;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

export { testAPI };