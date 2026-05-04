import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MyProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchMyProducts(); }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/products");
      const all = res.data?.data ?? res.data ?? [];
      setProducts(all.filter((p) => p.user_id === user?.id));
    } catch {
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    setDeletingId(id);
    try {
      await axiosClient.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Gagal menghapus produk");
    } finally {
      setDeletingId(null);
    }
  };

  if (user?.role !== "seller") return <Navigate to="/" replace />;
  if (loading) return <div className="text-center py-[70px] text-muted">Memuat produk...</div>;

  return (
    <div>
      <div className="flex justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-[-0.3px]">Produk Saya</h1>
          <p className="text-sm text-muted mt-1">{products.length} produk terdaftar</p>
        </div>
        <Link
          to="/products/create"
          className="bg-primary text-white px-[18px] py-2.5 rounded text-[13px] font-bold no-underline whitespace-nowrap transition-all duration-200 hover:bg-secondary hover:text-white hover:-translate-y-px hover:no-underline"
        >
          + Tambah Produk
        </Link>
      </div>

      {error && <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">{error}</div>}

      {products.length === 0 ? (
        <div className="text-center py-[70px] text-muted bg-white rounded-[10px] border border-line">
          <p>Belum ada produk. Klik "Tambah Produk" untuk mulai berjualan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-line overflow-hidden shadow-[0_2px_24px_rgba(28,28,28,0.07)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-page text-left">
                <th className="px-4 py-3 font-semibold text-[13px] text-primary">Nama Produk</th>
                <th className="px-4 py-3 font-semibold text-[13px] text-primary">Kategori</th>
                <th className="px-4 py-3 font-semibold text-[13px] text-primary">Harga</th>
                <th className="px-4 py-3 font-semibold text-[13px] text-primary">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3 text-sm bg-white">{p.name}</td>
                  <td className="px-4 py-3 text-sm bg-white">{p.category?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-sm bg-white">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-sm bg-white">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 text-[13px] rounded border border-line bg-transparent text-primary cursor-pointer transition-all duration-200 hover:bg-page hover:border-secondary hover:text-secondary"
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 text-[13px] rounded border border-red-200 bg-red-50 text-red-700 cursor-pointer transition-colors duration-200 hover:bg-red-100 disabled:opacity-50"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
