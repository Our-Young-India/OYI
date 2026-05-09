import React from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import About from "./pages/About";
import Nominate from "./pages/Nominate";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-5 py-20">
      <p className="font-cormorant italic text-saffron text-2xl mb-2">Lost in the journey?</p>
      <h1 className="font-cinzel text-6xl font-bold mb-3">404</h1>
      <p className="font-mont text-gray-600 mb-6">This page doesn't exist (yet).</p>
      <a href="/" className="btn-saffron">Back Home</a>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" richColors theme="light" />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route element={<LayoutRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:slug" element={<StoryDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/nominate" element={<Nominate />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
