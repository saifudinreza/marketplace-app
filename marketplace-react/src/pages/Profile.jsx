import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="text-center py-[70px] text-muted">Memuat...</div>;

  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-[560px] mx-auto">
      <div className="bg-white rounded-[10px] p-9 shadow-[0_2px_24px_rgba(28,28,28,0.07)] text-center border border-line">
        <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-[28px] font-extrabold mx-auto mb-[18px]">
          {initials}
        </div>
        <h2 className="mb-1 text-[22px] font-extrabold tracking-[-0.3px]">{user.name || "Pengguna"}</h2>
        <p className="text-muted mb-[26px] text-sm">{user.email}</p>

        <div className="text-left border-t border-line pt-[22px]">
          {[
            { label: "User ID", value: user.id || "-" },
            { label: "Nama Lengkap", value: user.name || "-" },
            { label: "Email", value: user.email || "-" },
            ...(user.created_at ? [{
              label: "Bergabung",
              value: new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            }] : []),
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex justify-between py-[11px] text-sm ${i < arr.length - 1 ? "border-b border-line" : ""}`}
            >
              <span className="text-muted font-medium">{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
