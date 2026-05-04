import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useScaleIn, useFadeUp } from "../hooks/useAnime.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="text-center py-[70px] text-muted">Memuat detail produk...</div>;
  if (error) return <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">{error}</div>;
  if (!product) return null;

  const imageUrl =
    product.file_url ||
    product.image ||
    product.image_url ||
    `https://picsum.photos/seed/${product.id}/800/500`;

  return (
    <div className="max-w-[900px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-[18px] inline-block px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary"
      >
        ← Kembali
      </button>

      {/* detail-card class kept for anime.js */}
      <div className="detail-card bg-white rounded-[10px] overflow-hidden shadow-[0_2px_24px_rgba(28,28,28,0.07)] border border-line" ref={cardRef}>
        <img src={imageUrl} alt={product.name} className="w-full h-[420px] object-cover bg-cream transition-transform duration-[400ms]" />

        {/* detail-body class kept for anime.js */}
        <div className="detail-body p-8" ref={bodyRef}>
          <h1 className="text-[28px] mb-3.5 font-extrabold tracking-[-0.4px] text-primary">{product.name}</h1>

          {product.category?.name && (
            <span className="inline-block px-3 py-1 bg-cream text-secondary rounded text-[11px] font-bold mb-3.5 tracking-[0.3px] uppercase">
              {product.category.name}
            </span>
          )}

          <p className="text-[30px] font-extrabold text-primary mb-[22px] tracking-[-0.5px]">
            Rp {Number(product.price || 0).toLocaleString("id-ID")}
          </p>

          <div className="mb-[22px] pt-[22px] border-t border-line">
            <h3 className="text-[11px] text-muted uppercase tracking-[1px] mb-2 font-bold">Deskripsi</h3>
            <p>{product.description || "Tidak ada deskripsi."}</p>
          </div>

          {product.stock !== undefined && (
            <div className="mb-[22px] pt-[22px] border-t border-line">
              <h3 className="text-[11px] text-muted uppercase tracking-[1px] mb-2 font-bold">Stok</h3>
              <p>{product.stock} unit tersedia</p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-[6px] border-0 text-[13px] font-bold cursor-pointer transition-all duration-200 bg-primary text-white no-underline hover:bg-secondary hover:text-white hover:-translate-y-px hover:no-underline"
            >
              Lihat Produk Lainnya
            </Link>
            {user?.role === "seller" && user?.id === product.user_id && (
              <>
                <button
                  className="inline-block px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                  Edit Produk
                </button>
                <button
                  className="inline-block px-5 py-2.5 rounded-[6px] border border-red-200 text-[13px] font-bold cursor-pointer transition-all duration-200 bg-red-50 text-red-700 hover:bg-red-100"
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
