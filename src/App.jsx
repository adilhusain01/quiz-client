import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;