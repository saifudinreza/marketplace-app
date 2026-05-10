import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAddress } from "../context/AddressContext.jsx";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

function MapUpdater({ position, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(position, zoom, { animate: true }); }, [position, zoom, map]);
  return null;
}

function DraggableMarker({ position, onDrag }) {
  const markerRef = useRef(null);
  useMapEvents({ click(e) { onDrag([e.latlng.lat, e.latlng.lng]); } });
  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) { const { lat, lng } = m.getLatLng(); onDrag([lat, lng]); }
        },
      }}
    />
  );
}

function useDebounce(val, delay = 500) {
  const [deb, setDeb] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setDeb(val), delay);
    return () => clearTimeout(t);
  }, [val, delay]);
  return deb;
}

const LABELS = [
  { key: "Rumah",   emoji: "🏠" },
  { key: "Kantor",  emoji: "🏢" },
  { key: "Kos",     emoji: "🛏️" },
  { key: "Lainnya", emoji: "📌" },
];

const DEFAULT_POS = [-6.2088, 106.8456]; // Jakarta

// Extract clean address parts from Nominatim address object
function parseOsmAddress(a = {}, displayName = "") {
  // Street: prefer road, fall back through other path types
  const houseNo  = a.house_number ? `No. ${a.house_number}` : "";
  const roadName = a.road || a.pedestrian || a.footway || a.path ||
                   a.cycleway || a.residential || a.living_street || a.service || "";
  const street   = [roadName, houseNo].filter(Boolean).join(" ");

  // Neighbourhood: most specific sub-area
  const area = a.suburb || a.quarter || a.neighbourhood || a.hamlet ||
               a.village || a.locality || a.town_district || "";

  // City / Regency
  const city = a.city || a.municipality || a.town || a.regency ||
               a.county || a.district || a.city_district || "";

  // Province
  const province = a.state || a.province || "";

  // Postal code (from OSM data)
  const postal = a.postcode || "";

  // Full street+area as the "address line"
  const addressLine = [street, area].filter(Boolean).join(", ")
    || displayName.split(",").slice(0, 2).join(",").trim()
    || "";

  const cityLine = [city, province].filter(Boolean).join(", ");

  return { addressLine, cityLine, postal };
}

