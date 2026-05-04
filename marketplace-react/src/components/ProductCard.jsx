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
    <Link
      to={`/products/${product.id}`}
      className="group bg-white border border-line rounded-lg overflow-hidden flex flex-col no-underline text-primary transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-transparent hover:shadow-[0_12px_36px_rgba(28,28,28,0.12)] hover:-translate-y-1 hover:text-primary hover:no-underline"
    >
      <div className="h-40 bg-cream flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-1.5 flex-1">
        <div className="text-[13px] text-primary font-medium leading-[1.4] line-clamp-2">
          {product.name}
        </div>
        <div className="text-sm font-extrabold text-primary tracking-[-0.3px]">
          Rp {Number(product.price || 0).toLocaleString("id-ID")}
        </div>
        {product.category?.name && (
          <span className="text-[10px] text-secondary bg-cream px-2 py-0.5 rounded self-start font-semibold tracking-[0.2px]">
            {product.category.name}
          </span>
        )}
        <button
          type="button"
          className="mt-auto bg-primary text-white border-0 rounded-[5px] py-2.5 text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1.5 tracking-[0.3px] transition-[background,transform] duration-200 hover:bg-secondary hover:-translate-y-px"
          onClick={handleAdd}
          aria-label="Tambah ke keranjang"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
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
