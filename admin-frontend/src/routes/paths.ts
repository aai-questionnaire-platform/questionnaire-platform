const paths = {
  EDIT_CATEGORY: '/questionnaire/content-management/category',
  HELP: '/help',
  HOME: '/',
  LOGIN: '/login',
  QUESTIONNAIRE: '/questionnaire',
  CONTENT_MANAGEMENT: '/questionnaire/content-management',
  USER_MANAGEMENT: '/questionnaire/user-management',
};

export type PathValue = typeof paths[keyof typeof paths];
export default paths;
