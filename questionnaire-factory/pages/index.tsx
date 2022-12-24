import { getQuestionnaireMap } from '@/config/FQDNQuestionnaireMap';

export default function HomePage() {
  return <main />;
}

/**
 * Redirects user to questionnaire -page based on request url.
 * @param context Next.js request context
 */
export async function getServerSideProps(context: any) {
  const questionaireId = getQuestionnaireMap(
    process.env.NEXT_PUBLIC_ENVNAME as string
  ).get(context.req.headers.host);

  if (questionaireId) {
    return {
      redirect: {
        destination: `/${questionaireId}`,
        permanent: false,
      },
    };
  }

  return {
    notFound: true,
  };
}
