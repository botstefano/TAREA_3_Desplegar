import React from 'react';
import Link from 'next/link';
import { Home, Briefcase, GraduationCap, Building2, FileText, Settings } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Briefcase size={20} />, label: 'Prácticas', href: '/practicas' },
    { icon: <GraduationCap size={20} />, label: 'Tesis', href: '/tesis' },
    { icon: <Building2 size={20} />, label: 'Empresas', href: '/empresas' },
    { icon: <FileText size={20} />, label: 'Reportes', href: '/reportes' },
    { icon: <Settings size={20} />, label: 'Configuración', href: '/settings' },
  ];

  return (
    <aside className="w-64 bg-unt-blue text-white min-h-screen p-6">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-unt-gold">UNT Gestión</h2>
        <p className="text-xs text-blue-200">Prácticas & Tesis</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            href={item.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-colors text-blue-50"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-10 border-t border-blue-800">
        <div className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 rounded-full bg-unt-gold text-unt-blue flex items-center justify-center font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold">Administrador</p>
            <p className="text-xs text-blue-300">admin@unt.edu.pe</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
