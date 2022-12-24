import { BrowserRouter, Route, Routes } from 'react-router-dom';

import GlobalStyle from '@/components/GlobalStyle';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import Order from '@/pages/Order';
import Service from '@/pages/Service';
import Services from '@/pages/Services';
import Success from '@/pages/Success';
import AuthenticatedRoute from './components/AuthenticatedRoute/AuthenticatedRoute';
import Login from './components/Login';

function App() {
  const envId = process.env.REACT_APP_LOGIN_ENV_ID;
  
  return (
    <ResponsiveContainer>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthenticatedRoute><Services /></AuthenticatedRoute>} />
          <Route path="/:id" element={<AuthenticatedRoute><Service /></AuthenticatedRoute>} />
          <Route path="/:id/order" element={<AuthenticatedRoute><Order /></AuthenticatedRoute>} />
          <Route path="/:id/success" element={<AuthenticatedRoute><Success /></AuthenticatedRoute>} />
          <Route path={"/api/auth/callback/"+envId} element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ResponsiveContainer>
  );
}

export default App;
