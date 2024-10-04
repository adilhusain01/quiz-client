import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WalletProvider from './context/WalletContext';

const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const Test = lazy(() => import('./pages/Test'));

const App = () => {
  return (
    <WalletProvider> {/* Wrap the entire app with WalletProvider */}
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path='/' element={<Home />} />
              <Route path='/test' element={<Test />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </WalletProvider>
  );
};

export default App;
