import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    PieChart,
    Milestone,
    Flame,
    Bookmark,
    Home,
    ChevronRight,
    Trophy,
    Target
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { to: "/", icon: <Home size={22} />, label: "Home" },
        { to: "/dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
        { to: "/gfg", icon: <Trophy size={22} />, label: "Love Babbar" },
        { to: "/roadmap", icon: <Milestone size={22} />, label: "Roadmap" },
        { to: "/activity", icon: <Flame size={22} />, label: "Activity" },
        { to: "/bookmarks", icon: <Bookmark size={22} />, label: "Bookmarks" },
    ];

    return (
        <aside style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'white',
            borderRight: '1px solid #e2e8h0',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            zIndex: 1000,
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <div style={{
                    background: 'var(--primary)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                }}>
                    <Target size={24} color="white" />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)' }}>MasterSheet</span>
            </Link>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '1rem',
                            textDecoration: 'none',
                            color: '#64748b',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative'
                        }}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronRight className="chevron" size={16} style={{ marginLeft: 'auto', opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.2s' }} />
                    </NavLink>
                ))}
            </nav>


            <style>{`
                .sidebar-link:hover {
                    background: #f8fafc;
                    color: var(--text-main);
                }
                .sidebar-link.active {
                    background: #eff6ff;
                    color: var(--primary);
                }
                .sidebar-link.active .chevron {
                    opacity: 1;
                    transform: translateX(0);
                }
                .sidebar-link:hover .chevron {
                    opacity: 0.5;
                    transform: translateX(0);
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
