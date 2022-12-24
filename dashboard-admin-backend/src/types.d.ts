export interface Service {
  title: string;
  categoryId: string;
  id: string;
  serviceProvider: string;
  description: string;
  link: string;
  coverPhoto: string;
}

export interface Category {
  id: string;
  name: string;
}
