import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const imageUrl =
    product.file_url ||
    product.image ||
    product.image_url ||
    `https://picsum.photos/seed/${product.id}/400/300`;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="zf-product-card">
      <div className="zf-product-thumb">
        <img src={imageUrl} alt={product.name} />
      </div>
      <div className="zf-product-info">
        <div className="zf-product-name">{product.name}</div>
        <div className="zf-product-price">
          Rp {Number(product.price || 0).toLocaleString("id-ID")}
        </div>
        {product.category?.name && (
          <span className="zf-product-cat">{product.category.name}</span>
        )}
        <button
          type="button"
          className="zf-product-cart-btn"
          onClick={handleAdd}
          aria-label="Tambah ke keranjang"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="13"
            height="13"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          + Keranjang
        </button>
      </div>
    </Link>
  );
}