export default function AddressModal() {
  const { modalOpen, setModalOpen, saveAddress } = useAddress();

  const [step, setStep]               = useState(1);
  const [searchQ, setSearchQ]         = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [position, setPosition]       = useState(DEFAULT_POS);
  const [mapZoom, setMapZoom]         = useState(15);
  const [geoAddress, setGeoAddress]   = useState("");
  const [geoCity, setGeoCity]         = useState("");
  const [geoPostal, setGeoPostal]     = useState("");
  const [geoRaw, setGeoRaw]           = useState("");   // full display_name reference
  const [geoLoading, setGeoLoading]   = useState(false);
  const [locating, setLocating]       = useState(false);
  const [form, setForm]               = useState({
    label: "Rumah", name: "", phone: "", address: "", city: "", postal: "", notes: "",
  });

  const debouncedQ = useDebounce(searchQ);

  useEffect(() => {
    if (modalOpen) {
      setStep(1); setSearchQ(""); setSuggestions([]);
      setGeoAddress(""); setGeoCity(""); setGeoPostal(""); setGeoRaw("");
    }
  }, [modalOpen]);

  // Nominatim search — Indonesia-biased, with address details
  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 3) { setSuggestions([]); return; }
    setSearchLoading(true);
    const params = new URLSearchParams({
      format: "json",
      q: debouncedQ,
      countrycodes: "id",
      limit: "7",
      addressdetails: "1",
      namedetails: "1",
      "accept-language": "id",
    });
    fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "Accept-Language": "id" },
    })
      .then((r) => r.json())
      .then((d) => setSuggestions(Array.isArray(d) ? d : []))
      .catch(() => setSuggestions([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedQ]);

  // Reverse geocode with zoom=18 (building level) for maximum accuracy
  const reverseGeocode = useCallback(async ([lat, lon]) => {
    setGeoLoading(true);
    try {
      const params = new URLSearchParams({
        format: "json",
        lat: String(lat),
        lon: String(lon),
        zoom: "18",         // building-level detail
        addressdetails: "1",
        "accept-language": "id",
      });
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: { "Accept-Language": "id" },
      });
      const d = await r.json();
      if (d.error) return;

      const { addressLine, cityLine, postal } = parseOsmAddress(d.address, d.display_name);
      setGeoAddress(addressLine);
      setGeoCity(cityLine);
      if (postal) setGeoPostal(postal);
      setGeoRaw(d.display_name || "");
    } catch { /* silent */ } finally {
      setGeoLoading(false);
    }
  }, []);

  // Format suggestion label from address object
  const formatSuggestion = (s) => {
    const a = s.address || {};
    const name = s.namedetails?.name || s.name || "";
    const road = a.road || a.pedestrian || a.footway || "";
    const area = a.suburb || a.neighbourhood || a.village || a.quarter || "";
    const city = a.city || a.municipality || a.town || a.regency || a.county || "";
    const state = a.state || "";

    // Main line: name or road + area
    const mainParts = [name || road, area].filter(Boolean);
    const main = mainParts.join(", ") || (s.display_name || "").split(", ").slice(0, 2).join(", ");

    // Sub line: city + state
    const sub = [city, state].filter(Boolean).join(", ");

    // Type label
    const typeMap = {
      amenity: "Tempat", building: "Gedung", highway: "Jalan",
      residential: "Perumahan", suburb: "Kecamatan", city: "Kota",
      administrative: "Wilayah", shop: "Toko", leisure: "Fasilitas",
    };
    const typeLabel = typeMap[s.class] || typeMap[s.type] || s.type || "";

    return { main, sub, typeLabel };
  };

  const handleSelectSuggestion = (s) => {
    const pos = [parseFloat(s.lat), parseFloat(s.lon)];
    setPosition(pos);
    setMapZoom(17);
    reverseGeocode(pos);
    setStep(2);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = [coords.latitude, coords.longitude];
        setPosition(pos);
        setMapZoom(17);
        reverseGeocode(pos);
        setLocating(false);
        setStep(2);
      },
      () => setLocating(false),
      { timeout: 12000, enableHighAccuracy: true },
    );
  };

  const handlePositionChange = (pos) => {
    setPosition(pos);
    reverseGeocode(pos);
  };

  const goStep3 = () => {
    setForm((f) => ({
      ...f,
      address: geoAddress || f.address,
      city:    geoCity    || f.city,
      postal:  geoPostal  || f.postal,
    }));
    setStep(3);
  };

  const handleSave = () => {
    saveAddress({
      label:        form.label,
      name:         form.name,
      phone:        form.phone,
      address:      form.address,
      city:         form.city,
      postal:       form.postal,
      notes:        form.notes,
      lat:          position[0],
      lng:          position[1],
      shortAddress: [form.address, form.city].filter(Boolean).join(", "),
    });
    setModalOpen(false);
  };

  if (!modalOpen) return null;

  const inp = "w-full px-3.5 py-[11px] border border-line rounded-[8px] text-[13px] bg-page transition-[border,box-shadow] duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus:bg-white placeholder:text-[#bbb8b3]";
  const lbl = "block text-[10px] font-bold text-muted uppercase tracking-[0.8px] mb-1.5";

  const PinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const GpsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
    </svg>
  );

  const STEP_TITLES = ["", "Cari Lokasi Pengirimanmu", "Tentukan Pinpoint Lokasi", "Lengkapi Detail Alamat"];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setModalOpen(false)} />

      <div className="relative bg-white rounded-[18px] shadow-[0_28px_70px_rgba(0,0,0,0.22)] w-full max-w-[460px] overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-line flex items-start gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-0.5 w-8 h-8 rounded-full bg-cream flex items-center justify-center cursor-pointer border-0 hover:bg-[#ede9e3] transition-colors shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.8px] mb-0.5">Langkah {step} dari 3</p>
            <h2 className="text-[17px] font-extrabold text-primary tracking-[-0.3px] leading-[1.25]">{STEP_TITLES[step]}</h2>
          </div>
          <button type="button" onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center cursor-pointer border-0 hover:bg-[#ede9e3] transition-colors shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex gap-1.5 px-5 py-2.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-secondary" : "bg-line"}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 1: Search ── */}
          {step === 1 && (
            <div className="px-5 pb-5 pt-2">
              <div className="relative mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] pointer-events-none">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Cari nama jalan, gedung, kecamatan, kota..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  autoFocus
                  className="w-full pl-[38px] pr-10 py-3 border border-line rounded-[10px] text-[13px] bg-page focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(139,111,71,0.1)] focus:bg-white placeholder:text-[#bbb8b3]"
                />
                {searchLoading && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-[10px] border-[1.5px] border-secondary text-secondary text-[13px] font-bold cursor-pointer bg-transparent hover:bg-[#f5f0e8] transition-colors duration-150 disabled:opacity-60 mb-4"
              >
                {locating ? <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" /> : <GpsIcon />}
                {locating ? "Mendeteksi lokasi GPS..." : "Gunakan Lokasi Saat Ini (GPS)"}
              </button>

              {suggestions.length > 0 && (
                <div className="border border-line rounded-[10px] overflow-hidden">
                  {suggestions.map((s, i) => {
                    const { main, sub, typeLabel } = formatSuggestion(s);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-3 flex items-start gap-3 border-b border-line last:border-b-0 bg-white hover:bg-cream transition-colors cursor-pointer"
                      >
                        <span className="text-secondary mt-0.5 shrink-0"><PinIcon /></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-primary leading-[1.35] line-clamp-1">{main}</p>
                          {sub && <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{sub}</p>}
                          {typeLabel && <span className="inline-block mt-1 text-[10px] text-secondary bg-cream px-1.5 py-0.5 rounded font-semibold">{typeLabel}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {searchQ.length >= 3 && !searchLoading && suggestions.length === 0 && (
                <div className="text-center py-8 text-muted">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-[13px]">Lokasi tidak ditemukan.<br/>Coba kata kunci yang lebih spesifik.</p>
                </div>
              )}

              {searchQ.length > 0 && searchQ.length < 3 && (
                <p className="text-[12px] text-muted text-center">Ketik minimal 3 karakter untuk mencari...</p>
              )}
            </div>
          )}

          {/* ── STEP 2: Map ── */}
          {step === 2 && (
            <div>
              <div style={{ height: "290px" }} className="relative">
                <MapContainer
                  center={position}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                    maxZoom={19}
                  />
                  <DraggableMarker position={position} onDrag={handlePositionChange} />
                  <MapUpdater position={position} zoom={mapZoom} />
                </MapContainer>
              </div>

              <div className="px-5 pb-5 pt-4">
                {/* Detected address chip */}
                <div className="bg-cream rounded-[10px] p-3.5 flex items-start gap-2.5 mb-2 border border-[#e8dcc8]">
                  <span className="text-secondary mt-0.5 shrink-0"><PinIcon /></span>
                  <div className="flex-1 min-w-0">
                    {geoLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin shrink-0" />
                        <p className="text-[12px] text-muted">Mendeteksi alamat...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[13px] font-bold text-primary line-clamp-2 leading-[1.4]">
                          {geoAddress || "Geser pin untuk mendeteksi alamat"}
                        </p>
                        {geoCity && <p className="text-[11px] text-muted mt-0.5">{geoCity}</p>}
                        {geoPostal && <p className="text-[11px] text-secondary font-semibold mt-0.5">Kode Pos: {geoPostal}</p>}
                      </>
                    )}
                  </div>
                </div>

                {/* Full raw address for reference */}
                {geoRaw && !geoLoading && (
                  <p className="text-[10px] text-muted mb-3 px-1 leading-[1.5] line-clamp-2" title={geoRaw}>
                    📍 {geoRaw}
                  </p>
                )}

                <p className="text-[11px] text-muted text-center mb-3">
                  Geser atau tap peta untuk memperhalus lokasi pinpoint
                </p>

                <button
                  type="button"
                  onClick={goStep3}
                  disabled={geoLoading}
                  className="w-full py-3 bg-primary text-white rounded-[10px] text-[13px] font-bold cursor-pointer border-0 hover:bg-secondary transition-colors disabled:opacity-60"
                >
                  Konfirmasi Lokasi Ini →
                </button>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locating}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-line rounded-[10px] text-[12px] font-semibold text-muted cursor-pointer bg-transparent hover:bg-cream transition-colors disabled:opacity-60"
                >
                  <GpsIcon />
                  Gunakan Lokasi Saat Ini
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Form Detail ── */}
          {step === 3 && (
            <div className="px-5 pb-3 pt-2 flex flex-col gap-4">
              <div>
                <label className={lbl}>Label Alamat</label>
                <div className="flex flex-wrap gap-2">
                  {LABELS.map(({ key, emoji }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, label: key }))}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border cursor-pointer transition-all duration-150 ${
                        form.label === key
                          ? "bg-primary text-white border-primary"
                          : "bg-transparent text-muted border-line hover:border-secondary hover:text-secondary"
                      }`}
                    >
                      {emoji} {key}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={lbl}>Nama Penerima <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nama lengkap penerima" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inp} />
              </div>

              <div>
                <label className={lbl}>No. Telepon <span className="text-red-500">*</span></label>
                <input type="tel" placeholder="Contoh: 08123456789" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inp} />
              </div>

              <div>
                <label className={lbl}>
                  Alamat Lengkap <span className="text-red-500">*</span>
                  <span className="ml-1 text-[9px] text-muted normal-case font-normal tracking-normal">(dari peta · bisa diedit)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className={`${inp} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Kota / Kecamatan</label>
                  <input type="text" placeholder="Kota" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>
                    Kode Pos
                    {geoPostal && <span className="ml-1 text-secondary">✓ terdeteksi</span>}
                  </label>
                  <input type="text" placeholder="12345" maxLength={5} value={form.postal} onChange={(e) => setForm((f) => ({ ...f, postal: e.target.value }))} className={inp} />
                </div>
              </div>

              <div>
                <label className={lbl}>
                  Catatan untuk Kurir{" "}
                  <span className="text-[#bbb] normal-case font-normal tracking-normal">(opsional)</span>
                </label>
                <input type="text" placeholder="Contoh: Pagar biru, rumah pojok" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inp} />
              </div>
            </div>
          )}
        </div>

        {/* Footer — step 3 */}
        {step === 3 && (
          <div className="px-5 py-4 border-t border-line bg-white">
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.name.trim() || !form.phone.trim() || !form.address.trim()}
              className="w-full py-3 bg-primary text-white rounded-[10px] text-[13px] font-bold cursor-pointer border-0 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Simpan Alamat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
