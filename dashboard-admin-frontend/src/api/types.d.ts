export interface Service {
  title: string;
  categoryId: string;
  id: string;
  serviceProvider: string;
  coverPhoto: string;
  coverPhotoAltText: string;
  description: string;
  link: string;
  forYou: boolean;
}

export interface Category {
  id: string;
  name: string;
}
