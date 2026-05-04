import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useScaleIn, useStaggerChildren } from "../hooks/useAnime.js";

export default function Login() {
  const cardRef = useScaleIn([]);
  const formRef = useStaggerChildren(".form-group, button[type='submit']", []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-6">
      {/* auth-card class kept for anime.js opacity:0 initial state */}
      <div
        className="auth-card w-full max-w-[420px] bg-white p-9 rounded-[10px] shadow-[0_8px_40px_rgba(28,28,28,0.1)] border border-line"
        ref={cardRef}
      >
        <h2 className="mb-1 text-2xl font-extrabold tracking-[-0.4px] text-primary">Login</h2>
        <p className="text-muted mb-7 text-sm">Masuk ke akun marketplace-mu</p>

        {error && (
          <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} ref={formRef}>
          {/* form-group class kept for anime.js stagger selector */}
          <div className="form-group mb-[18px]">
            <label htmlFor="email" className="block mb-[7px] font-bold text-[13px] text-primary tracking-[0.2px]">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@contoh.com"
              className="w-full px-3.5 py-[11px] border border-line rounded-[6px] text-sm bg-page transition-[border-color,box-shadow,background] duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus:bg-white placeholder:text-[#bbb8b3]"
            />
          </div>

          <div className="form-group mb-[18px]">
            <label htmlFor="password" className="block mb-[7px] font-bold text-[13px] text-primary tracking-[0.2px]">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 8 karakter"
              className="w-full px-3.5 py-[11px] border border-line rounded-[6px] text-sm bg-page transition-[border-color,box-shadow,background] duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus:bg-white placeholder:text-[#bbb8b3]"
            />
          </div>

          <button
            type="submit"
            className="block w-full mt-2 px-5 py-2.5 rounded-[6px] border-0 text-[13px] font-bold cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-secondary hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-[22px] text-sm text-muted">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
