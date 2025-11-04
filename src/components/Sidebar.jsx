import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, User, Calendar, Image, LayoutDashboard, Users, LogOut, Camera, Home } from "lucide-react";
import { useAuth } from "../auth/useAuth";


export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth(); // 👈 usa o logout do provider
  
  const handleLinkClick = () => {
    if (open) {
      setOpen(false);
    }
  };

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center px-6 py-3 transition-colors duration-200";
    if (isActive) {
      return `${baseClasses} bg-red-900/20 text-white`;
    }
    return `${baseClasses} text-gray-300 hover:bg-red-900/20 hover:text-white`;
  };


  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-red-600 p-3 rounded-lg"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 transform transition-transform duration-300 z-40 
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <Link to="/" onClick={handleLinkClick}>
          <div className="p-6 border-b border-gray-800 hover:bg-gray-900 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/icon-tattooali.png" 
                  alt="Logo TattooAli"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Gestor</h1>
                <p className="text-red-600 text-sm font-medium">TattooAli</p>
              </div>
            </div>
          </div>
        </Link>

        <nav className="py-6 space-y-1">
          <NavLink
            to="/"
            end 
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <Home className="w-5 h-5 mr-3" /> Home
          </NavLink>

          <NavLink
            to="/perfil"
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <User className="w-5 h-5 mr-3" /> Perfil
          </NavLink>

          <NavLink
            to="/agenda"
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <Calendar className="w-5 h-5 mr-3" /> Agenda
          </NavLink>

          <NavLink
            to="/gerador-imagem"
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <Image className="w-5 h-5 mr-3" /> Gerar Imagens IA
          </NavLink>

          <NavLink
            to="/dashboard"
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </NavLink>

          <NavLink
            to="/clientes"
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <Users className="w-5 h-5 mr-3" /> Clientes
          </NavLink>

          <NavLink 
            to="/galeria"
            className={getNavLinkClass}
            onClick={handleLinkClick}
          >
            <Camera className="w-5 h-5 mr-3" /> Galeria
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={() => { setOpen(false); logout(); }} 
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}