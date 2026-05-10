import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";

const PAYMENT_LABELS = {
  gopay:      "GoPay",
  ovo:        "OVO",
  dana:       "DANA",
  qris:       "QRIS",
  va_bca:     "Virtual Account BCA",
  va_bni:     "Virtual Account BNI",
  va_bri:     "Virtual Account BRI",
  va_mandiri: "Transfer Mandiri",
  va_cimb:    "Virtual Account CIMB Niaga",
  va_permata: "Virtual Account Permata",
  va_bsi:     "Virtual Account BSI",
  va_btn:     "Virtual Account BTN",
  va_danamon: "Virtual Account Danamon",
  cod:        "Bayar di Tempat (COD)",
};

function useCountdown(targetDate) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!targetDate) return;
    const calc = () => Math.max(0, Math.floor((new Date(targetDate) - Date.now()) / 1000));
    setSecs(calc());
    const id = setInterval(() => {
      const s = calc();
      setSecs(s);
      if (s === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return { hh, mm, ss, expired: secs === 0 };
}

function TimeBox({ val, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-primary text-white font-extrabold text-[22px] leading-none rounded-[6px] w-14 h-14 flex items-center justify-center tracking-widest">
        {val}
      </span>
      <span className="text-[10px] text-muted mt-1 font-semibold uppercase tracking-[0.5px]">{label}</span>
    </div>
  );
}

export default function OrderPending() {
  const { id } = useParams();
  const location = useLocation();
  const snapLoaded = useRef(false);

  const [order, setOrder] = useState(location.state?.orderData ?? null);
  const [snapToken, setSnapToken] = useState(location.state?.orderData?.snap_token ?? null);
  const [loadingOrder, setLoadingOrder] = useState(!location.state?.orderData);
  const [snapError, setSnapError] = useState("");

  const { hh, mm, ss, expired } = useCountdown(order?.payment_due_at);

  useEffect(() => {
    if (order) return;
    axiosClient.get(`/orders/${id}`)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setOrder(d);
        setSnapToken(d.snap_token ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingOrder(false));
  }, [id]);

  // Load snap.js when snap token is available
  useEffect(() => {
    if (!snapToken || snapLoaded.current) return;
    const existing = document.querySelector('script[src*="snap.js"]');
    if (existing) { snapLoaded.current = true; return; }
    const script = document.createElement("script");
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    script.onload = () => { snapLoaded.current = true; };
    document.body.appendChild(script);
  }, [snapToken]);

  const handlePay = () => {
    if (!snapToken) return;
    if (!window.snap) {
      setSnapError("Halaman pembayaran belum siap, coba refresh.");
      return;
    }
    setSnapError("");
    window.snap.pay(snapToken, {
      onSuccess: () => window.location.reload(),
      onPending: () => {},
      onError:   () => setSnapError("Pembayaran gagal. Coba lagi."),
      onClose:   () => {},
    });
  };

  if (loadingOrder) {
    return <div className="text-center py-20 text-muted">Memuat data pesanan...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">Pesanan tidak ditemukan.</p>
        <Link to="/" className="text-secondary font-bold no-underline hover:underline">← Kembali ke Beranda</Link>
      </div>
    );
  }

  const isCod = order.payment_method === "cod";
  const methodLabel = PAYMENT_LABELS[order.payment_method] || order.payment_method;
  const totalAmount = Number(order.total_amount ?? 0);
  const subtotal    = Number(order.subtotal ?? 0);
  const shipping    = Number(order.shipping_cost ?? 0);
  const insurance   = Number(order.insurance_cost ?? 0);
  const protection  = Number(order.protection_cost ?? 0);

  return (
    <div className="max-w-[560px] mx-auto">
      {/* Status header */}
      <div className={`rounded-[10px] p-6 mb-4 text-center ${isCod ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
        <div className="text-4xl mb-3">{isCod ? "✅" : "⏳"}</div>
        <h1 className="text-[18px] font-extrabold text-primary mb-1">
          {isCod ? "Pesanan Dikonfirmasi!" : "Menunggu Pembayaran"}
        </h1>
        <p className="text-[12px] text-muted">
          No. Pesanan: <span className="font-bold text-primary">{order.order_number}</span>
        </p>
      </div>

      {/* Countdown */}
      {!isCod && (
        <div className="bg-white rounded-[10px] shadow-[0_2px_16px_rgba(28,28,28,0.07)] border border-line p-5 mb-4 text-center">
          <p className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-3">
            {expired ? "Batas pembayaran sudah lewat" : "Bayar sebelum"}
          </p>
          {!expired && order.payment_due_at && (
            <p className="text-[13px] font-semibold text-primary mb-4">
              {new Date(order.payment_due_at).toLocaleString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          )}
          {!expired ? (
            <div className="flex items-end justify-center gap-2">
              <TimeBox val={hh} label="Jam" />
              <span className="text-2xl font-extrabold text-primary pb-3.5">:</span>
              <TimeBox val={mm} label="Menit" />
              <span className="text-2xl font-extrabold text-primary pb-3.5">:</span>
              <TimeBox val={ss} label="Detik" />
            </div>
          ) : (
            <p className="text-red-600 font-bold text-[14px]">Pesanan telah kedaluwarsa</p>
          )}
        </div>
      )}

      {/* Payment method + pay button */}
      {!isCod && (
        <div className="bg-white rounded-[10px] shadow-[0_2px_16px_rgba(28,28,28,0.07)] border border-line p-5 mb-4">
          <p className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-2">Metode Pembayaran</p>
          <p className="text-[14px] font-bold text-primary mb-4">{methodLabel}</p>

          {snapError && (
            <p className="text-[12px] text-red-600 font-medium mb-3">{snapError}</p>
          )}

          {snapToken && !expired && (
            <button
              type="button"
              onClick={handlePay}
              className="w-full bg-secondary text-white border-0 rounded-[6px] py-3.5 text-[13px] font-bold cursor-pointer tracking-[0.5px] transition-[background,transform] duration-200 hover:bg-primary hover:-translate-y-px"
            >
              Bayar Sekarang
            </button>
          )}
        </div>
      )}

      {/* Total tagihan */}
      <div className="bg-white rounded-[10px] shadow-[0_2px_16px_rgba(28,28,28,0.07)] border border-line p-5 mb-4">
        <p className="text-[11px] font-bold text-muted uppercase tracking-[0.8px] mb-3">Rincian Pembayaran</p>
        <div className="flex flex-col gap-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal Produk</span>
            <span className="font-semibold text-primary">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Ongkos Kirim</span>
            <span className="font-semibold text-primary">Rp {shipping.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Asuransi Pengiriman</span>
            <span className="font-semibold text-primary">Rp {insurance.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Biaya Proteksi</span>
            <span className="font-semibold text-primary">Rp {protection.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="h-px bg-line my-3" />
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-extrabold text-primary">Total Tagihan</span>
          <span className="text-[18px] font-extrabold text-primary">Rp {totalAmount.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <Link
        to="/"
        className="block text-center text-[13px] text-muted no-underline transition-colors duration-200 hover:text-primary mt-2"
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
