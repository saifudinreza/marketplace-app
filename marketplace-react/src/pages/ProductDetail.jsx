import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/products/${id}`);
        const data = res.data?.data ?? res.data;
        setProduct(data);
      } catch (err) {
        setError("Produk tidak ditemukan atau API bermasalah");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading">Memuat detail produk...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!product) return null;

  const imageUrl =
    product.image ||
    product.image_url ||
    `https://picsum.photos/seed/${product.id}/800/500`;

  return (
    <div className="detail-wrapper">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-back">
        ← Kembali
      </button>

      <div className="detail-card">
        <img src={imageUrl} alt={product.name} className="detail-image" />

        <div className="detail-body">
          <h1>{product.name}</h1>

          {product.category?.name && (
            <span className="badge">{product.category.name}</span>
          )}

          <p className="detail-price">
            Rp {Number(product.price || 0).toLocaleString("id-ID")}
          </p>

          <div className="detail-section">
            <h3>Deskripsi</h3>
            <p>{product.description || "Tidak ada deskripsi."}</p>
          </div>

          {product.stock !== undefined && (
            <div className="detail-section">
              <h3>Stok</h3>
              <p>{product.stock} unit tersedia</p>
            </div>
          )}

          <Link to="/" className="btn btn-primary">
            Lihat Produk Lainnya
          </Link>
        </div>
      </div>
    </div>
  );
}
