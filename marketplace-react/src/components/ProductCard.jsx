import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const imageUrl = product.file_url || product.image || product.image_url;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white border border-line rounded-lg overflow-hidden flex flex-col no-underline text-primary transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-transparent hover:shadow-[0_12px_36px_rgba(28,28,28,0.12)] hover:-translate-y-1 hover:text-primary hover:no-underline"
    >
      <div className="h-40 bg-cream flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs font-semibold">
            No Image
          </div>
        )}
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
        {product.stock !== undefined && product.stock !== null && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded self-start ${
            product.stock === 0
              ? "bg-red-50 text-red-600"
              : product.stock <= 10
                ? "bg-orange-50 text-orange-500"
                : "bg-green-50 text-green-700"
          }`}>
            {product.stock === 0 ? "Habis" : `Stok: ${product.stock}`}
          </span>
        )}
      </div>
    </Link>
  );
}
