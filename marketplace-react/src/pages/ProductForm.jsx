import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    file_url: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get("/categories").then((res) => {
      setCategories(res.data?.data ?? res.data ?? []);
    });

    if (isEdit) {
      axiosClient
        .get(`/products/${id}`)
        .then((res) => {
          const p = res.data?.data ?? res.data;
          setForm({
            name: p.name ?? "",
            price: p.price ?? "",
            description: p.description ?? "",
            category_id: p.category_id ?? "",
            file_url: p.file_url ?? "",
          });
        })
        .catch(() => setError("Produk tidak ditemukan"))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/products/${id}`, form);
      } else {
        await axiosClient.post("/products", form);
      }
      navigate("/my-products");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        setError(errors[firstKey][0]);
      } else {
        setError(err.response?.data?.message || "Gagal menyimpan produk");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Memuat data produk...</div>;

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <button onClick={() => navigate("/my-products")} className="btn btn-outline btn-back">
        ← Kembali
      </button>

      <div className="auth-card" style={{ maxWidth: "100%" }}>
        <h2>{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>
        <p className="auth-subtitle">
          {isEdit ? "Ubah informasi produk Anda" : "Isi detail produk yang ingin dijual"}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Produk</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nama produk"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Harga (Rp)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              placeholder="Contoh: 50000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id">Kategori</label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              style={selectStyle}
            >
              <option value="" disabled>-- Pilih kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Contoh: Laptop gaming dengan prosesor Intel Core i7, RAM 16GB, SSD 512GB. Cocok untuk bekerja dan bermain game."
              rows={4}
              style={{ ...selectStyle, resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="file_url">URL Gambar (opsional)</label>
            <input
              id="file_url"
              name="file_url"
              type="url"
              value={form.file_url}
              onChange={handleChange}
              placeholder="Contoh: https://picsum.photos/seed/produk1/400/300"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}

const selectStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "inherit",
  background: "white",
};
