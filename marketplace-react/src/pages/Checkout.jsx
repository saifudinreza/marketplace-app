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

const GOPAY_B64 = "data:image/png;base64,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";

const PAYMENT_FALLBACK = {
  gopay: { bg: "#00AED6", text: "GoPay" }, ovo: { bg: "#4C3494", text: "OVO" },
  dana: { bg: "#118EEA", text: "DANA" }, qris: { bg: "#1A1A1A", text: "QRIS" },
  va_bca: { bg: "#006DAE", text: "BCA" }, va_bni: { bg: "#F37B20", text: "BNI" },
  va_bri: { bg: "#003E7E", text: "BRI" }, va_mandiri: { bg: "#002D62", text: "mandiri" },
  va_cimb: { bg: "#D71E28", text: "CIMB" }, va_permata: { bg: "#7B2580", text: "permata" },
  va_bsi: { bg: "#3D7A34", text: "BSI" }, va_btn: { bg: "#003399", text: "BTN" },
  va_danamon: { bg: "#E4002B", text: "Danamon" }, cod: { bg: "#4B5563", text: "COD" },
};

function PaymentLogo({ id }) {
  const src = id === "gopay" ? GOPAY_B64 : `/payment-logos/${id}.png`;
  const fb = PAYMENT_FALLBACK[id];
  return (
    <img
      src={src}
      alt={id}
      className="h-9 w-auto shrink-0 object-contain rounded"
      onError={(e) => {
        if (!fb) return;
        e.target.replaceWith(Object.assign(document.createElement("span"), {
          textContent: fb.text,
          style: `background:${fb.bg};color:#fff;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:900;letter-spacing:0.5px;white-space:nowrap`,
        }));
      }}
    />
  );
}

const PAYMENT_METHODS = [
  {
    group: "Dompet Digital",
    items: [
      { id: "gopay", label: "GoPay" },
      { id: "ovo",   label: "OVO" },
      { id: "dana",  label: "DANA" },
      { id: "qris",  label: "QRIS" },
    ],
  },
  {
    group: "Transfer Virtual Account",
    items: [
      { id: "va_bca",     label: "BCA" },
      { id: "va_bni",     label: "BNI" },
      { id: "va_bri",     label: "BRI" },
      { id: "va_mandiri", label: "Mandiri" },
      { id: "va_cimb",    label: "CIMB Niaga" },
      { id: "va_permata", label: "Permata" },
      { id: "va_bsi",     label: "BSI" },
      { id: "va_btn",     label: "BTN" },
      { id: "va_danamon", label: "Danamon" },
    ],
  },
  {
    group: "Lainnya",
    items: [
      { id: "cod", label: "Bayar di Tempat (COD)" },
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] border cursor-pointer text-left transition-all duration-150 ${
                          selectedPayment === pm.id
                            ? "border-secondary bg-[#faf6ee] shadow-[0_0_0_2px_rgba(139,111,71,0.15)]"
                            : "border-line bg-white hover:border-secondary hover:bg-cream"
                        }`}
                      >
                        <PaymentLogo id={pm.id} />
                        <span className="text-[12px] font-bold text-primary leading-tight flex-1">{pm.label}</span>
                        {selectedPayment === pm.id && (
                          <svg className="w-3.5 h-3.5 text-secondary shrink-0" viewBox="0 0 20 20" fill="currentColor">
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
