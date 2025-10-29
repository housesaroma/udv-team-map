import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-primary font-golos">
      <Header />
      <main className="bg-primary">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
