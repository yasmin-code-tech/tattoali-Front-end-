import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User, Calendar, Image, LayoutDashboard, Users, LogOut } from "lucide-react";
import { useAuth } from "../auth/useAuth";


export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth(); // 👈 usa o logout do provider
  


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
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Gestor</h1>
              <p className="text-red-600 text-sm font-medium">TattooAli</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="py-6 space-y-1">
          <Link
            to="/perfil"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-red-900/20 hover:text-white"
          >
            <User className="w-5 h-5 mr-3" /> Perfil
          </Link>

          <Link
            to="/agenda"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-red-900/20 hover:text-white"
          >
            <Calendar className="w-5 h-5 mr-3" /> Agenda
          </Link>

          <Link
            to="/gerador-imagem"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-red-900/20 hover:text-white"
          >
            <Image className="w-5 h-5 mr-3" /> Gerar Imagens IA
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-red-900/20 hover:text-white"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>

          <Link
            to="/clientes"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-red-900/20 hover:text-white"
          >
            <Users className="w-5 h-5 mr-3" /> Clientes
          </Link>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={() => { setOpen(false); logout(); }} // 👈 fecha o menu e desloga de verdade
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
