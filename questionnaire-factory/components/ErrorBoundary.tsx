import Router from 'next/router';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from 'styled-components';

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 32px;
  text-align: center;
`;

const Button = styled.button`
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'IBM Plex Sans', sans-serif;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background-color: #006efd;
  color: #fff;
`;

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Handle error
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Main>
          <h1>{this.props.t('errorBoundary.heading')}</h1>
          <p>{this.props.t('errorBoundary.description')}</p>
          <Button onClick={Router.reload}>
            {this.props.t('errorBoundary.buttonLabel')}
          </Button>
        </Main>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
