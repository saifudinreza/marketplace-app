import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/products");
        const list = res.data?.data ?? res.data ?? [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(
          "Gagal memuat produk. Pastikan API-mu jalan di localhost:8000",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <div className="loading">Memuat produk...</div>;

  return (
    <div>
      <div className="home-header">
        <div>
          <h1>Daftar Produk</h1>
          <p className="home-subtitle">
            Menampilkan {filtered.length} produk · Halaman {currentPage} dari{" "}
            {totalPages || 1}
          </p>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Cari produk..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {paginated.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada produk yang cocok.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {paginated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
