import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAddress } from "../context/AddressContext.jsx";
import axiosClient from "../api/axiosClient.js";

const SHIPPING_OPTIONS = [
  { id: "jne-reg",  carrier: "JNE",      service: "Reguler",  eta: "2–3 hari kerja",  price: 15000 },
  { id: "jnt-exp",  carrier: "J&T",      service: "Express",  eta: "1–2 hari kerja",  price: 18000 },
  { id: "sicepat",  carrier: "SiCepat",  service: "BEST",     eta: "1–2 hari kerja",  price: 16000 },
  { id: "jne-yes",  carrier: "JNE",      service: "YES",      eta: "Sampai besok",    price: 35000 },
  { id: "anteraja", carrier: "AnterAja", service: "Reguler",  eta: "2–4 hari kerja",  price: 12000 },
];

const PAYMENT_METHODS = [
  {
    group: "Dompet Digital",
    items: [
      { id: "gopay", label: "GoPay",  icon: "💚" },
      { id: "ovo",   label: "OVO",    icon: "💜" },
      { id: "dana",  label: "DANA",   icon: "💙" },
      { id: "qris",  label: "QRIS",   icon: "⬛" },
    ],
  },
  {
    group: "Transfer Virtual Account",
    items: [
      { id: "va_bca",     label: "BCA",          icon: "🔵" },
      { id: "va_bni",     label: "BNI",          icon: "🟠" },
      { id: "va_bri",     label: "BRI",          icon: "🔵" },
      { id: "va_mandiri", label: "Mandiri",       icon: "🟡" },
      { id: "va_cimb",    label: "CIMB Niaga",   icon: "🔴" },
      { id: "va_permata", label: "Permata",       icon: "🟣" },
      { id: "va_bsi",     label: "BSI",           icon: "🟢" },
      { id: "va_btn",     label: "BTN",           icon: "🟠" },
      { id: "va_danamon", label: "Danamon",       icon: "🔴" },
    ],
  },
  {
    group: "Kartu",
    items: [
      { id: "credit_card", label: "Credit Card", icon: "💳" },
    ],
  },
  {
    group: "Lainnya",
    items: [
      { id: "cod", label: "Bayar di Tempat (COD)", icon: "💵" },
    ],
  },
];

