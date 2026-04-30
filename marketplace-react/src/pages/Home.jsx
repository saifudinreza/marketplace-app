import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ITEMS_PER_PAGE = 8;

const VOUCHERS = [
  {
    id: 1,
    title: "Diskon 25rb",
    desc: "Min. belanja 150rb",
    color: "v1",
    icon: "🎟️",
  },
  {
    id: 2,
    title: "Gratis Ongkir",
    desc: "Semua produk elektronik",
    color: "v2",
    icon: "🚚",
  },
  {
    id: 3,
    title: "Cashback 10%",
    desc: "Khusus member baru",
    color: "v3",
    icon: "💰",
  },
];

export default function Home() {
  const { user } = useAuth();
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
        const prodList = prodRes.data?.data ?? prodRes.data ?? [];
        const catList = catRes.data?.data ?? catRes.data ?? [];
        setProducts(Array.isArray(prodList) ? prodList : []);
        setCategories(Array.isArray(catList) ? catList : []);
      } catch (err) {
        setError("Gagal memuat data. Pastikan API jalan di localhost:8000");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, catFilter]);

  const banners = products.slice(0, 3);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(
      () => setBannerIdx((i) => (i + 1) % banners.length),
      4000,
    );
    return () => clearInterval(id);
  }, [banners.length]);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !catFilter ||
      String(p.category_id) === catFilter ||
      String(p.category?.id) === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const activeCatName = catFilter
    ? categories.find((c) => String(c.id) === String(catFilter))?.name
    : null;

  if (loading) return <div className="loading">Memuat produk...</div>;

  return (
    <div className="zf-home">
      {/* BANNER SLIDER */}
      {banners.length > 0 && (
        <div className="zf-banner-wrap">
          <div
            className="zf-slides"
            style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
          >
            {banners.map((b, i) => (
              <Link
                key={b.id}
                to={`/products/${b.id}`}
                className={`zf-slide zf-slide-${i % 3}`}
              >
                <div className="zf-slide-text">
                  <h2>{b.name}</h2>
                  <p>
                    Mulai Rp {Number(b.price || 0).toLocaleString("id-ID")} ·
                    Stok terbatas
                  </p>
                  <span className="zf-slide-cta">Belanja Sekarang</span>
                </div>
                <div className="zf-slide-img">
                  <img
                    src={
                      b.file_url ||
                      b.image ||
                      b.image_url ||
                      `https://picsum.photos/seed/${b.id}/200/200`
                    }
                    alt={b.name}
                  />
                </div>
              </Link>
            ))}
          </div>
          {banners.length > 1 && (
            <>
              <button
                type="button"
                className="zf-nav-arrow left"
                onClick={() =>
                  setBannerIdx(
                    (i) => (i - 1 + banners.length) % banners.length,
                  )
                }
              >
                ‹
              </button>
              <button
                type="button"
                className="zf-nav-arrow right"
                onClick={() =>
                  setBannerIdx((i) => (i + 1) % banners.length)
                }
              >
                ›
              </button>
              <div className="zf-dots">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`zf-dot ${i === bannerIdx ? "active" : ""}`}
                    onClick={() => setBannerIdx(i)}
                    aria-label={`Banner ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <div className="zf-section">
          <div className="zf-section-title">
            Kategori <span>Produk</span>
          </div>
          <div className="zf-cats">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/?category=${c.id}`}
                className="zf-cat-item"
              >
                <div
                  className={`zf-cat-icon ${
                    i % 2 === 0 ? "pink" : "purple"
                  }`}
                >
                  {(c.name?.[0] || "?").toUpperCase()}
                </div>
                <span className="zf-cat-label">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* VOUCHERS */}
      <div className="zf-section">
        <div className="zf-section-title">
          Voucher <span>Spesial</span>
        </div>
        <div className="zf-vouchers">
          {VOUCHERS.map((v) => (
            <div key={v.id} className={`zf-voucher zf-voucher-${v.color}`}>
              <div className="zf-voucher-icon">{v.icon}</div>
              <div className="zf-voucher-text">
                <p>{v.title}</p>
                <span>{v.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="zf-section">
        <div className="zf-section-header">
          <div className="zf-section-title">
            <span className="zf-flash-pill">FLASH SALE</span>
            {search
              ? `Hasil "${search}"`
              : activeCatName
                ? `Kategori: ${activeCatName}`
                : "Produk Terlaris"}
          </div>
          {user?.role === "seller" && (
            <Link to="/products/create" className="zf-add-btn">
              + Tambah Produk
            </Link>
          )}
        </div>

        <div className="zf-section-sub">
          Menampilkan {filtered.length} produk · Halaman {currentPage} dari{" "}
          {totalPages || 1}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {paginated.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ marginBottom: 16, fontSize: 16 }}>
              {search
                ? `Tidak ada produk yang cocok dengan "${search}"`
                : activeCatName
                  ? `Belum ada produk di kategori ${activeCatName}.`
                  : "Belum ada produk di marketplace."}
            </p>
            {user?.role === "seller" && !search && (
              <Link to="/products/create" className="zf-add-btn">
                + Tambah Produk Pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="zf-products">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
