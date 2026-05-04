import { createContext, useContext, useState, useEffect } from "react";

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("zflux_addresses") || "[]"); }
    catch { return []; }
  });
  const [activeId, setActiveId] = useState(() => {
    return localStorage.getItem("zflux_active_address") || null;
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("zflux_addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (activeId) localStorage.setItem("zflux_active_address", activeId);
    else localStorage.removeItem("zflux_active_address");
  }, [activeId]);

  const activeAddress =
    addresses.find((a) => a.id === activeId) ?? addresses[0] ?? null;

  const saveAddress = (data) => {
    const addr = { ...data, id: data.id || String(Date.now()) };
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a.id === addr.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = addr; return next; }
      return [...prev, addr];
    });
    setActiveId(addr.id);
    return addr;
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (activeId === id)
      setActiveId((prev) => addresses.find((a) => a.id !== id)?.id ?? null);
  };

  return (
    <AddressContext.Provider
      value={{ addresses, activeAddress, activeId, setActiveId, saveAddress, deleteAddress, modalOpen, setModalOpen }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export const useAddress = () => useContext(AddressContext);
