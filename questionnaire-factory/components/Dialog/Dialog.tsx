import { PropsWithChildren, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { animated, config, useTransition } from 'react-spring';
import styled from 'styled-components';

import { onKeys } from '@/util';
import { useEffectAfterMount } from '@/util/hooks';

interface DialogProps {
  isOpen: boolean;
  close: VoidFunction;
  autoFocus?: boolean;
}

const DialogOverlay = styled(animated.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  visibility: visible;

  &[aria-hidden='true'] {
    visibility: hidden;
  }
`;

const StyledDialog = styled(animated.div)`
  background-color: #fff;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

function Dialog({
  isOpen,
  close,
  autoFocus,
  children,
  ...rest
}: PropsWithChildren<DialogProps>) {
  const ref = useRef<HTMLHeadingElement>(null);
  const prevFocus = useRef<any>(null);
  const { t } = useTranslation();
  const overlayTransitions = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const contentTransitions = useTransition(isOpen, {
    from: { transform: 'translateY(-40px)' },
    enter: { transform: 'translateY(0px)' },
    config: config.wobbly,
  });

  useEffectAfterMount(() => {
    if (isOpen) {
      prevFocus.current = document.activeElement;
      document.body.classList.add('prevent-scroll');
    } else {
      document.body.classList.remove('prevent-scroll');

      // revert the focus back to the element that
      // was focused when the dialog was opened
      if (prevFocus.current) {
        prevFocus.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus, isOpen]);

  return (
    <>
      {overlayTransitions(
        (styles, item) =>
          item && (
            <DialogOverlay
              aria-hidden={!isOpen}
              style={styles}
              onKeyUp={onKeys(close, 'Escape')}
            >
              {contentTransitions(
                (styles, item) =>
                  item && (
                    <StyledDialog
                      role="dialog"
                      aria-label={t('networkError.error')}
                      style={styles}
                      ref={ref}
                      tabIndex={-1}
                      {...rest}
                    >
                      {children}
                    </StyledDialog>
                  )
              )}
            </DialogOverlay>
          )
      )}
    </>
  );
}

export default Dialog;
