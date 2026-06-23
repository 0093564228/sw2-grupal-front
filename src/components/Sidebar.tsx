import React, { useState } from "react";
import { cn } from "../utils/cn";
import { Icons } from "../constants";
import { ViewType } from "../types";
import { ProfileModal } from "./ProfileModal";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface StoredUser {
  nombre: string;
  email: string;
  rol?: { nombre: string };
}

// Lista maestra de navegación SIN DUPLICADOS
const ALL_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
  { id: "clinical", label: "Clínica", icon: Icons.Clinical },
  { id: "consultation", label: "Mi Consulta", icon: Icons.Clinical },
  { id: "agenda", label: "Agenda", icon: Icons.Agenda },
  { id: "inventory", label: "Inventario", icon: Icons.Inventory },
  { id: "pos", label: "Caja y POS", icon: Icons.POS },
  { id: "consultorios", label: "Consultorios", icon: Icons.MeetingRoom },
  { id: "servicios", label: "Servicios", icon: Icons.FileText },
  { id: "users", label: "Personal y Roles", icon: Icons.User },
  { id: "financial", label: "Finanzas", icon: Icons.Financial },
  { id: "waiting-room", label: "Pantalla Espera", icon: Icons.WaitingRoom },
];

const NAV_POR_ROL: Record<string, string[]> = {
  ADMIN: [
    "dashboard",
    "clinical",
    "agenda",
    "inventory",
    "pos",
    "consultorios",
    "servicios",
    "users",
    "financial",
    "waiting-room",
  ],
  VETERINARIO: ["dashboard", "consultation", "clinical", "agenda"],
  CAJERO: ["dashboard", "pos"],
  RECEPCIONISTA: ["dashboard", "clinical", "agenda", "waiting-room"],
  CLIENTE: ["dashboard", "agenda"],
};

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  const user = getStoredUser();
  const roleName = user?.rol?.nombre ?? "";
  const allowedIds = NAV_POR_ROL[roleName] ?? [];

  // Filtramos y aseguramos que no haya duplicados por ID
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) =>
    allowedIds.includes(item.id),
  );

  // Menú colapsable (solo iconos) — la preferencia se recuerda entre sesiones.
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1",
  );
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return next;
    });

  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo + botón colapsar */}
      <div
        className={cn(
          "flex items-center p-6",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <Icons.Patients size={24} />
        </div>
        {!collapsed && (
          <>
            <div className="flex flex-1 flex-col overflow-hidden">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                VET-ERP
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hospital Veterinario
              </p>
            </div>
            <button
              onClick={toggleCollapsed}
              title="Colapsar menú"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Icons.ChevronRight size={18} className="rotate-180" />
            </button>
          </>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          title="Expandir menú"
          className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <Icons.ChevronRight size={18} />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-3 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <button
            key={`nav-${item.id}`} // Clave única garantizada
            onClick={() => onViewChange(item.id as ViewType)}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center rounded-lg py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
              currentView === item.id
                ? "bg-primary/10 text-primary font-bold"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
            )}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={cn("mt-auto", collapsed ? "p-2" : "p-4")}>
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          title="Mi perfil — cambiar contraseña"
          className={cn(
            "flex w-full items-center rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <div
            title={collapsed ? `${user?.nombre ?? "Usuario"} · ${roleName}` : undefined}
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-slate-900 font-bold text-sm"
          >
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "?"}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.nombre ?? "Usuario"}
              </p>
              <p className="truncate text-[10px] font-black uppercase tracking-widest text-slate-400">
                {roleName || "Personal"}
              </p>
            </div>
          )}
        </button>
      </div>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </aside>
  );
};
