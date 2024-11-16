import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const Header = lazy(() => import('./Header'));

const Layout = () => {
  return (
    <main className='flex flex-col w-full min-w-full'>
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <Outlet />
      </Suspense>
    </main>
  );
};

export default Layout;
