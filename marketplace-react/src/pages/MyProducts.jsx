import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MyProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/products");
      const all = res.data?.data ?? res.data ?? [];
      const mine = all.filter((p) => p.user_id === user?.id);
      setProducts(mine);
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

  if (loading) return <div className="loading">Memuat produk...</div>;

  return (
    <div>
      <div className="home-header">
        <div>
          <h1>Produk Saya</h1>
          <p className="home-subtitle">{products.length} produk terdaftar</p>
        </div>
        <Link to="/products/create" className="btn btn-primary">
          + Tambah Produk
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada produk. Klik "Tambah Produk" untuk mulai berjualan.</p>
        </div>
      ) : (
        <div className="my-products-table">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                <th style={thStyle}>Nama Produk</th>
                <th style={thStyle}>Kategori</th>
                <th style={thStyle}>Harga</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.category?.name ?? "-"}</td>
                  <td style={tdStyle}>
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: "13px" }}
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          background: "var(--danger-bg)",
                          color: "var(--danger)",
                          border: "1px solid #fca5a5",
                        }}
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

const thStyle = { padding: "12px 16px", fontWeight: 600, fontSize: "13px" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", background: "var(--card)" };
