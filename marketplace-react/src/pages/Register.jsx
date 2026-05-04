import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useScaleIn, useStaggerChildren } from "../hooks/useAnime.js";

export default function Register() {
  const cardRef = useScaleIn([]);
  const formRef = useStaggerChildren(".form-group, button[type='submit']", []);
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "", role: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.password_confirmation) { setError("Konfirmasi password tidak cocok"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation, form.role);
      setSuccess("Pendaftaran berhasil! Mengarahkan ke halaman login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) setError(errors[Object.keys(errors)[0]][0]);
      else setError(err.response?.data?.message || "Gagal mendaftar, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-[11px] border border-line rounded-[6px] text-sm bg-page transition-[border-color,box-shadow,background] duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus:bg-white placeholder:text-[#bbb8b3]";
  const labelClass = "block mb-[7px] font-bold text-[13px] text-primary tracking-[0.2px]";

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-6">
      {/* auth-card class kept for anime.js opacity:0 initial state */}
      <div
        className="auth-card w-full max-w-[420px] bg-white p-9 rounded-[10px] shadow-[0_8px_40px_rgba(28,28,28,0.1)] border border-line"
        ref={cardRef}
      >
        <h2 className="mb-1 text-2xl font-extrabold tracking-[-0.4px] text-primary">Register</h2>
        <p className="text-muted mb-7 text-sm">Buat akun marketplace baru</p>

        {error && <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">{error}</div>}
        {success && <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-green-50 text-green-700 border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="form-group mb-[18px]">
            <label htmlFor="name" className={labelClass}>Nama</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Nama lengkap" className={inputClass} />
          </div>

          <div className="form-group mb-[18px]">
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="nama@contoh.com" className={inputClass} />
          </div>

          <div className="form-group mb-[18px]">
            <label htmlFor="password" className={labelClass}>Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} placeholder="Minimal 8 karakter" className={inputClass} />
          </div>

          <div className="form-group mb-[18px]">
            <label htmlFor="password_confirmation" className={labelClass}>Konfirmasi Password</label>
            <input id="password_confirmation" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required placeholder="Ketik ulang password" className={inputClass} />
          </div>

          <div className="form-group mb-[18px]">
            <label htmlFor="role" className={labelClass}>Daftar sebagai</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="" disabled>-- Pilih role --</option>
              <option value="buyer">Pembeli (Buyer)</option>
              <option value="seller">Penjual (Seller)</option>
            </select>
          </div>

          <button
            type="submit"
            className="block w-full mt-2 px-5 py-2.5 rounded-[6px] border-0 text-[13px] font-bold cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-secondary hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center mt-[22px] text-sm text-muted">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}
