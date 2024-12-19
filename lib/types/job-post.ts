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
  title?: {
    rendered: string;
  };
  type?: 'post' | 'job-listing' | 'job_listing';
  meta?: {
    _company_name?: string;
  };
  companies?: Array<{
    _company_name?: string;
  }>;
}

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
  type?: 'job-listing' | 'post';
  companyName: string;
}