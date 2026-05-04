import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAddress } from "../context/AddressContext.jsx";
import ZFluxLogo from "./ZFluxLogo.jsx";

const DUMMY_NOTIFS = [
  { id: 1, title: "Pesanan dikirim", desc: "Pesanan #ZF-1024 dalam perjalanan", time: "5 menit lalu" },
  { id: 2, title: "Promo TWS Gaming 50%", desc: "Diskon spesial sampai malam ini", time: "1 jam lalu" },
  { id: 3, title: "Voucher baru tersedia", desc: "Klaim voucher cashback Rp 25rb", time: "2 jam lalu" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useCart();
  const { activeAddress, setModalOpen } = useAddress();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [catOpen, setCatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchAreaRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    axiosClient.get("/categories")
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => { setSearchInput(searchParams.get("search") || ""); }, [searchParams]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target)) setCatOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) params.set("search", searchInput.trim());
    else params.delete("search");
    navigate(`/?${params.toString()}`);
  };

  const handleCatPick = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId) params.set("category", String(catId));
    else params.delete("category");
    navigate(`/?${params.toString()}`);
    setCatOpen(false);
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const activeCatId = searchParams.get("category") || "";
  const activeCatName = activeCatId ? categories.find((c) => String(c.id) === activeCatId)?.name : null;
  const shortAddr = activeAddress
    ? (activeAddress.shortAddress || activeAddress.address || "").split(",").slice(0, 2).join(",")
    : null;

  return (
    <nav className="bg-white border-b border-line sticky top-0 z-[100] shadow-[0_1px_12px_rgba(28,28,28,0.06)]">

      {/* ── Main bar ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-0">

        {/* Logo — order 1 */}
        <Link
          to="/"
          className="order-1 shrink-0 no-underline transition-opacity duration-[180ms] hover:opacity-75"
        >
          <ZFluxLogo />
        </Link>

        {/* Right icons — order 2 on mobile (pushed right via ml-auto), order 3 on desktop */}
        <div className="order-2 md:order-3 ml-auto md:ml-0 flex items-center gap-3 md:gap-[18px] shrink-0">

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex flex-col items-center gap-0.5 text-muted no-underline transition-colors duration-200 hover:text-primary"
          >
            {count > 0 && (
              <div className="absolute -top-[5px] -right-2 bg-primary text-white text-[9px] rounded-[10px] px-[5px] py-px font-bold min-w-4 text-center leading-[1.2] pointer-events-none">
                {count > 99 ? "99+" : count}
              </div>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="hidden md:block text-[9px] whitespace-nowrap font-medium tracking-[0.2px]">Keranjang</span>
          </Link>

          {/* Notif */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="flex flex-col items-center gap-0.5 relative bg-transparent border-0 text-muted cursor-pointer transition-colors duration-200 hover:text-primary"
              onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); }}
            >
              <div className="absolute -top-[5px] -right-2 bg-primary text-white text-[9px] rounded-[10px] px-[5px] py-px font-bold min-w-4 text-center leading-[1.2] pointer-events-none">
                {DUMMY_NOTIFS.length}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="hidden md:block text-[9px] whitespace-nowrap font-medium tracking-[0.2px]">Notif</span>
            </button>

            {notifOpen && (
              <div className="absolute top-[calc(100%+12px)] right-0 w-[min(300px,calc(100vw-24px))] bg-white border border-line rounded-[10px] shadow-[0_12px_36px_rgba(28,28,28,0.12)] overflow-hidden z-[200]">
                <div className="px-4 py-3 text-[11px] font-bold text-muted border-b border-line uppercase tracking-[0.8px]">Notifikasi</div>
                {DUMMY_NOTIFS.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex gap-2.5 items-start border-b border-line last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-cream">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-[5px] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-primary mb-0.5">{n.title}</div>
                      <div className="text-[11px] text-muted mb-0.5">{n.desc}</div>
                      <div className="text-[10px] text-[#bbb]">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auth — desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2.5">
              {user?.role === "seller" && (
                <Link
                  to="/my-products"
                  className="bg-cream text-secondary border border-tan rounded px-3.5 py-[7px] text-[13px] font-semibold no-underline whitespace-nowrap transition-all duration-200 hover:bg-secondary hover:text-white hover:border-secondary hover:no-underline"
                >
                  Produk Saya
                </Link>
              )}
              <Link to="/profile" className="text-[13px] text-muted font-semibold whitespace-nowrap no-underline transition-colors duration-200 hover:text-primary">
                Hai, {user?.name?.split(" ")[0] || "User"}
              </Link>
              <button
                type="button"
                className="bg-transparent text-muted border border-line rounded px-3.5 py-[7px] text-xs font-bold cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-block bg-primary text-white border-0 rounded px-[18px] py-2 text-xs font-bold whitespace-nowrap no-underline tracking-[0.3px] transition-all duration-200 hover:bg-secondary hover:-translate-y-px hover:no-underline"
            >
              Masuk / Daftar
            </Link>
          )}

          {/* Auth — mobile compact */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="md:hidden w-8 h-8 rounded-full bg-cream text-secondary flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          ) : (
            <Link
              to="/login"
              className="md:hidden bg-primary text-white border-0 rounded px-3 py-1.5 text-[11px] font-bold no-underline whitespace-nowrap"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Search — order 3 on mobile (wraps to new row), order 2 on desktop */}
        {!isAuthPage && (
          <div className="order-3 md:order-2 w-full md:w-auto md:flex-1 md:min-w-0 relative mt-2 md:mt-0" ref={searchAreaRef}>
            <form
              className="flex items-stretch border border-line rounded-[10px] bg-page overflow-hidden transition-[border-color,box-shadow,background] duration-200 focus-within:border-secondary focus-within:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus-within:bg-white"
              onSubmit={handleSearch}
            >
              {/* Category trigger */}
              <button
                type="button"
                className="flex items-center gap-[5px] px-3 bg-transparent border-0 border-r border-line cursor-pointer whitespace-nowrap text-xs font-semibold text-muted shrink-0 tracking-[0.2px] transition-colors duration-200 hover:text-primary"
                onClick={(e) => { e.stopPropagation(); setCatOpen((v) => !v); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                <span className={`hidden sm:inline ${activeCatName ? "text-secondary max-w-[80px] truncate" : ""}`}>
                  {activeCatName ?? "Kategori"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`hidden sm:block w-3 h-3 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Input */}
              <div className="flex-1 flex items-center px-3 gap-2 min-w-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" width="14" height="14" className="shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari produk, brand, atau kategori..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="border-0 outline-none flex-1 text-[13px] text-primary bg-transparent py-2.5 min-w-0 placeholder:text-[#bbb8b3]"
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="bg-primary text-white border-0 px-3 sm:px-5 text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 tracking-[0.3px] transition-colors duration-200 hover:bg-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[13px] h-[13px]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="hidden sm:inline">Cari</span>
              </button>
            </form>

            {/* Category dropdown */}
            {catOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-line rounded-[10px] shadow-[0_12px_36px_rgba(28,28,28,0.12)] z-[200] p-3">
                <div className="text-[10px] font-bold text-[#bbb] uppercase tracking-[0.8px] mb-2.5">Pilih kategori</div>
                {categories.length === 0 ? (
                  <div className="py-3 px-1 text-[13px] text-[#999]">Belum ada kategori.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      className="px-3 py-2.5 rounded-[6px] border border-line cursor-pointer flex items-center gap-2 bg-white text-xs text-muted text-left transition-all duration-[180ms] hover:bg-cream hover:border-secondary hover:text-secondary"
                      onClick={() => handleCatPick(null)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-tan shrink-0" />
                      <span>Semua Kategori</span>
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="px-3 py-2.5 rounded-[6px] border border-line cursor-pointer flex items-center gap-2 bg-white text-xs text-muted text-left transition-all duration-[180ms] hover:bg-cream hover:border-secondary hover:text-secondary"
                        onClick={() => handleCatPick(c.id)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-tan shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Address bar ── */}
      {isAuthenticated && !isAuthPage && (
        <div className="bg-[#faf8f5] border-t border-line">
          <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-[6px] flex items-center gap-2 min-w-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#8b6b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
              <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-[11px] text-muted whitespace-nowrap shrink-0">Dikirim ke</span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 group min-w-0"
            >
              <span className="text-[11px] font-bold text-primary truncate max-w-[160px] sm:max-w-[300px] group-hover:text-secondary transition-colors">
                {shortAddr || <span className="text-secondary font-bold">+ Tambah Alamat</span>}
              </span>
              {shortAddr && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-muted shrink-0 group-hover:text-secondary transition-colors">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              )}
            </button>
            {activeAddress && (
              <span className="ml-auto text-[10px] font-bold text-secondary bg-[#f5ede0] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                {activeAddress.label || "Alamat"}
              </span>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
