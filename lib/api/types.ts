export interface JobPostDTO {
  id: string;
  url: string;
  startTime: Date;
  finishedTime: Date;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  status: 'success' | 'error';
  error: string; // Remover o opcional
}

export interface APIError {
  message: string;
  status?: number;
  statusText?: string;
}