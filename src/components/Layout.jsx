import React, { lazy } from "react";
import { Outlet } from "react-router-dom";

const Header = lazy(() => import("./Header"));
const Footer = lazy(() => import("./Footer"));

const Layout = () => {
  return (
    <main>
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
};

export default Layout;