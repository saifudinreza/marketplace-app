import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useFadeUp, useSlideIn } from "../hooks/useAnime.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "", price: "", description: "", category_id: "", file_url: "" });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imgError, setImgError] = useState(false);

  const leftRef = useSlideIn("left", [fetching]);
  const rightRef = useSlideIn("right", [fetching]);

  useEffect(() => {
    axiosClient.get("/categories").then((res) => setCategories(res.data?.data ?? res.data ?? []));
    if (isEdit) {
      axiosClient.get(`/products/${id}`)
        .then((res) => {
          const p = res.data?.data ?? res.data;
          setForm({ name: p.name ?? "", price: p.price ?? "", description: p.description ?? "", category_id: p.category_id ?? "", file_url: p.file_url ?? "" });
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
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isEdit) { await axiosClient.put(`/products/${id}`, form); setSuccess("Produk berhasil diperbarui!"); }
      else { await axiosClient.post("/products", form); setSuccess("Produk berhasil ditambahkan!"); }
      setTimeout(() => navigate("/my-products"), 1200);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) setError(errors[Object.keys(errors)[0]][0]);
      else setError(err.response?.data?.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  const previewImg = form.file_url && !imgError ? form.file_url : "";
  const selectedCategory = categories.find((c) => String(c.id) === String(form.category_id));

  if (user?.role !== "seller") return <Navigate to="/" replace />;
  if (fetching) return <div className="text-center py-[70px] text-muted">Memuat data produk...</div>;

  const inputClass = "w-full px-3.5 py-[11px] border border-line rounded-[6px] text-sm bg-page transition-[border-color,box-shadow,background] duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus:bg-white placeholder:text-[#bbb8b3]";
  const labelClass = "block mb-[7px] font-bold text-[13px] text-primary tracking-[0.2px]";

  return (
    <div className="max-w-[1000px] mx-auto">
      <button
        onClick={() => navigate(isEdit ? `/products/${id}` : "/my-products")}
        className="mb-[18px] inline-block px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary"
      >
        ← Kembali
      </button>

      <div className="grid grid-cols-[1fr_1.4fr] gap-[26px] items-start max-[640px]:grid-cols-1">

        {/* Preview */}
        <div className="sticky top-[90px]" ref={leftRef}>
          <div className="bg-white rounded-[10px] shadow-[0_2px_24px_rgba(28,28,28,0.07)] overflow-hidden border border-line">
            <div className="relative w-full h-[200px] bg-cream">
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="Preview produk"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : null}
              {!previewImg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-cream text-muted text-[13px]">
                  <span className="text-[32px]">📷</span>
                  <p>Preview gambar muncul di sini</p>
                </div>
              )}
            </div>
            <div className="p-[18px]">
              <h3 className="text-base font-bold mb-1.5 tracking-[-0.2px]">
                {form.name || <span className="text-line italic">Nama Produk</span>}
              </h3>
              <p className="text-lg font-extrabold text-primary mb-2">
                {form.price ? formatPrice(form.price) : <span className="text-line italic">Rp 0</span>}
              </p>
              {selectedCategory && (
                <span className="text-[10px] text-secondary bg-cream px-2 py-0.5 rounded font-semibold">{selectedCategory.name}</span>
              )}
              <p className="text-[13px] text-muted mt-2.5 leading-[1.5] line-clamp-3">
                {form.description || <span className="text-line italic">Deskripsi produk...</span>}
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-muted mt-2.5">* Preview tampilan produk di marketplace</p>
        </div>

        {/* Form */}
        <div ref={rightRef}>
          <div className="bg-white rounded-[10px] shadow-[0_2px_24px_rgba(28,28,28,0.07)] p-[30px] border border-line">
            <div className="flex items-center gap-3.5 mb-[26px] pb-[22px] border-b border-line">
              <div className="text-[32px] shrink-0">{isEdit ? "✏️" : "📦"}</div>
              <div>
                <h2 className="text-xl font-extrabold tracking-[-0.3px] mb-0.5">{isEdit ? "Edit Produk" : "Tambah Produk Baru"}</h2>
                <p className="text-sm text-muted">{isEdit ? "Perbarui informasi produk Anda" : "Isi detail produk yang ingin dijual"}</p>
              </div>
            </div>

            {error && <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-200">{error}</div>}
            {success && <div className="px-4 py-3 rounded-[6px] mb-4 text-[13px] font-medium bg-green-50 text-green-700 border border-green-200">✅ {success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-[18px]">
                <label htmlFor="name" className={labelClass}>
                  Nama Produk <span className="text-red-600 ml-0.5">*</span>
                </label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required maxLength={255} placeholder="Contoh: Laptop Gaming ASUS ROG" className={inputClass} />
                <span className="block text-xs text-muted mt-[5px]">{form.name.length}/255 karakter</span>
              </div>

              <div className="mb-[18px]">
                <label htmlFor="price" className={labelClass}>
                  Harga <span className="text-red-600 ml-0.5">*</span>
                </label>
                <div className="flex items-center border border-line rounded-[6px] overflow-hidden bg-page focus-within:border-secondary focus-within:shadow-[0_0_0_3px_rgba(139,111,71,0.1)]">
                  <span className="px-3.5 py-[11px] bg-cream text-muted text-sm font-bold border-r border-line whitespace-nowrap">Rp</span>
                  <input
                    id="price" name="price" type="number" min="0"
                    value={form.price} onChange={handleChange} required placeholder="0"
                    className="border-0 outline-none flex-1 px-3.5 py-[11px] text-sm bg-transparent focus:bg-white"
                  />
                </div>
                {form.price && <span className="block text-xs text-muted mt-[5px]">= {formatPrice(form.price)}</span>}
              </div>

              <div className="mb-[18px]">
                <label htmlFor="category_id" className={labelClass}>
                  Kategori <span className="text-red-600 ml-0.5">*</span>
                </label>
                <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange} required className={inputClass}>
                  <option value="" disabled>-- Pilih kategori --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="mb-[18px]">
                <label htmlFor="description" className={labelClass}>Deskripsi</label>
                <textarea
                  id="description" name="description" value={form.description} onChange={handleChange}
                  placeholder="Jelaskan produk Anda secara detail: bahan, ukuran, kondisi, keunggulan, dll."
                  rows={4}
                  className={`${inputClass} resize-y min-h-[100px]`}
                />
                <span className="block text-xs text-muted mt-[5px]">{form.description.length} karakter</span>
              </div>

              <div className="mb-[18px]">
                <label htmlFor="file_url" className={labelClass}>URL Gambar</label>
                <input
                  id="file_url" name="file_url" type="text" value={form.file_url} onChange={handleChange}
                  placeholder="https://contoh.com/gambar.jpg atau data:image/jpeg;base64,..."
                  className={inputClass}
                />
                <span className="block text-xs text-muted mt-[5px]">Kosongkan jika tidak ada gambar · Gunakan link gambar yang valid</span>
              </div>

              <div className="flex gap-2.5 mt-[26px] pt-[22px] border-t border-line">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-[6px] border border-line text-[13px] font-bold cursor-pointer transition-all duration-200 bg-transparent text-primary hover:bg-page hover:border-secondary hover:text-secondary disabled:opacity-45"
                  onClick={() => navigate(isEdit ? `/products/${id}` : "/my-products")}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 rounded-[6px] border-0 text-[13px] font-bold cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-secondary hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : isEdit ? "💾 Simpan Perubahan" : "🚀 Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
