import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSlideIn, useStaggerChildren } from "../hooks/useAnime.js";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const brandRef = useSlideIn("left", []);
  const linksRef = useStaggerChildren("a, button, span", [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" ref={brandRef}>
          🛒 Marketplace
        </Link>
        <div className="navbar-links" ref={linksRef}>
          {isAuthenticated ? (
            <>
              <Link to="/">Home</Link>
              {user?.role === "seller" && (
                <Link to="/my-products">Kelola Produk</Link>
              )}
              <Link to="/profile">Profile</Link>
              <span className="navbar-user">
                Hai, {user?.name || user?.email}
              </span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
