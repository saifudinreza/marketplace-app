import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CAT_ICONS = {
  "Elektronik": "💻",
  "Fashion": "👗",
  "Makanan & Minuman": "🍔",
  "Peralatan Rumah": "🏠",
  "Olahraga": "⚽",
  "Buku & Pendidikan": "📚",
  "Kecantikan & Kesehatan": "💄",
  "Otomotif": "🚗",
};

const ITEMS_PER_PAGE = 8;

const VOUCHERS = [
  { id: 1, title: "Diskon 25rb",   desc: "Min. belanja 150rb",       color: "v1", icon: "🎟️" },
  { id: 2, title: "Gratis Ongkir", desc: "Semua produk elektronik",  color: "v2", icon: "🚚" },
  { id: 3, title: "Cashback 10%",  desc: "Khusus member baru",       color: "v3", icon: "💰" },
];

const VOUCHER_STYLES = {
  v1: "bg-cream border-tan",
  v2: "bg-[#ede9e3] border-secondary",
  v3: "bg-[#faf6ee] border-[#c9a84c]",
};

const SLIDE_BG = [
  "bg-[linear-gradient(135deg,#2c2c2c_0%,#4a4540_100%)]",
  "bg-[linear-gradient(135deg,#5c4a3a_0%,#8b6b4a_100%)]",
  "bg-[linear-gradient(135deg,#1a2a3a_0%,#2c4a6a_100%)]",
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bannerIdx, setBannerIdx] = useState(0);

  const search = searchParams.get("search") || "";
  const catFilter = searchParams.get("category") || "";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          axiosClient.get("/products"),
          axiosClient.get("/categories"),
        ]);
        setProducts(Array.isArray(prodRes.data?.data ?? prodRes.data) ? (prodRes.data?.data ?? prodRes.data) : []);
        setCategories(Array.isArray(catRes.data?.data ?? catRes.data) ? (catRes.data?.data ?? catRes.data) : []);
      } catch {
        setError("Gagal memuat data. Pastikan API jalan di localhost:8000");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCatClick = (catId) => {
    setCurrentPage(1);
    navigate(catId ? `/?category=${catId}` : "/");
  };

  const banners = products.slice(0, 3);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || String(p.category_id) === catFilter || String(p.category?.id) === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const activeCatName = catFilter ? categories.find((c) => String(c.id) === String(catFilter))?.name : null;

  if (loading) return <div className="text-center py-[70px] text-muted">Memuat produk...</div>;

  return (
    <div className="flex flex-col gap-4">

      {/* BANNER SLIDER */}
      {banners.length > 0 && (
        <div className="relative rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(28,28,28,0.1)] [animation:fadeUp_0.5s_ease_both]">
          <div
            className="flex transition-transform duration-[550ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
          >
            {banners.map((b, i) => (
              <Link
                key={b.id}
                to={`/products/${b.id}`}
                className={`min-w-full px-10 py-9 flex items-center justify-between gap-6 no-underline text-inherit ${SLIDE_BG[i % 3]}`}
              >
                <div className="text-white">
                  <h2 className="text-2xl font-extrabold text-white mb-2 leading-[1.25] max-w-[380px] line-clamp-2 tracking-[-0.3px]">
                    {b.name}
                  </h2>
                  <p className="text-[13px] text-white/75 mb-[18px]">
                    Mulai Rp {Number(b.price || 0).toLocaleString("id-ID")} · Stok terbatas
                  </p>
                  <span className={`inline-block bg-white rounded px-[22px] py-[9px] text-xs font-bold tracking-[0.5px] uppercase transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)] ${i === 1 ? "text-secondary" : "text-primary"}`}>
                    Belanja Sekarang
                  </span>
                </div>
                <div className="w-[130px] h-[130px] rounded-[10px] bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/15">
                  <img
                    src={b.file_url || b.image || b.image_url || `https://picsum.photos/seed/${b.id}/200/200`}
                    alt={b.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>

          {banners.length > 1 && (
            <>
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 left-3.5 bg-white/15 border border-white/25 rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer text-white text-lg font-bold leading-none backdrop-blur-sm transition-[background,transform] duration-200 hover:bg-white/30 hover:scale-[1.08] hover:-translate-y-1/2"
                onClick={() => setBannerIdx((i) => (i - 1 + banners.length) % banners.length)}
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-3.5 bg-white/15 border border-white/25 rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer text-white text-lg font-bold leading-none backdrop-blur-sm transition-[background,transform] duration-200 hover:bg-white/30 hover:scale-[1.08] hover:-translate-y-1/2"
                onClick={() => setBannerIdx((i) => (i + 1) % banners.length)}
              >
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBannerIdx(i)}
                    aria-label={`Banner ${i + 1}`}
                    className={`h-1.5 rounded-full border-0 p-0 cursor-pointer transition-all duration-[280ms] ${i === bannerIdx ? "bg-white w-6 rounded-[3px]" : "bg-white/40 w-1.5"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <div className="bg-white rounded-[10px] p-[22px_24px] shadow-[0_1px_12px_rgba(28,28,28,0.05)] border border-line [animation:fadeUp_0.5s_ease_both]">
          <div className="text-[15px] font-extrabold text-primary flex items-center gap-2.5 mb-4 tracking-[-0.2px]">
            Kategori <span className="text-secondary">Produk</span>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <button
              type="button"
              className={`flex flex-col items-center gap-2 cursor-pointer no-underline text-primary transition-transform duration-[220ms] p-1.5 rounded-lg border-0 bg-transparent hover:-translate-y-1 ${!catFilter ? "active" : ""}`}
              onClick={() => handleCatClick(null)}
            >
              <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-[22px] transition-[transform,box-shadow] duration-[220ms] hover:scale-[1.08] ${!catFilter ? "bg-primary text-white" : "bg-cream text-secondary"}`}>
                🛍️
              </div>
              <span className={`text-[11px] text-center font-semibold leading-[1.3] tracking-[0.1px] ${!catFilter ? "text-primary font-bold" : "text-muted"}`}>
                Semua
              </span>
            </button>

            {categories.map((c) => {
              const isActive = String(c.id) === catFilter;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="flex flex-col items-center gap-2 cursor-pointer text-primary transition-transform duration-[220ms] p-1.5 rounded-lg border-0 bg-transparent hover:-translate-y-1"
                  onClick={() => handleCatClick(c.id)}
                >
                  <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-[22px] transition-[transform,box-shadow] duration-[220ms] hover:scale-[1.08] ${isActive ? "bg-primary text-white" : "bg-cream text-secondary"}`}>
                    {CAT_ICONS[c.name] ?? "🏷️"}
                  </div>
                  <span className={`text-[11px] text-center font-semibold leading-[1.3] tracking-[0.1px] ${isActive ? "text-primary font-bold" : "text-muted"}`}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VOUCHERS */}
      <div className="bg-white rounded-[10px] p-[22px_24px] shadow-[0_1px_12px_rgba(28,28,28,0.05)] border border-line [animation:fadeUp_0.5s_ease_both]">
        <div className="text-[15px] font-extrabold text-primary flex items-center gap-2.5 mb-4 tracking-[-0.2px]">
          Voucher <span className="text-secondary">Spesial</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {VOUCHERS.map((v) => (
            <div
              key={v.id}
              className={`rounded-lg px-[18px] py-4 flex items-center gap-3.5 border-[1.5px] border-dashed cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(28,28,28,0.08)] ${VOUCHER_STYLES[v.color]}`}
            >
              <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center text-[22px] shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                {v.icon}
              </div>
              <div>
                <p className="text-[13px] font-bold text-primary mb-0.5">{v.title}</p>
                <span className="text-[11px] text-muted">{v.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="bg-white rounded-[10px] p-[22px_24px] shadow-[0_1px_12px_rgba(28,28,28,0.05)] border border-line [animation:fadeUp_0.5s_ease_both]">
        <div className="flex justify-between items-center gap-3 mb-1.5 flex-wrap">
          <div className="text-[15px] font-extrabold text-primary flex items-center gap-2.5 tracking-[-0.2px]">
            <span className="bg-primary text-white px-2.5 py-[3px] rounded text-[10px] font-bold tracking-[0.5px] uppercase">FLASH SALE</span>
            {search ? `Hasil "${search}"` : activeCatName ? `${CAT_ICONS[activeCatName] ?? ""} ${activeCatName}` : "Produk Terlaris"}
          </div>
          {user?.role === "seller" && (
            <Link
              to="/products/create"
              className="bg-primary text-white px-[18px] py-2 rounded text-xs font-bold whitespace-nowrap no-underline inline-block tracking-[0.3px] transition-[background,transform] duration-200 hover:bg-secondary hover:text-white hover:-translate-y-px hover:no-underline"
            >
              + Tambah Produk
            </Link>
          )}
        </div>

        <div className="text-xs text-muted mb-[18px]">
          Menampilkan {filtered.length} produk · Halaman {safePage} dari {totalPages}
        </div>

        {error && <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">{error}</div>}

        {paginated.length === 0 ? (
          <div className="text-center py-[70px] text-muted bg-white rounded-[10px] border border-line">
            <div className="text-5xl mb-3">📦</div>
            <p className="mb-4 text-base">
              {search ? `Tidak ada produk yang cocok dengan "${search}"` : activeCatName ? `Belum ada produk di kategori ${activeCatName}.` : "Belum ada produk di marketplace."}
            </p>
            {user?.role === "seller" && !search && (
              <Link to="/products/create" className="bg-primary text-white px-[18px] py-2 rounded text-xs font-bold no-underline inline-block tracking-[0.3px] transition-[background,transform] duration-200 hover:bg-secondary hover:text-white hover:-translate-y-px">
                + Tambah Produk Pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
              {paginated.map((p) => (
                <div key={p.id} className="product-grid-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
}
