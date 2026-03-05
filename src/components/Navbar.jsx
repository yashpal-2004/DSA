import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, Bookmark, PieChart, LayoutDashboard, Milestone, Flame } from 'lucide-react';

const Navbar = ({ onSearch, searchMode, setSearchMode }) => {
    return (
        <nav className="glass-card" style={{
            position: 'sticky',
            top: '1.5rem',
            zIndex: 1000,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxSizing: 'border-box',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                <div style={{
                    background: 'var(--primary)',
                    padding: '0.6rem',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                }}>
                    <PieChart size={24} color="white" />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)' }}>MasterSheet</span>
            </Link>

            <div style={{ flex: 1, maxWidth: '600px', margin: '0 3rem', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderRight: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                    <button
                        onClick={() => setSearchMode('id')}
                        style={{ padding: '0.6rem 1.1rem', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer', background: searchMode === 'id' ? 'var(--primary)' : 'transparent', color: searchMode === 'id' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                    >#ID</button>
                    <button
                        onClick={() => setSearchMode('title')}
                        style={{ padding: '0.6rem 1.1rem', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer', background: searchMode === 'title' ? 'var(--primary)' : 'transparent', color: searchMode === 'title' ? 'white' : '#64748b', transition: 'all 0.2s', borderLeft: '1px solid #e2e8f0' }}
                    >Title</button>
                </div>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }} />
                    <input
                        type={searchMode === 'id' ? 'number' : 'text'}
                        placeholder={searchMode === 'id' ? 'Enter question ID...' : 'Search for topic or problem...'}
                        onChange={(e) => onSearch(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            color: 'var(--text-main)',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', color: '#64748b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'color 0.2s' }}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/gfg" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', color: '#64748b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'color 0.2s' }}>
                    <PieChart size={20} />
                    <span>Love Babbar</span>
                </NavLink>
                <NavLink to="/roadmap" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', color: '#64748b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'color 0.2s' }}>
                    <Milestone size={20} />
                    <span>Roadmap</span>
                </NavLink>
                <NavLink to="/activity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', color: '#64748b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'color 0.2s' }}>
                    <Flame size={20} />
                    <span>Activity</span>
                </NavLink>
                <NavLink to="/bookmarks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', color: '#64748b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'color 0.2s' }}>
                    <Bookmark size={20} />
                    <span>Bookmarks</span>
                </NavLink>
            </div>

            <style>{`
                .nav-link.active { color: var(--primary) !important; }
                .nav-link:hover { color: var(--text-main) !important; }
            `}</style>
        </nav>
    );
};

export default Navbar;
