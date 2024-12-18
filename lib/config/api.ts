export const API_CONFIG = {
  BASE_URL: 'https://whatsbot2.xwhost.com.br/db/telegram_bot',
  CREDENTIALS: {
    username: 'UcTjKKp6',
    password: 'Tx2uwwFX'
  },
  REVALIDATION: {
    posts: 1800, // 30 minutes
    wordpress: 3600 // 1 hour
  }
} as const;

export const WORDPRESS_CONFIG = {
  BASE_URL: 'https://maisvagases.com.br/wp-json/wp/v2',
  HEADERS: {
    'User-Agent': 'JobPostManager/1.0',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
} as const;