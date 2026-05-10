import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAddress } from "../context/AddressContext.jsx";
import { useScaleIn, useFadeUp } from "../hooks/useAnime.js";

const SHIPPING_OPTIONS = [
  { id: "jne-reg",  carrier: "JNE",     logo: "🟡", service: "Reguler",  eta: "2-3 hari kerja",  price: 15000 },
  { id: "jnt-exp",  carrier: "J&T",     logo: "🔴", service: "Express",  eta: "1-2 hari kerja",  price: 18000 },
  { id: "sicepat",  carrier: "SiCepat", logo: "🟠", service: "BEST",     eta: "1-2 hari kerja",  price: 16000 },
  { id: "jne-yes",  carrier: "JNE",     logo: "🟡", service: "YES",      eta: "Sampai besok",    price: 35000 },
  { id: "anteraja", carrier: "AnterAja",logo: "🔵", service: "Reguler",  eta: "2-4 hari kerja",  price: 12000 },
];

const CATEGORY_ATTRS = {
  "Fashion": {
    colors: [
      { name: "Hitam", hex: "#1c1c1c" },
      { name: "Putih", hex: "#f0ede8" },
      { name: "Abu-abu", hex: "#9e9e9e" },
      { name: "Navy", hex: "#1a3a5c" },
      { name: "Merah", hex: "#c0392b" },
      { name: "Biru", hex: "#2980b9" },
      { name: "Hijau", hex: "#27ae60" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    sizeLabel: "Ukuran Pakaian",
  },
  "Olahraga": {
    colors: [
      { name: "Hitam", hex: "#1c1c1c" },
      { name: "Putih", hex: "#f0ede8" },
      { name: "Abu-abu", hex: "#9e9e9e" },
      { name: "Navy", hex: "#1a3a5c" },
      { name: "Merah", hex: "#c0392b" },
      { name: "Kuning", hex: "#f1c40f" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizeLabel: "Ukuran",
  },
  "Elektronik": {
    warranties: ["Garansi Resmi 1 Tahun", "Garansi Toko 3 Bulan", "Non-Garansi"],
    conditions: ["Baru", "Bekas - Seperti Baru", "Bekas - Normal"],
  },
  "Peralatan Rumah": {
    colors: [
      { name: "Hitam", hex: "#1c1c1c" },
      { name: "Putih", hex: "#f0ede8" },
      { name: "Cokelat", hex: "#8b6b4a" },
      { name: "Krem", hex: "#e8dcc8" },
      { name: "Silver", hex: "#c0c0c0" },
    ],
  },
  "Makanan & Minuman": {
    variants: ["250g", "500g", "1kg", "2kg"],
    variantLabel: "Berat / Ukuran",
  },
  "Kecantikan & Kesehatan": {
    colors: [
      { name: "Natural", hex: "#d4a574" },
      { name: "Light", hex: "#f5e0c3" },
      { name: "Medium", hex: "#c8956c" },
      { name: "Dark", hex: "#8b5a2b" },
    ],
    sizes: ["30ml", "50ml", "100ml", "200ml"],
    sizeLabel: "Volume",
  },
  "Otomotif": {
    conditions: ["Baru", "Bekas - Seperti Baru", "Bekas - Normal"],
    variants: ["Unit", "Pasang (2 pcs)", "Set (4 pcs)"],
    variantLabel: "Jumlah",
  },
  "Buku & Pendidikan": {},
};

const TABS = ["Detail", "Ulasan", "Rekomendasi"];

const MOCK_REVIEWS = [
  { id: 1, name: "Budi S.", rating: 5, date: "2 hari lalu", text: "Produk bagus, sesuai deskripsi. Pengiriman cepat!", avatar: "B" },
  { id: 2, name: "Ani R.", rating: 4, date: "1 minggu lalu", text: "Kualitas oke, harga terjangkau. Recommended seller!", avatar: "A" },
  { id: 3, name: "Citra M.", rating: 5, date: "2 minggu lalu", text: "Puas banget, barang persis seperti foto. 5 bintang!", avatar: "C" },
];

function Stars({ rating, size = "sm" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${cls} ${i < rating ? "fill-[#f5a623]" : "fill-gray-200"}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { activeAddress, setModalOpen } = useAddress();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("Detail");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState("jnt-exp");
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const cardRef = useScaleIn([loading, product?.id]);
  const bodyRef = useFadeUp([loading, product?.id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/products/${id}`);
        setProduct(res.data?.data ?? res.data);
      } catch {
        setError("Produk tidak ditemukan atau API bermasalah");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedVariant(null);
    setSelectedCondition(null);
    setSelectedWarranty(null);
  }, [product?.id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="text-center py-[70px] text-muted">Memuat detail produk...</div>;
  if (error) return <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">{error}</div>;
  if (!product) return null;

  const imageUrl = product.file_url || product.image || product.image_url;
  const catName = product.category?.name ?? "";
  const attrs = CATEGORY_ATTRS[catName] ?? {};
  const avgRating = 4.7;
  const soldCount = 254;

  const AttrLabel = ({ children, selected }) => (
    <p className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-2">
      {children}{selected ? <span className="ml-1.5 text-primary normal-case tracking-normal font-semibold">: {selected}</span> : ""}
    </p>
  );

  const sizeBtn = (val, active, onClick) => (
    <button
      key={val}
      type="button"
      onClick={onClick}
      className={`h-[34px] min-w-[40px] px-3 rounded-[6px] text-[12px] font-bold border cursor-pointer transition-all duration-150 ${
        active
          ? "bg-primary text-white border-primary shadow-[0_2px_8px_rgba(28,28,28,0.18)]"
          : "bg-transparent text-primary border-line hover:border-secondary hover:text-secondary"
      }`}
    >
      {val}
    </button>
  );

  return (
    <div className="max-w-[960px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-[18px] inline-block px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary"
      >
        ← Kembali
      </button>

      {/* Product card - 2 column layout */}
      <div
        className="detail-card bg-white rounded-[10px] overflow-hidden shadow-[0_2px_24px_rgba(28,28,28,0.07)] border border-line mb-4"
        ref={cardRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-[420px_1fr]">

          {/* Left: Image */}
          <div className="md:border-r border-line">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-55 sm:h-80 md:h-95 object-contain bg-cream p-5"
              />
            ) : (
              <div className="w-full h-55 sm:h-80 md:h-95 bg-cream flex items-center justify-center text-muted text-sm font-semibold flex-col gap-2">
                <span className="text-4xl">📷</span>
                Gambar tidak tersedia
              </div>
            )}
          </div>

          {/* Right: Info + attributes */}
          <div className="detail-body p-6" ref={bodyRef}>

            {catName && (
              <span className="inline-block px-2.5 py-0.5 bg-cream text-secondary rounded text-[10px] font-bold mb-2 tracking-[0.3px] uppercase">
                {catName}
              </span>
            )}

            <h1 className="text-[20px] font-extrabold tracking-[-0.3px] text-primary leading-[1.3] mb-2">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2.5 mb-3">
              <Stars rating={Math.round(avgRating)} />
              <span className="text-[12px] text-secondary font-bold">{avgRating}</span>
              <span className="text-[11px] text-muted">({MOCK_REVIEWS.length} ulasan)</span>
              <span className="text-[11px] text-muted">· {soldCount} terjual</span>
            </div>

            {/* Price */}
            <p className="text-[26px] font-extrabold text-primary mb-4 tracking-[-0.5px]">
              Rp {Number(product.price || 0).toLocaleString("id-ID")}
            </p>

            {/* ── CATEGORY-SPECIFIC ATTRIBUTES ── */}

            {/* COLOR — Fashion, Olahraga, Peralatan Rumah, Kecantikan */}
            {attrs.colors && (
              <div className="mb-4">
                <AttrLabel selected={selectedColor}>Warna</AttrLabel>
                <div className="flex flex-wrap gap-2">
                  {attrs.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150 border-2 ${
                        selectedColor === c.name
                          ? "border-secondary scale-110 shadow-[0_0_0_3px_rgba(139,111,71,0.25)]"
                          : "border-line hover:border-secondary hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE — Fashion, Olahraga, Kecantikan */}
            {attrs.sizes && (
              <div className="mb-4">
                <AttrLabel selected={selectedSize}>{attrs.sizeLabel || "Ukuran"}</AttrLabel>
                <div className="flex flex-wrap gap-2">
                  {attrs.sizes.map((s) =>
                    sizeBtn(s, selectedSize === s, () => setSelectedSize(selectedSize === s ? null : s))
                  )}
                </div>
              </div>
            )}

            {/* VARIANT — Makanan & Minuman, Otomotif */}
            {attrs.variants && (
              <div className="mb-4">
                <AttrLabel selected={selectedVariant}>{attrs.variantLabel || "Varian"}</AttrLabel>
                <div className="flex flex-wrap gap-2">
                  {attrs.variants.map((v) =>
                    sizeBtn(v, selectedVariant === v, () => setSelectedVariant(selectedVariant === v ? null : v))
                  )}
                </div>
              </div>
            )}

            {/* WARRANTY — Elektronik */}
            {attrs.warranties && (
              <div className="mb-4">
                <AttrLabel selected={selectedWarranty}>Garansi</AttrLabel>
                <div className="flex flex-wrap gap-2">
                  {attrs.warranties.map((w) =>
                    sizeBtn(w, selectedWarranty === w, () => setSelectedWarranty(selectedWarranty === w ? null : w))
                  )}
                </div>
              </div>
            )}

            {/* CONDITION — Elektronik, Otomotif */}
            {attrs.conditions && (
              <div className="mb-4">
                <AttrLabel selected={selectedCondition}>Kondisi</AttrLabel>
                <div className="flex flex-wrap gap-2">
                  {attrs.conditions.map((c) =>
                    sizeBtn(c, selectedCondition === c, () => setSelectedCondition(selectedCondition === c ? null : c))
                  )}
                </div>
              </div>
            )}

            {/* Quantity + cart actions */}
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-2">Jumlah</p>
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <div className="flex items-center border border-line rounded-[6px] overflow-hidden bg-page">
                  <button
                    type="button"
                    className="w-9 h-9 flex items-center justify-center text-base font-bold text-primary bg-transparent border-0 cursor-pointer hover:bg-cream transition-colors duration-150 disabled:opacity-40"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >−</button>
                  <span className="w-9 text-center text-sm font-bold text-primary select-none">{qty}</span>
                  <button
                    type="button"
                    className="w-9 h-9 flex items-center justify-center text-base font-bold text-primary bg-transparent border-0 cursor-pointer hover:bg-cream transition-colors duration-150 disabled:opacity-40"
                    onClick={() => setQty((q) => Math.min(product.stock || 9999, q + 1))}
                    disabled={product.stock !== undefined && qty >= product.stock}
                  >+</button>
                </div>
                {product.stock !== undefined && (
                  <span className={`text-[12px] font-bold ${
                    product.stock === 0
                      ? "text-red-600"
                      : product.stock <= 10
                        ? "text-orange-500"
                        : "text-green-600"
                  }`}>
                    {product.stock === 0 ? "Stok habis" : `Stok: ${product.stock} unit`}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] border-0 text-[13px] font-bold cursor-pointer transition-all duration-200 ${
                    added
                      ? "bg-green-600 text-white scale-[0.98]"
                      : "bg-primary text-white hover:bg-secondary hover:-translate-y-px"
                  }`}
                >
                  {added ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Ditambahkan!
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      Tambah ke Keranjang
                    </>
                  )}
                </button>
                <Link
                  to="/cart"
                  className="px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold no-underline text-primary transition-all duration-200 hover:border-secondary hover:text-secondary"
                >
                  Lihat Keranjang
                </Link>
              </div>
            </div>

            {/* Seller actions */}
            {user?.role === "seller" && user?.id === product.user_id && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-line">
                <button
                  className="px-4 py-2 rounded-[6px] border border-line text-[12px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                  Edit Produk
                </button>
                <button
                  className="px-4 py-2 rounded-[6px] border border-red-200 text-[12px] font-bold cursor-pointer transition-all duration-200 bg-red-50 text-red-700 hover:bg-red-100"
                  onClick={async () => {
                    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
                    try {
                      await axiosClient.delete(`/products/${product.id}`);
                      navigate("/my-products");
                    } catch {
                      alert("Gagal menghapus produk");
                    }
                  }}
                >
                  Hapus Produk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SHIPPING SECTION ── */}
      <div className="bg-white rounded-[10px] shadow-[0_2px_24px_rgba(28,28,28,0.07)] border border-line mb-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-secondary">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span className="text-[13px] font-extrabold text-primary">Pengiriman</span>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Delivery address */}
          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-line">
            <svg viewBox="0 0 24 24" fill="none" stroke="#8b6b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0">
              <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted font-bold uppercase tracking-[0.6px] mb-1">Dikirim ke</p>
              {activeAddress ? (
                <div>
                  <p className="text-[13px] font-bold text-primary leading-[1.4]">
                    {activeAddress.name && <span>{activeAddress.name} · </span>}
                    {activeAddress.address || activeAddress.shortAddress}
                  </p>
                  {activeAddress.city && (
                    <p className="text-[11px] text-muted mt-0.5">{activeAddress.city}{activeAddress.postal ? `, ${activeAddress.postal}` : ""}</p>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-muted">Belum ada alamat pengiriman</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-[11px] font-bold text-secondary bg-transparent border border-secondary rounded px-2.5 py-1 cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 shrink-0"
            >
              {activeAddress ? "Ubah" : "+ Tambah"}
            </button>
          </div>

          {/* Shipping options */}
          {activeAddress ? (
            <div>
              <p className="text-[11px] text-muted font-bold uppercase tracking-[0.6px] mb-3">Pilih Layanan Pengiriman</p>
              <div className="flex flex-col gap-2">
                {SHIPPING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedShipping(opt.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[8px] border cursor-pointer text-left transition-all duration-150 ${
                      selectedShipping === opt.id
                        ? "border-secondary bg-[#faf6ee] shadow-[0_0_0_2px_rgba(139,111,71,0.15)]"
                        : "border-line bg-white hover:border-secondary hover:bg-cream"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedShipping === opt.id ? "border-secondary" : "border-line"}`}>
                      {selectedShipping === opt.id && (
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                      )}
                    </div>
                    <span className="text-base shrink-0">{opt.logo}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-bold text-primary">{opt.carrier}</span>
                      <span className="text-[11px] text-muted ml-2">{opt.service}</span>
                      <p className="text-[11px] text-muted mt-0.5">Estimasi tiba: <span className="font-semibold text-primary">{opt.eta}</span></p>
                    </div>
                    <span className="text-[13px] font-extrabold text-primary shrink-0">
                      Rp {opt.price.toLocaleString("id-ID")}
                    </span>
                  </button>
                ))}
              </div>

              {selectedShipping && (() => {
                const opt = SHIPPING_OPTIONS.find(o => o.id === selectedShipping);
                return opt ? (
                  <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                    <span className="text-[12px] text-muted">Total ongkos kirim</span>
                    <span className="text-[15px] font-extrabold text-primary">
                      Rp {opt.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[13px] text-muted mb-3">Tambahkan alamat untuk melihat estimasi ongkir</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-5 py-2 bg-secondary text-white rounded-[8px] text-[12px] font-bold cursor-pointer border-0 hover:bg-primary transition-colors"
              >
                + Tambah Alamat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-white rounded-[10px] shadow-[0_2px_24px_rgba(28,28,28,0.07)] border border-line overflow-hidden">

        {/* Tab header */}
        <div className="flex border-b border-line">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-[14px] text-[13px] font-bold border-b-2 transition-all duration-150 cursor-pointer bg-transparent ${
                activeTab === tab
                  ? "border-secondary text-secondary"
                  : "border-transparent text-muted hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="p-6">

          {/* ── DETAIL ── */}
          {activeTab === "Detail" && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8">
              <div>
                <h3 className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-3">Deskripsi</h3>
                <p className="text-[14px] text-primary leading-[1.75]">
                  {product.description || "Tidak ada deskripsi."}
                </p>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-3">Spesifikasi</h3>
                <table className="w-full text-[13px] border-collapse">
                  <tbody>
                    {catName && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted w-[130px] align-top">Kategori</td>
                        <td className="py-2.5 font-semibold text-primary">{catName}</td>
                      </tr>
                    )}
                    {product.stock !== undefined && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted align-top">Stok</td>
                        <td className="py-2.5 font-semibold text-primary">{product.stock} unit</td>
                      </tr>
                    )}
                    {/* Fashion / Olahraga */}
                    {attrs.colors && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted align-top">Pilihan Warna</td>
                        <td className="py-2.5 font-semibold text-primary">{attrs.colors.map((c) => c.name).join(", ")}</td>
                      </tr>
                    )}
                    {attrs.sizes && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted align-top">{attrs.sizeLabel || "Ukuran"}</td>
                        <td className="py-2.5 font-semibold text-primary">{attrs.sizes.join(", ")}</td>
                      </tr>
                    )}
                    {/* Elektronik */}
                    {attrs.warranties && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted align-top">Garansi</td>
                        <td className="py-2.5 font-semibold text-primary">{attrs.warranties.join(" / ")}</td>
                      </tr>
                    )}
                    {attrs.conditions && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted align-top">Kondisi</td>
                        <td className="py-2.5 font-semibold text-primary">{selectedCondition || attrs.conditions[0]}</td>
                      </tr>
                    )}
                    {/* Makanan / Otomotif */}
                    {attrs.variants && (
                      <tr className="border-b border-line">
                        <td className="py-2.5 text-muted align-top">{attrs.variantLabel || "Varian"}</td>
                        <td className="py-2.5 font-semibold text-primary">{attrs.variants.join(", ")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ULASAN ── */}
          {activeTab === "Ulasan" && (
            <div>
              {/* Rating summary */}
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-line">
                <div className="text-center shrink-0">
                  <p className="text-[44px] font-extrabold text-primary leading-none mb-1">{avgRating}</p>
                  <Stars rating={5} size="lg" />
                  <p className="text-[11px] text-muted mt-1">{MOCK_REVIEWS.length} ulasan</p>
                </div>
                <div className="flex-1 pt-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = MOCK_REVIEWS.filter((r) => r.rating === star).length;
                    const pct = Math.round((count / MOCK_REVIEWS.length) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-[11px] text-muted w-2 shrink-0">{star}</span>
                        <div className="flex-1 h-1.5 bg-cream rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#f5a623] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted w-3 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="flex flex-col gap-5">
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center text-[13px] font-bold shrink-0">
                      {r.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[13px] font-bold text-primary">{r.name}</span>
                        <Stars rating={r.rating} />
                        <span className="text-[11px] text-muted">{r.date}</span>
                      </div>
                      <p className="text-[13px] text-primary leading-[1.65]">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REKOMENDASI ── */}
          {activeTab === "Rekomendasi" && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🛍️</div>
              <p className="text-[14px] text-muted mb-4">Produk rekomendasi akan segera tersedia.</p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 bg-primary text-white rounded-[6px] text-[13px] font-bold no-underline hover:bg-secondary hover:-translate-y-px transition-all duration-200"
              >
                Lihat Semua Produk
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
