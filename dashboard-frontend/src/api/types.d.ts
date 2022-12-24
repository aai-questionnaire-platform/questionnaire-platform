type ImageProps = {
  alt: string;
  src: string;
};

export interface Comment {
  image: ImageProps;
  quote: string;
  timestamp: number;
}

export interface Service {
  title: string;
  id: string;
  description: string;
  coverPhoto: { big: ImageProps; small: ImageProps };
  serviceProvider: {
    name?: string;
    logo: ImageProps;
  };
  comments?: Comment[];
  commentTitle?: string;
  commentImage?: ImageProps;
  available: boolean;
  link: {
    src: string;
    text: string;
    external: boolean;
  };
  categoryId: string;
  recommended: boolean;
}

export interface ServiceCategory {
  image?: ImageProps;
  link: string;
  title: string;
  id: string;
}
