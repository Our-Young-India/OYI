import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("oyi_admin_token")) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("oyi_admin_token", res.data.token);
      localStorage.setItem("oyi_admin_email", res.data.email);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-5 py-20 relative overflow-hidden">
      <div className="sun-rays absolute inset-0 opacity-30"/>
      <div className="absolute inset-0 opacity-15" style={{
        background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 50%, #138808 67%, #138808 100%)"
      }}/>
      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <p className="font-cormorant italic text-gold text-lg mb-2">Admin Access</p>
          <h1 className="font-cinzel text-4xl font-bold text-white">Our Young India</h1>
        </div>
        <form onSubmit={submit} className="card-dark p-8 space-y-5">
          <div>
            <label className="font-mont text-xs uppercase tracking-wider text-white/60 mb-2 flex items-center gap-2"><Mail size={12}/> Email</label>
            <input data-testid="admin-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/15 text-white px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:border-saffron"/>
          </div>
          <div>
            <label className="font-mont text-xs uppercase tracking-wider text-white/60 mb-2 flex items-center gap-2"><Lock size={12}/> Password</label>
            <input data-testid="admin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/15 text-white px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:border-saffron"/>
          </div>
          <button data-testid="admin-login-btn" disabled={loading} className="btn-saffron w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="font-mont text-xs text-white/50 text-center">
            Default: admin@ouryoungindia.in / Admin@123
          </p>
        </form>
      </div>
    </div>
  );
}
