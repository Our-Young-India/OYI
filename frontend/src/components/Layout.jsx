import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      <Navbar />
      <main className="flex-1 pt-[75px]">{children}</main>
      <Footer />
    </div>
  );
}
