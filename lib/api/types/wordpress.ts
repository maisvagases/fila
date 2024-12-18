export interface WordPressPost {
  title: {
    rendered: string;
  };
  featured_media?: number;
  type?: string;
  _links?: {
    'wp:featuredmedia'?: Array<{ href: string }>;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
}

export interface WordPressPostData {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  type?: 'post' | 'job-listing';
  error?: string;
}

export interface WordPressMedia {
  source_url: string;
  alt_text?: string;
}