import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, updateQty, removeFromCart, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-[70px] px-5 bg-white rounded-[10px] shadow-[0_2px_24px_rgba(28,28,28,0.07)] border border-line">
        <div className="text-[56px] mb-4">🛒</div>
        <h2 className="text-xl font-extrabold mb-2 text-primary">Keranjang masih kosong</h2>
        <p className="text-sm text-muted mb-[22px]">Yuk, temukan produk yang kamu suka!</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-[6px] border-0 text-[13px] font-bold cursor-pointer transition-all duration-200 bg-primary text-white no-underline hover:bg-secondary hover:text-white hover:-translate-y-px hover:no-underline"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] px-4 py-5 sm:px-8 sm:py-7 shadow-[0_2px_24px_rgba(28,28,28,0.07)] border border-line">
      {/* Header */}
      <div className="flex justify-between items-center mb-[22px] pb-[18px] border-b border-line">
        <h1 className="text-xl font-extrabold text-primary flex items-center gap-2.5 tracking-[-0.3px]">
          Keranjang Belanja
          <span className="text-xs font-bold text-secondary bg-cream px-2.5 py-[3px] rounded-[20px]">
            {items.length} item
          </span>
        </h1>
        <button
          type="button"
          className="bg-transparent border border-red-200 text-red-700 rounded-[5px] px-3.5 py-[7px] text-xs font-semibold cursor-pointer transition-colors duration-[180ms] hover:bg-red-50"
          onClick={clearCart}
        >
          Kosongkan semua
        </button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 md:gap-[22px] items-start">
        {/* Item list */}
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[60px_1fr] sm:grid-cols-[70px_1fr_auto_auto_auto] gap-3 sm:gap-3.5 items-start sm:items-center p-3 sm:p-4 border border-line rounded-lg transition-[border-color,box-shadow] duration-[180ms] hover:border-secondary hover:shadow-[0_4px_14px_rgba(28,28,28,0.06)]"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[70px] h-[70px] rounded-[6px] object-cover"
                />
              ) : (
                <div className="w-[70px] h-[70px] rounded-[6px] bg-cream flex items-center justify-center text-muted text-[11px] text-center px-1">
                  No Image
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-primary mb-1 leading-[1.35]">{item.name}</div>
                <div className="text-xs text-muted">Rp {Number(item.price).toLocaleString("id-ID")} / item</div>
              </div>
              <div className="flex items-center gap-1.5 bg-page rounded-[6px] px-1.5 py-1 border border-line col-start-2 sm:col-auto">
                <button
                  type="button"
                  className="w-7 h-7 border-0 bg-white rounded cursor-pointer text-base font-bold text-primary transition-colors duration-[120ms] hover:bg-cream"
                  onClick={() => updateQty(item.id, item.qty - 1)}
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm font-bold">{item.qty}</span>
                <button
                  type="button"
                  className="w-7 h-7 border-0 bg-white rounded cursor-pointer text-base font-bold text-primary transition-colors duration-[120ms] hover:bg-cream"
                  onClick={() => updateQty(item.id, item.qty + 1)}
                >
                  +
                </button>
              </div>
              <div className="text-sm font-bold text-primary whitespace-nowrap col-start-2 sm:col-auto">
                Rp {Number(item.price * item.qty).toLocaleString("id-ID")}
              </div>
              <button
                type="button"
                className="w-[30px] h-[30px] border-0 bg-red-50 text-red-700 rounded-full cursor-pointer text-lg leading-none transition-colors duration-[120ms] hover:bg-red-200 col-start-2 sm:col-auto justify-self-start"
                onClick={() => removeFromCart(item.id)}
                aria-label="Hapus item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-line rounded-[10px] p-4 sm:p-[22px] md:sticky md:top-[90px]">
          <div className="text-sm font-extrabold text-primary mb-[18px] tracking-[-0.2px]">Ringkasan Pesanan</div>
          <div className="flex justify-between text-[13px] text-muted mb-2.5">
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} item)</span>
            <span>Rp {Number(total).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-[13px] text-muted mb-2.5">
            <span>Ongkos kirim</span>
            <span className="text-green-700 font-semibold">Gratis</span>
          </div>
          <div className="h-px bg-line my-3.5" />
          <div className="flex justify-between text-base font-extrabold text-primary mb-[18px]">
            <span>Total</span>
            <span>Rp {Number(total).toLocaleString("id-ID")}</span>
          </div>
          <button
            type="button"
            className="w-full bg-primary text-white border-0 rounded-[6px] py-3.5 text-[13px] font-bold cursor-pointer mb-2.5 tracking-[0.5px] transition-[background,transform] duration-200 hover:bg-secondary hover:-translate-y-px"
          >
            Checkout Sekarang
          </button>
          <Link
            to="/"
            className="block text-center text-[13px] text-muted no-underline transition-colors duration-200 hover:text-primary"
          >
            ← Lanjut belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
