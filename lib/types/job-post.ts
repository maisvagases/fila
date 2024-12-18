export interface JobPost {
  _id: {
    $oid: string;
  };
  url: string;
  startTime: {
    $date: string;
  };
  finishedTime: {
    $date: string;
  };
}

export interface JobPostDTO {
  id: string;
  url: string;
  startTime: Date;
  finishedTime: Date;
  title?: string;
  imageUrl?: string;
  imageAlt?: string;
  status: 'success' | 'error';
  error?: string;
}