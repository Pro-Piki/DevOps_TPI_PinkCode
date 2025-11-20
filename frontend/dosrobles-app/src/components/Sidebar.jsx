/* src/components/Sidebar.jsx */

import styles from "../styles/Sidebar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, forwardRef, useEffect } from "react";
import API_BASE_URL from "../api/apiConfig.js";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar = forwardRef(({ className, onItemClick }, ref) => {
  const [openMenus, setOpenMenus] = useState({});
  const [menuOpen, setMenuOpen] = useState(true);
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Cargar usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  // const userName = user?.name || "Usuario";
  const userRole = user?.role || "empleado";

  const routes = {
    Inicio: "/home",
    Bandeja: "/bandeja-entrada",
    "Mi Ficha": "/mi-ficha",
    Ausencias: "/licencias",
    "Mi Fichaje": "/fichaje/historial",
    "Mis Documentos": "/nomina/recibos",
    "Solicitudes Licencias": "/solicitudes-licencias",
    Empleados: "/empleados",
    "Control Horario": "/fichaje/empleados",
    Nómina: "/nomina/calculo",
    Usuarios: "/usuarios",
  };

  useEffect(() => {
    const currentName = Object.keys(routes).find(
      (key) => routes[key] === location.pathname
    );
    if (currentName) setActive(currentName);
  }, [location.pathname]);

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleSelect = (name) => {
    setActive(name);
    if (routes[name]) navigate(routes[name]);
    if (onItemClick) onItemClick(name);
  };

  return (
    <aside ref={ref} className={`${styles.sidebar} ${className}`}>
      <button
        className={styles.menuToggle}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <MenuIcon />
      </button>

      {menuOpen && (
        <>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user?.empleado?.imagenPerfil?.data ? (
                <img
                  src={`${API_BASE_URL}/api/empleados/${user.empleado._id}/imagen`}
                  alt="Perfil"
                  style={{ width: "80px", height: "80px" }}
                  className={styles.avatarImg}
                />
              ) : (
                user?.username?.slice(0, 2).toUpperCase()
              )}
            </div>
            <p className={styles.greeting}>
              ¡Hola, {user?.empleado?.nombre || user?.username}!
            </p>
            <p className={styles.role}>({user?.role})</p>
          </div>

          <ul className={styles.menuList}>
            <li
              className={`${styles.menuItem} ${
                active === "Inicio" ? styles.active : ""
              }`}
              onClick={() => handleSelect("Inicio")}
            >
              <HomeIcon className={styles.icon} /> Inicio
            </li>

            <li
              className={`${styles.menuItem} ${
                active === "Bandeja" ? styles.active : ""
              }`}
              onClick={() => handleSelect("Bandeja")}
            >
              <MailOutlineIcon className={styles.icon} /> Bandeja de Entrada
            </li>

            <li className={styles.dropdown}>
              <div
                className={styles.dropdownHeader}
                onClick={() => toggleMenu("personal")}
              >
                <PersonOutlineIcon className={styles.icon} />{" "}
                <span>Personal</span>
                {openMenus["personal"] ? (
                  <ArrowDropUpIcon className={styles.arrowIcon} />
                ) : (
                  <ArrowDropDownIcon className={styles.arrowIcon} />
                )}
              </div>

              {openMenus["personal"] && (
                <ul className={styles.submenu}>
                  {[
                    "Mi Ficha",
                    "Ausencias",
                    "Mi Fichaje",
                    "Mis Documentos",
                  ].map((item) => (
                    <li
                      key={item}
                      className={active === item ? styles.activeSub : ""}
                      onClick={() => handleSelect(item)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Solo los admins ven este menú */}
            {userRole === "admin" && (
              <li className={styles.dropdown}>
                <div
                  className={styles.dropdownHeader}
                  onClick={() => toggleMenu("organizacion")}
                >
                  <PeopleOutlineIcon className={styles.icon} />{" "}
                  <span>Organización</span>
                  {openMenus["organizacion"] ? (
                    <ArrowDropUpIcon className={styles.arrowIcon} />
                  ) : (
                    <ArrowDropDownIcon className={styles.arrowIcon} />
                  )}
                </div>

                {openMenus["organizacion"] && (
                  <ul className={styles.submenu}>
                    {[
                      "Solicitudes Licencias",
                      "Empleados",
                      "Control Horario",
                      "Nómina",
                      "Usuarios",
                    ].map((item) => (
                      <li
                        key={item}
                        className={active === item ? styles.activeSub : ""}
                        onClick={() => handleSelect(item)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </>
      )}
    </aside>
  );
});

export default Sidebar;
