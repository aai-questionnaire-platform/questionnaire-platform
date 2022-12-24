export interface SerivceInterface {
  title: string;
  categoryId: string;
  id: string;
  serviceProvider: {
    name: string;
  };
  description: string;
  link: {
    text: string;
    src: string;
  };
  available: boolean;
  recommended: boolean;
}

export const services: SerivceInterface[] = [
  {
    title: "title",
    categoryId: "1df32e05-2ed2-4bfa-aa1f-81e56fe7f9cd",
    id: "a632eaaf-02e0-41fe-ab25-7b2d99b7be68",
    serviceProvider: {
      name: "serviceprovider",
    },
    description: "descrption",
    link: {
      text: "Siirry palveluun",
      src: "source",
    },
    available: true,
    recommended: true,
  },
];
