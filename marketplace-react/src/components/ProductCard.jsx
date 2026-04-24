import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const imageUrl =
    product.image ||
    product.image_url ||
    `https://picsum.photos/seed/${product.id}/400/300`;

  return (
    <div className="product-card">
      <img src={imageUrl} alt={product.name} className="product-card-img" />
      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-price">
          Rp {Number(product.price || 0).toLocaleString("id-ID")}
        </p>
        {product.category?.name && (
          <span className="product-card-category">{product.category.name}</span>
        )}
        <Link
          to={`/products/${product.id}`}
          className="btn btn-primary btn-block"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
