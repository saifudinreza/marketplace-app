import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const DUMMY_NOTIFS = [
  {
    id: 1,
    title: "Pesanan dikirim",
    desc: "Pesanan #ZF-1024 dalam perjalanan",
    time: "5 menit lalu",
  },
  {
    id: 2,
    title: "Promo TWS Gaming 50%",
    desc: "Diskon spesial sampai malam ini",
    time: "1 jam lalu",
  },
  {
    id: 3,
    title: "Voucher baru tersedia",
    desc: "Klaim voucher cashback Rp 25rb",
    time: "2 jam lalu",
  },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [catOpen, setCatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchAreaRef = useRef(null);
  const notifRef = useRef(null);

  const activeCat = searchParams.get("category") || "";

  useEffect(() => {
    axiosClient
      .get("/categories")
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target)) {
        setCatOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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

  // Hide search/categories on auth pages for cleaner look
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <nav className="zf-nav">
      <div className="zf-nav-inner">
        <Link to="/" className="zf-logo">
          Z<span>Flux</span>
        </Link>

        {!isAuthPage && (
          <div className="zf-search-area" ref={searchAreaRef}>
            <form className="zf-search-row" onSubmit={handleSearch}>
              <button
                type="button"
                className={`zf-cat-trigger ${catOpen ? "open" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCatOpen((v) => !v);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                Kategori
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className="zf-search-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#bbb"
                  strokeWidth="2"
                  width="14"
                  height="14"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari produk, brand, atau kategori..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <button type="submit" className="zf-search-btn">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Cari
              </button>
            </form>

            {catOpen && (
              <div className="zf-cat-dropdown">
                <div className="zf-cat-dropdown-title">Pilih kategori</div>
                {categories.length === 0 ? (
                  <div className="zf-cat-empty">Belum ada kategori.</div>
                ) : (
                  <div className="zf-cat-grid-full">
                    <button
                      type="button"
                      className="zf-cat-grid-item"
                      onClick={() => handleCatPick(null)}
                    >
                      <span className="zf-cat-grid-dot" />
                      <span>Semua Kategori</span>
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="zf-cat-grid-item"
                        onClick={() => handleCatPick(c.id)}
                      >
                        <span className="zf-cat-grid-dot" />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="zf-nav-right">
          <Link to="/cart" className="zf-icon-btn">
            {count > 0 && (
              <div className="zf-badge">{count > 99 ? "99+" : count}</div>
            )}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="zf-icon-label">Keranjang</span>
          </Link>

          <div className="zf-icon-wrap" ref={notifRef}>
            <button
              type="button"
              className="zf-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen((v) => !v);
              }}
            >
              <div className="zf-badge">{DUMMY_NOTIFS.length}</div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="zf-icon-label">Notif</span>
            </button>

            {notifOpen && (
              <div className="zf-notif-dropdown">
                <div className="zf-notif-title">Notifikasi</div>
                {DUMMY_NOTIFS.map((n) => (
                  <div key={n.id} className="zf-notif-item">
                    <div className="zf-notif-dot" />
                    <div>
                      <div className="zf-notif-item-title">{n.title}</div>
                      <div className="zf-notif-item-desc">{n.desc}</div>
                      <div className="zf-notif-item-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="zf-user-area">
              <Link to="/profile" className="zf-user-link">
                Hai, {user?.name?.split(" ")[0] || "User"}
              </Link>
              <button
                type="button"
                className="zf-login-btn zf-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="zf-login-btn">
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>

      {!isAuthPage && (
        <div className="zf-cat-bar">
          <button
            type="button"
            className={`zf-cat-pill ${!activeCat ? "active" : ""}`}
            onClick={() => handleCatPick(null)}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`zf-cat-pill ${
                String(activeCat) === String(c.id) ? "active" : ""
              }`}
              onClick={() => handleCatPick(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
