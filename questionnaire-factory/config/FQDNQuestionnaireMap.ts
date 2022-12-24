// Maps fully qualified domain name to questionnaire
const envMaps: Record<string, Map<string, string>> = {
  'dev': new Map<string, string>([
    ['mygame.yourdomain.fi', 'mygame'],
    ['localhost:3000', 'mygame'],
  ]),
};

export function getQuestionnaireMap(env: string) {
  const map = envMaps[env];
  return map || envMaps.dev;
}
