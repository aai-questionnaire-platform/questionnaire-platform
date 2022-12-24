import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Background from '@/components/Background';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import LoginButton from '@/components/LoginButton';
import LogoutSection from '@/components/LogoutSection';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { AuthorizationScopes } from '@/enums';
import { FrontPageComponent } from '@/schema/Components';
import { useAppTheme } from '@/util/hooks';

type FrontPageProps = FrontPageComponent['props'];

const FrontPageContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  ${({ theme }) =>
    theme.frontPage.fgColor && `color: ${theme.frontPage.fgColor};`}
`;

function FrontPage({
  adminLogin,
  background,
  playerLogin,
  contactLink,
}: FrontPageProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { data: session } = useSession({ required: false });
  const user = session?.user;

  return (
    <Background bg={background}>
      <FrontPageContainer>
        <Container ph={24} pt={48}>
          <Flex direction="column" align="center">
            <Heading variant="h1" align="center">
              {t('frontPage.heading')}
            </Heading>

            <Spacer mv={24}>
              <Typography align="center">
                {t('frontPage.playerBody')}
              </Typography>
            </Spacer>

            {user && user.scope !== AuthorizationScopes.PLAY ? (
              <LogoutSection i18nKey="frontPage.signoutToSignInPlayer" />
            ) : (
              <LoginButton
                provider="aai"
                callbackUrl={playerLogin.callbackUrl}
                variant={playerLogin.variant || 'primary'}
                data-cy="front-page-player-login"
              >
                {t('frontPage.playerLoginLabel')}
              </LoginButton>
            )}
          </Flex>
        </Container>

        {adminLogin && (
          <>
            <Spacer mt={48} mb={48} style={{ width: '100%' }}>
              <Divider color={theme.frontPage?.divider} />
            </Spacer>

            <Container ph={16}>
              <Flex direction="column" align="center">
                <Spacer mb={32}>
                  <Typography align="center">
                    {t('frontPage.adminBody')}
                  </Typography>
                </Spacer>

                {user && user.scope !== AuthorizationScopes.APPROVE ? (
                  <LogoutSection i18nKey="frontPage.signoutToSignInGroupAdmin" />
                ) : (
                  <LoginButton
                    provider="cognito"
                    callbackUrl={adminLogin.callbackUrl}
                    variant={adminLogin.variant || 'secondary'}
                    data-cy="front-page-admin-login"
                  >
                    {t('frontPage.adminLoginLabel')}
                  </LoginButton>
                )}
              </Flex>
            </Container>
          </>
        )}

        {contactLink && (
          <Container pt={40} pb={48} ph={16}>
            <Flex direction="column" align="center">
              <Typography as="div">{t('frontPage.registerBody')}</Typography>

              <Typography as="div" align="center">
                <a
                  href={contactLink.slug}
                  style={{ color: 'inherit' }}
                  data-cy="front-page-register"
                >
                  {t('frontPage.registerLabel')}
                </a>
              </Typography>
            </Flex>
          </Container>
        )}
      </FrontPageContainer>
    </Background>
  );
}

export default FrontPage;
