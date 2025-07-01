
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    Home,
    Users,
    Trophy,
    Gamepad2,
    BarChart3,
    Settings,
    ChevronRight
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <Home size={20} />
    },
    {
        label: 'Players',
        href: '/dashboard/players',
        icon: <Users size={20} />
    },
    {
        label: 'Tournaments',
        href: '/dashboard/tournaments',
        icon: <Trophy size={20} />
    },
    {
        label: 'Matches',
        href: '/dashboard/matches',
        icon: <Gamepad2 size={20} />,
        badge: 'Live'
    },
    {
        label: 'Statistics',
        href: '/dashboard/stats',
        icon: <BarChart3 size={20} />
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings size={20} />
    }
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white shadow-sm border-b border-green-100">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">🎾</span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900">Tennis Dashboard</h1>
                    </div>
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg border-r border-green-100">
                    {/* Desktop Header */}
                    <div className="flex items-center px-6 py-4 border-b border-green-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">🎾</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Tennis</h1>
                            <p className="text-sm text-green-600">Dashboard</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                                    isActiveRoute(item.href)
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                  <span className={`transition-colors ${
                      isActiveRoute(item.href)
                          ? 'text-green-600'
                          : 'text-gray-500 group-hover:text-green-600'
                  }`}>
                    {item.icon}
                  </span>
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                                )}
                                <ChevronRight size={16} className={`transition-colors ${
                                    isActiveRoute(item.href)
                                        ? 'text-green-600'
                                        : 'text-gray-400 group-hover:text-green-600'
                                }`} />
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-green-100">
                        <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">Active Tournament</h3>
                            <p className="text-sm text-gray-600 mb-2">Wimbledon 2024</p>
                            <div className="w-full bg-white rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">75% Complete</p>
                        </div>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
                        <div
                            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile Navigation */}
                            <div className="p-4 border-b border-green-100">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">🎾</span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900">Tennis Dashboard</h2>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 px-4 py-4 space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3 py-4 rounded-xl transition-all duration-200 ${
                                            isActiveRoute(item.href)
                                                ? 'bg-green-100 text-green-700'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                        }`}
                                        onClick={toggleMobileMenu}
                                    >
                                        <div className="flex items-center space-x-3">
                      <span className={`${
                          isActiveRoute(item.href) ? 'text-green-600' : 'text-gray-500'
                      }`}>{item.icon}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 lg:ml-64">
                    <div className="min-h-screen bg-gray-50">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};