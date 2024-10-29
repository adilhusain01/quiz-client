import React, { lazy } from "react";
import { Outlet } from "react-router-dom";

const Header = lazy(() => import("./Header"));
const Footer = lazy(() => import("./Footer"));

const Layout = () => {
  return (
    <main className="flex flex-col bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
};

export default Layout;