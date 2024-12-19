export interface WordPressPost {
  title: {
    rendered: string;
  };
  featured_media?: number;
  type?: string;
  meta?: {
    _company_name?: string;
  };
  _links?: {
    'wp:featuredmedia'?: Array<{ href: string }>;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
    'wp:term'?: Array<{
      taxonomy?: string;
      name?: string;
    }>;
  };
}

export interface WordPressPostData {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  type?: 'post' | 'job-listing' | 'job_listing';
  error?: string;
  companyName?: string;
  meta?: {
    _company_name?: string;
  };
}

export interface WordPressMedia {
  source_url: string;
  alt_text?: string;
}