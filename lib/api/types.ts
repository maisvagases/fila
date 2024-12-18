export interface JobPostDTO {
  _id: string;
  url: string;
  startTime: string | Date;
  finishedTime: string | Date;
  title?: string;
  imageUrl?: string;
  imageAlt?: string;
  status?: 'success' | 'error';
  error?: string;
}

export interface APIError {
  message: string;
  status?: number;
  statusText?: string;
}