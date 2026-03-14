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
    Target,
    TrendingUp,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Zap,
    List
} from 'lucide-react';

const Sidebar = ({ zoomLevel, setZoomLevel }) => {
    const navItems = [
        { to: "/", icon: <Home size={22} />, label: "Home" },
        { to: "/dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
        { to: "/activity", icon: <Flame size={22} />, label: "Activity" },
        { to: "/roadmap", icon: <Milestone size={22} />, label: "Roadmap" },
        { to: "/plan", icon: <TrendingUp size={22} />, label: "Study Plan" },
        { to: "/leetcode", icon: <List size={22} />, label: "LeetCode Sheet" },
        { to: "/hot150", icon: <Zap size={22} />, label: "Hot 150+" },
        { to: "/gfg", icon: <Trophy size={22} />, label: "Love Babbar" },
        { to: "/bookmarks", icon: <Bookmark size={22} />, label: "Bookmarks" },
    ];

    return (
        <aside style={{
            width: '280px',
            height: `calc(100vh / ${zoomLevel / 100})`,
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'white',
            borderRight: '1px solid #e2e8f0',
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

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
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

            <div className="zoom-controls" style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Zoom</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>{zoomLevel}%</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
                        className="zoom-btn"
                        title="Zoom Out (Ctrl -)"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button 
                        onClick={() => setZoomLevel(100)}
                        className="zoom-btn"
                        title="Reset Zoom (Ctrl 0)"
                        style={{ flex: 1 }}
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button 
                        onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
                        className="zoom-btn"
                        title="Zoom In (Ctrl +)"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>


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
                .zoom-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    padding: 0.6rem;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    display: flex;
                    alignItems: center;
                    justify-content: center;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .zoom-btn:hover {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }
                .zoom-btn:active {
                    transform: translateY(0);
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
