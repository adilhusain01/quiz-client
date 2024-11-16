import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

const Header = lazy(() => import('./Header'));
const Footer = lazy(() => import('./Footer'));

const Layout = () => {
  return (
    <main className='flex flex-col'>
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
};

export default Layout;
