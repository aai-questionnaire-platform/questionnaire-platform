import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import GlobalStyle from '@/components/GlobalStyle';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import Home from '@/routes/Home';
import Info from '@/routes/Info';
import Profile from '@/routes/Profile';
import Recommendations from '@/routes/Recommendations';
import ServiceCategories from '@/routes/ServiceCategories';
import Services from '@/routes/Services';
import paths from '@/routes/paths';

function App() {
  return (
    <ResponsiveContainer>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path={paths.INFO}>
            <Route index element={<Info />} />
            <Route path=":subject" element={<Info />} />
          </Route>
          <Route path={paths.HOME} element={<Home />} />
          <Route path={paths.RECOMMENDATIONS} element={<Recommendations />} />
          <Route
            path={paths.SERVICE_CATEGORIES}
            element={<ServiceCategories />}
          />
          <Route path={paths.SERVICES} element={<Services />} />
          <Route path={paths.PROFILE} element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ResponsiveContainer>
  );
}

export default App;
