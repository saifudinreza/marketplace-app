import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, updateQty, removeFromCart, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="zf-cart-empty">
        <div className="zf-cart-empty-icon">🛒</div>
        <h2>Keranjang masih kosong</h2>
        <p>Yuk, temukan produk yang kamu suka!</p>
        <Link to="/" className="btn btn-primary">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="zf-cart">
      <div className="zf-cart-header">
        <h1 className="zf-cart-title">
          Keranjang Belanja
          <span className="zf-cart-count">{items.length} item</span>
        </h1>
        <button
          type="button"
          className="zf-cart-clear"
          onClick={clearCart}
        >
          Kosongkan semua
        </button>
      </div>

      <div className="zf-cart-body">
        <div className="zf-cart-list">
          {items.map((item) => (
            <div key={item.id} className="zf-cart-item">
              <img
                src={
                  item.image ||
                  `https://picsum.photos/seed/${item.id}/120/120`
                }
                alt={item.name}
                className="zf-cart-item-img"
              />
              <div className="zf-cart-item-info">
                <div className="zf-cart-item-name">{item.name}</div>
                <div className="zf-cart-item-price">
                  Rp {Number(item.price).toLocaleString("id-ID")} / item
                </div>
              </div>
              <div className="zf-cart-item-qty">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, item.qty - 1)}
                >
                  −
                </button>
                <span>{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, item.qty + 1)}
                >
                  +
                </button>
              </div>
              <div className="zf-cart-item-subtotal">
                Rp {Number(item.price * item.qty).toLocaleString("id-ID")}
              </div>
              <button
                type="button"
                className="zf-cart-item-remove"
                onClick={() => removeFromCart(item.id)}
                aria-label="Hapus item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="zf-cart-summary">
          <div className="zf-cart-summary-title">Ringkasan Pesanan</div>
          <div className="zf-cart-summary-row">
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} item)</span>
            <span>Rp {Number(total).toLocaleString("id-ID")}</span>
          </div>
          <div className="zf-cart-summary-row">
            <span>Ongkos kirim</span>
            <span className="zf-cart-free">Gratis</span>
          </div>
          <div className="zf-cart-summary-divider" />
          <div className="zf-cart-summary-total">
            <span>Total</span>
            <span>Rp {Number(total).toLocaleString("id-ID")}</span>
          </div>
          <button type="button" className="zf-checkout-btn">
            Checkout Sekarang
          </button>
          <Link to="/" className="zf-cart-continue">
            ← Lanjut belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
