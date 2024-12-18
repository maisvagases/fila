export const API_ENDPOINTS = {
  JOB_POSTS: '/expArr/send_logs',
} as const;

export const HTTP_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 15000,
  HEADERS: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'User-Agent': 'JobPostManager/1.0'
  },
} as const;