import { useState } from 'react';
import {
  ShoppingCart,
  LogOut,
  Plus,
  Edit,
  Trash2,
  X,
  Package,
  User,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const uid = () => Date.now() + Math.random();

// ─── seed data ───────────────────────────────────────────────────────────────

const SEED_PRODUCTS = [
  {
    id: 1,
    name: 'Mechanical Keyboard Pro',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop',
    description:
      'Keyboard mekanikal premium dengan switch Cherry MX Red, RGB backlight, dan build quality aluminium yang kokoh untuk gaming & produktivitas.',
  },
  {
    id: 2,
    name: 'Wireless Ergonomic Mouse',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop',
    description:
      'Mouse wireless ergonomis dengan sensor presisi tinggi dan baterai tahan lama hingga 3 bulan pemakaian normal.',
  },
  {
    id: 3,
    name: '4K IPS Monitor 34"',
    price: 5800000,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a573d5caad?w=600&h=400&fit=crop',
    description:
      'Monitor UltraWide 4K dengan panel IPS, refresh rate 144 Hz. Ideal untuk multitasking, desain grafis, dan gaming kompetitif.',
  },
  {
    id: 4,
    name: 'USB-C Hub 7-in-1',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    description:
      'Hub USB-C multifungsi: HDMI 4K, 3× USB 3.0, SD/microSD reader, PD charging 100 W. Plug-and-play tanpa driver.',
  },
];

// ─── empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', price: '', image: '', description: '' };

// ─── Toast component ─────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  const isSuccess = type === 'success';
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium animate-bounce
        ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
    >
      {isSuccess ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Modal component ──────────────────────────────────────────────────────────

function ProductModal({ editing, form, onChange, onSave, onClose }) {
  const valid = form.name.trim() && form.price;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body */}
        <div className="p-6 space-y-4">
          {[
            { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Wireless Headphones' },
            { label: 'Price (IDR) *', key: 'price', type: 'number', placeholder: 'e.g. 500000' },
            { label: 'Image URL', key: 'image', type: 'url', placeholder: 'https://example.com/image.jpg' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              placeholder="Describe the product..."
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
            />
          </div>
        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!valid}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-violet-200"
          >
            {editing ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth pages ───────────────────────────────────────────────────────────────

function AuthPage({ onLoginAdmin, onLoginUser }) {
  const [tab, setTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl mb-4 shadow-xl shadow-violet-700/40">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">MarketHub</h1>
          <p className="text-slate-400 mt-1 text-sm">Your Premium Marketplace</p>
        </div>

        {/* card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/15 shadow-2xl">
          {/* tabs */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl capitalize transition-all duration-200
                  ${tab === t ? 'bg-white text-slate-900 shadow' : 'text-white/60 hover:text-white'}`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div className="space-y-4">
              {[
                { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={loginForm[key]}
                    onChange={(e) => setLoginForm({ ...loginForm, [key]: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-400 focus:bg-white/15 transition-all text-sm"
                  />
                </div>
              ))}

              {/* divider */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/40 text-xs font-medium">Quick Login (Prototype)</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              <button
                onClick={onLoginAdmin}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 active:scale-95"
              >
                <Shield className="w-4 h-4" />
                Login as Admin
              </button>
              <button
                onClick={onLoginUser}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl border border-white/20 transition-all duration-200 active:scale-95"
              >
                <User className="w-4 h-4" />
                Login as User
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 8 characters' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={regForm[key]}
                    onChange={(e) => setRegForm({ ...regForm, [key]: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-400 focus:bg-white/15 transition-all text-sm"
                  />
                </div>
              ))}
              <button
                onClick={onLoginUser}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 active:scale-95 mt-2"
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">Prototype — no real data is sent anywhere.</p>
      </div>
    </div>
  );
}

// ─── Admin view ───────────────────────────────────────────────────────────────

function AdminView({ products, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Product Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-violet-200 hover:shadow-violet-300 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Product', 'Price', 'Description', 'Actions'].map((h) => (
                <th
                  key={h}
                  className={`text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4
                    ${h === 'Actions' ? 'text-right' : 'text-left'}
                    ${h === 'Description' ? 'hidden lg:table-cell' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                      onError={(e) => { e.target.src = 'https://placehold.co/44x44?text=?'; }}
                    />
                    <span className="font-semibold text-slate-700 text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-violet-600 text-sm">{fmt(p.price)}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell max-w-xs">
                  <p className="text-slate-400 text-sm line-clamp-2">{p.description}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-20 text-slate-300">
            <Package className="w-14 h-14 mx-auto mb-3" />
            <p className="font-medium">No products yet. Add your first one!</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <img
                src={p.image}
                alt={p.name}
                className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-700 text-sm truncate">{p.name}</p>
                <p className="text-violet-600 font-bold text-sm mt-0.5">{fmt(p.price)}</p>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{p.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
              <button
                onClick={() => onEdit(p)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 bg-blue-50 rounded-xl text-xs font-bold transition-all"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => onDelete(p.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-red-500 bg-red-50 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-14 text-slate-300">
            <Package className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">No products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── User catalog view ────────────────────────────────────────────────────────

function UserView({ products, onCart }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">Product Catalog</h1>
        <p className="text-slate-400 text-sm mt-0.5">Discover our premium collection</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
          >
            <div className="relative overflow-hidden h-48 bg-slate-50">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }}
              />
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-yellow-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                <Star className="w-3 h-3 fill-yellow-400" />
                4.9
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{p.name}</h3>
              <p className="text-violet-600 font-black text-lg mb-2">{fmt(p.price)}</p>
              <p className="text-slate-400 text-xs line-clamp-2 flex-1 mb-4">{p.description}</p>
              <button
                onClick={() => onCart(p.name)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 hover:shadow-lg hover:shadow-violet-200 group/btn"
              >
                <ShoppingCart className="w-4 h-4 group-hover/btn:animate-bounce" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-slate-300">
          <Package className="w-14 h-14 mx-auto mb-3" />
          <p className="font-medium">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function AppNavbar({ user, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
              <Package className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight">MarketHub</span>
          </div>

          {/* user info & logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
              {user.role === 'admin' ? (
                <Shield className="w-4 h-4 text-violet-600" />
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-500">
                Logged in as{' '}
                <span className="font-bold text-slate-700 capitalize">{user.role}</span>
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function Prototype() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  // ── toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── auth ──────────────────────────────────────────────────────────────────
  const loginAdmin = () => setUser({ name: 'Admin', role: 'admin' });
  const loginUser = () => setUser({ name: 'John Doe', role: 'user' });
  const logout = () => setUser(null);

  // ── modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({ name: p.name, price: String(p.price), image: p.image, description: p.description });
    setModal(true);
  };

  const closeModal = () => setModal(false);

  const handleFormChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (editTarget) {
      setProducts((ps) =>
        ps.map((p) =>
          p.id === editTarget.id
            ? { ...p, ...form, price: Number(form.price) }
            : p
        )
      );
      showToast('Product updated successfully!');
    } else {
      setProducts((ps) => [...ps, { id: uid(), ...form, price: Number(form.price) }]);
      showToast('Product added successfully!');
    }
    setModal(false);
  };

  const handleDelete = (id) => {
    setProducts((ps) => ps.filter((p) => p.id !== id));
    showToast('Product deleted.', 'error');
  };

  const handleCart = (name) => showToast(`"${name}" added to cart!`);

  // ── render ────────────────────────────────────────────────────────────────
  if (!user) {
    return <AuthPage onLoginAdmin={loginAdmin} onLoginUser={loginUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <AppNavbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'admin' ? (
          <AdminView
            products={products}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ) : (
          <UserView products={products} onCart={handleCart} />
        )}
      </main>

      {modal && (
        <ProductModal
          editing={editTarget}
          form={form}
          onChange={handleFormChange}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
