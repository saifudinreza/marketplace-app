import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="loading">Memuat...</div>;

  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-avatar">{initials}</div>
        <h2>{user.name || "Pengguna"}</h2>
        <p className="profile-email">{user.email}</p>

        <div className="profile-info">
          <div className="profile-info-row">
            <span>User ID</span>
            <strong>{user.id || "-"}</strong>
          </div>
          <div className="profile-info-row">
            <span>Nama Lengkap</span>
            <strong>{user.name || "-"}</strong>
          </div>
          <div className="profile-info-row">
            <span>Email</span>
            <strong>{user.email || "-"}</strong>
          </div>
          {user.created_at && (
            <div className="profile-info-row">
              <span>Bergabung</span>
              <strong>
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