function calcInsurance(subtotal) {
  return Math.round(Math.max(500, subtotal * 0.002) / 100) * 100;
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-[10px] shadow-[0_2px_16px_rgba(28,28,28,0.07)] border border-line overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-line flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-[13px] font-extrabold text-primary">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, total: cartSubtotal, clearCart } = useCart();
  const { activeAddress, setModalOpen } = useAddress();

  const buyNow = location.state?.buyNow ?? null;
  const items = buyNow
    ? [{ id: buyNow.product.id, name: buyNow.product.name, price: Number(buyNow.product.price), qty: buyNow.qty, image: buyNow.product.file_url ?? buyNow.product.image_url ?? null }]
    : cartItems;
  const subtotal = buyNow ? Number(buyNow.product.price) * buyNow.qty : cartSubtotal;

  const [selectedShipping, setSelectedShipping] = useState("jnt-exp");
  const [selectedPayment, setSelectedPayment] = useState("gopay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Keranjang kosong.</p>
        <Link to="/" className="text-secondary font-bold no-underline hover:underline">← Belanja dulu</Link>
      </div>
    );
  }

  const shipping = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping);
  const shippingCost = shipping?.price ?? 0;
  const insuranceCost = calcInsurance(subtotal);
  const protectionCost = 2000;
  const totalAmount = subtotal + shippingCost + insuranceCost + protectionCost;

  const handleOrder = async () => {
    if (!activeAddress) {
      setError("Pilih alamat pengiriman terlebih dahulu");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.post("/orders", {
        items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
        shipping_address: activeAddress,
        shipping_carrier: shipping.carrier,
        shipping_service: shipping.service,
        shipping_cost: shippingCost,
        payment_method: selectedPayment,
      });
      if (!buyNow) clearCart();
      navigate(`/orders/${res.data.data.order_id}`, {
        state: { orderData: res.data.data },
      });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message
        || (data?.errors ? Object.values(data.errors)[0]?.[0] : null)
        || `Error ${err.response?.status || ""}: Gagal membuat order.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto">
      <button
        onClick={() => navigate(buyNow ? -1 : "/cart")}
        className="mb-4 inline-block px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary"
      >
        ← {buyNow ? "Kembali" : "Kembali ke Keranjang"}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div>
          {/* ── 1. ALAMAT PENGIRIMAN ── */}
          <SectionCard title="Alamat Pengiriman" icon="📍">
            {activeAddress ? (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {activeAddress.name && (
                    <p className="text-[13px] font-extrabold text-primary mb-0.5">{activeAddress.name}</p>
                  )}
                  <p className="text-[13px] text-primary leading-[1.5]">
                    {activeAddress.address || activeAddress.shortAddress}
                  </p>
                  {activeAddress.city && (
                    <p className="text-[12px] text-muted mt-0.5">
                      {activeAddress.city}{activeAddress.postal ? `, ${activeAddress.postal}` : ""}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-[11px] font-bold text-secondary border border-secondary rounded px-2.5 py-1 cursor-pointer hover:bg-secondary hover:text-white transition-all duration-150 shrink-0 bg-transparent"
                >
                  Ubah
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] text-muted">Belum ada alamat pengiriman</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-[11px] font-bold text-white bg-secondary border-0 rounded px-3 py-1.5 cursor-pointer hover:bg-primary transition-all duration-150"
                >
                  + Tambah Alamat
                </button>
              </div>
            )}
          </SectionCard>

          {/* ── 2. DETAIL PRODUK ── */}
          <SectionCard title="Detail Produk" icon="📦">
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-cream" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-cream flex items-center justify-center text-muted text-[10px] shrink-0">No img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-primary leading-[1.4] line-clamp-2">{item.name}</p>
                    <p className="text-[12px] text-muted mt-0.5">{item.qty} × Rp {Number(item.price).toLocaleString("id-ID")}</p>
                  </div>
                  <p className="text-[13px] font-extrabold text-primary shrink-0">
                    Rp {(item.price * item.qty).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── 3. EKSPEDISI ── */}
          <SectionCard title="Ekspedisi Pengiriman" icon="🚚">
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
                    {selectedShipping === opt.id && <div className="w-2 h-2 rounded-full bg-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-bold text-primary">{opt.carrier}</span>
                    <span className="text-[11px] text-muted ml-2">{opt.service}</span>
                    <p className="text-[11px] text-muted mt-0.5">Estimasi: <span className="font-semibold text-primary">{opt.eta}</span></p>
                  </div>
                  <span className="text-[13px] font-extrabold text-primary shrink-0">
                    Rp {opt.price.toLocaleString("id-ID")}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* ── 4. METODE PEMBAYARAN ── */}
          <SectionCard title="Metode Pembayaran" icon="💳">
            <div className="flex flex-col gap-5">
              {PAYMENT_METHODS.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-[0.8px] mb-2">{group.group}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {group.items.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPayment(pm.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-[8px] border cursor-pointer text-left transition-all duration-150 ${
                          selectedPayment === pm.id
                            ? "border-secondary bg-[#faf6ee] shadow-[0_0_0_2px_rgba(139,111,71,0.15)]"
                            : "border-line bg-white hover:border-secondary hover:bg-cream"
                        }`}
                      >
                        <span className="text-base shrink-0">{pm.icon}</span>
                        <span className="text-[12px] font-bold text-primary leading-tight">{pm.label}</span>
                        {selectedPayment === pm.id && (
                          <svg className="ml-auto w-3.5 h-3.5 text-secondary shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── 5. RINGKASAN BELANJA (sticky) ── */}
        <div className="lg:sticky lg:top-[90px]">
          <div className="bg-white rounded-[10px] shadow-[0_2px_16px_rgba(28,28,28,0.07)] border border-line p-5">
            <p className="text-[13px] font-extrabold text-primary mb-4 pb-3 border-b border-line">Ringkasan Belanja</p>

            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} item)</span>
                <span className="font-semibold text-primary">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ongkos Kirim</span>
                <span className="font-semibold text-primary">Rp {shippingCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Asuransi Pengiriman</span>
                <span className="font-semibold text-primary">Rp {insuranceCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Biaya Proteksi</span>
                <span className="font-semibold text-primary">Rp {protectionCost.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="h-px bg-line my-4" />

            <div className="flex justify-between items-center mb-5">
              <span className="text-[14px] font-extrabold text-primary">Total</span>
              <span className="text-[17px] font-extrabold text-primary">Rp {totalAmount.toLocaleString("id-ID")}</span>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-[6px] mb-3 text-[12px] font-medium bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleOrder}
              disabled={loading}
              className="w-full bg-primary text-white border-0 rounded-[6px] py-3.5 text-[13px] font-bold cursor-pointer tracking-[0.5px] transition-[background,transform] duration-200 hover:bg-secondary hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? "Memproses..." : "Buat Pesanan"}
            </button>

            <p className="text-center text-[11px] text-muted mt-3">
              Dengan memesan, kamu menyetujui syarat & ketentuan ZFlux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
