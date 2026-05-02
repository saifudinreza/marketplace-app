import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useFadeUp, useSlideIn } from "../hooks/useAnime.js";
import { useAuth } from "../context/AuthContext.jsx";

const FALLBACK_IMG = "https://picsum.photos/seed/default/400/300";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [success, setSuccess] = useState("");
  const [imgError, setImgError] = useState(false);

  const leftRef = useSlideIn("left", [fetching]);
  const rightRef = useSlideIn("right", [fetching]);

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
    if (e.target.name === "file_url") setImgError(false);
  };

  const formatPrice = (val) => {
    const num = Number(val);
    if (!val || isNaN(num)) return "";
    return "Rp " + num.toLocaleString("id-ID");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/products/${id}`, form);
        setSuccess("Produk berhasil diperbarui!");
      } else {
        await axiosClient.post("/products", form);
        setSuccess("Produk berhasil ditambahkan!");
      }
      setTimeout(() => navigate("/my-products"), 1200);
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

  const previewImg = form.file_url && !imgError ? form.file_url : FALLBACK_IMG;
  const selectedCategory = categories.find((c) => String(c.id) === String(form.category_id));

  if (user?.role !== "seller") return <Navigate to="/" replace />;
  if (fetching) return <div className="loading">Memuat data produk...</div>;

  return (
    <div className="product-form-wrapper">
      <button
        onClick={() => navigate(isEdit ? `/products/${id}` : "/my-products")}
        className="btn btn-outline btn-back"
      >
        ← Kembali
      </button>

      <div className="product-form-layout">
        {/* Kolom Kiri — Preview Gambar */}
        <div className="product-form-preview" ref={leftRef}>
          <div className="preview-card">
            <div className="preview-img-wrapper">
              <img
                src={previewImg}
                alt="Preview produk"
                className="preview-img"
                onError={() => setImgError(true)}
              />
              {!form.file_url && (
                <div className="preview-img-overlay">
                  <span>📷</span>
                  <p>Preview gambar muncul di sini</p>
                </div>
              )}
            </div>

            <div className="preview-info">
              <h3 className="preview-name">
                {form.name || <span className="preview-placeholder">Nama Produk</span>}
              </h3>
              <p className="preview-price">
                {form.price
                  ? formatPrice(form.price)
                  : <span className="preview-placeholder">Rp 0</span>}
              </p>
              {selectedCategory && (
                <span className="product-card-category">{selectedCategory.name}</span>
              )}
              <p className="preview-desc">
                {form.description || <span className="preview-placeholder">Deskripsi produk...</span>}
              </p>
            </div>
          </div>

          <p className="preview-hint">* Preview tampilan produk di marketplace</p>
        </div>

        {/* Kolom Kanan — Form */}
        <div className="product-form-fields" ref={rightRef}>
          <div className="product-form-card">
            <div className="product-form-header">
              <div className="product-form-icon">{isEdit ? "✏️" : "📦"}</div>
              <div>
                <h2>{isEdit ? "Edit Produk" : "Tambah Produk Baru"}</h2>
                <p className="auth-subtitle">
                  {isEdit ? "Perbarui informasi produk Anda" : "Isi detail produk yang ingin dijual"}
                </p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Nama Produk */}
              <div className="form-group">
                <label htmlFor="name">
                  Nama Produk <span className="required-star">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  placeholder="Contoh: Laptop Gaming ASUS ROG"
                />
                <span className="field-hint">{form.name.length}/255 karakter</span>
              </div>

              {/* Harga */}
              <div className="form-group">
                <label htmlFor="price">
                  Harga <span className="required-star">*</span>
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="input-with-prefix"
                  />
                </div>
                {form.price && (
                  <span className="field-hint">
                    = {formatPrice(form.price)}
                  </span>
                )}
              </div>

              {/* Kategori */}
              <div className="form-group">
                <label htmlFor="category_id">
                  Kategori <span className="required-star">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="" disabled>-- Pilih kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div className="form-group">
                <label htmlFor="description">Deskripsi</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Jelaskan produk Anda secara detail: bahan, ukuran, kondisi, keunggulan, dll."
                  rows={4}
                  className="form-textarea"
                />
                <span className="field-hint">{form.description.length} karakter</span>
              </div>

              {/* URL Gambar */}
              <div className="form-group">
                <label htmlFor="file_url">URL Gambar</label>
                <input
                  id="file_url"
                  name="file_url"
                  type="text"
                  value={form.file_url}
                  onChange={handleChange}
                  placeholder="https://contoh.com/gambar.jpg atau data:image/jpeg;base64,..."
                />
                <span className="field-hint">
                  Kosongkan jika tidak ada gambar · Gunakan link gambar yang valid
                </span>
              </div>

              {/* Tombol */}
              <div className="product-form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(isEdit ? `/products/${id}` : "/my-products")}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading
                    ? "Menyimpan..."
                    : isEdit
                    ? "💾 Simpan Perubahan"
                    : "🚀 Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
