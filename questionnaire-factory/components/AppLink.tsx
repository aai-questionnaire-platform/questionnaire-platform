import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';

import { LinkProps } from '@/schema/Components';

function AppLink({ slug, children }: PropsWithChildren<LinkProps>) {
  const { appId } = useRouter().query;
  return (
    <Link href={`/${appId}/${slug}`} passHref>
      {children}
    </Link>
  );
}

export default AppLink;
