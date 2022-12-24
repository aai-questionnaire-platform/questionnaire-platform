import { signIn } from 'next-auth/react';
import { PropsWithoutRef } from 'react';

import Button from '@/components/Button';
import { ButtonProps } from '@/components/Button/ButtonBase';
import { LoginProps } from '@/schema/Components';

type LoginButtonProps = PropsWithoutRef<LoginProps & ButtonProps>;

function LoginButton({
  callbackUrl,
  provider,
  children,
  ...rest
}: LoginButtonProps) {
  const useProvider = chooseProvider(provider);

  return (
    <Button {...rest} onClick={() => signIn(useProvider, { callbackUrl })}>
      {children}
    </Button>
  );
}

const chooseProvider = (provider: string) => {
  if (provider === 'aai') {
    return `auroraai-${process.env.NEXT_PUBLIC_PROVIDER_EXTENSION}`;
  }

  if (provider === 'cognito') {
    return `admin-${process.env.NEXT_PUBLIC_PROVIDER_EXTENSION}`;
  }

  throw new Error(`No such provider: ${provider}`);
};

export default LoginButton;
