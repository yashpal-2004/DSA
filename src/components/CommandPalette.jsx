import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command, Hash, Type, CheckCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = ({ topics, onSearch, searchMode, setSearchMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSearch = (val) => {
        setQuery(val);
        onSearch(val);
    };

    const handleResultClick = (result) => {
        if (result.type === 'topic') {
            navigate(`/topic/${result.id}`);
        } else {
            // For questions, go to topic page and pass search params so it filters/highlights the question
            const baseUrl = result.topicId.startsWith('babbar') ? `/gfg/topic/${result.topicId}` : `/topic/${result.topicId}`;
            const queryParam = searchMode === 'id' ? result.id : result.title;
            navigate(`${baseUrl}?q=${encodeURIComponent(queryParam)}&m=${searchMode}`);
        }
        setIsOpen(false);
        setQuery('');
        onSearch('');
    };

    const filteredResults = useMemo(() => {
        if (query.trim().length === 0) return [];

        const results = [];
        const text = query.toLowerCase();

        if (searchMode === 'id') {
            const idMatchVal = query.replace('#', '');
            topics.forEach(t => {
                t.questions?.forEach(q => {
                    if (String(q.id) === idMatchVal) {
                        results.push({
                            type: 'question',
                            ...q,
                            topicId: t.id,
                            topicName: t.topicName,
                            uniqueKey: `q-${t.id}-${q.id}`
                        });
                    }
                });
            });
        } else {
            // Search topics
            topics.forEach(t => {
                if (t.topicName.toLowerCase().includes(text)) {
                    results.push({
                        type: 'topic',
                        ...t,
                        uniqueKey: `t-${t.id}`
                    });
                }
            });
            // Search questions
            if (text.length > 1) {
                topics.forEach(t => {
                    t.questions?.forEach(q => {
                        if (q.title.toLowerCase().includes(text)) {
                            results.push({
                                type: 'question',
                                ...q,
                                topicId: t.id,
                                topicName: t.topicName,
                                uniqueKey: `q-${t.id}-${q.id}`
                            });
                        }
                    });
                });
            }
        }

        return results.slice(0, 10);
    }, [query, topics, searchMode]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'start', justifyContent: 'center', paddingTop: '15vh' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            style={{
                                width: '100%',
                                maxWidth: '640px',
                                background: 'white',
                                borderRadius: '1.25rem',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                                position: 'relative',
                                zIndex: 3001
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginRight: '1rem' }}>
                                    <button
                                        onClick={() => setSearchMode('id')}
                                        style={{
                                            padding: '4px 10px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            border: 'none',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            background: searchMode === 'id' ? 'white' : 'transparent',
                                            color: searchMode === 'id' ? 'var(--primary)' : '#64748b',
                                            boxShadow: searchMode === 'id' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        <Hash size={12} /> ID
                                    </button>
                                    <button
                                        onClick={() => setSearchMode('title')}
                                        style={{
                                            padding: '4px 10px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            border: 'none',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            background: searchMode === 'title' ? 'white' : 'transparent',
                                            color: searchMode === 'title' ? 'var(--primary)' : '#64748b',
                                            boxShadow: searchMode === 'title' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        <Type size={12} /> Title
                                    </button>
                                </div>
                                <Search size={20} style={{ color: '#94a3b8', marginRight: '1rem' }} />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder={searchMode === 'id' ? "Enter question ID..." : "Search topics, problems, or commands..."}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '1.1rem',
                                        color: '#1e293b',
                                        background: 'transparent'
                                    }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
                                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>ESC</span>
                                    <span>to close</span>
                                </div>
                            </div>

                            <div style={{ padding: '0.5rem', maxHeight: '450px', overflowY: 'auto' }}>
                                {query.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        <Command size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Start typing to search...</p>
                                    </div>
                                ) : (
                                    <>
                                        {filteredResults.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {filteredResults.map(result => (
                                                    <div
                                                        key={result.uniqueKey}
                                                        onClick={() => handleResultClick(result)}
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '1rem',
                                                            cursor: 'pointer',
                                                            borderRadius: '0.75rem',
                                                            transition: 'background 0.2s',
                                                            background: 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            background: result.type === 'topic' ? '#eff6ff' : (result.solved ? '#f0fdf4' : '#f8fafc'),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: result.type === 'topic' ? 'var(--primary)' : (result.solved ? '#10b981' : '#94a3b8'),
                                                            border: result.type === 'question' && result.solved ? '1px solid #dcfce7' : '1px solid #e2e8f0'
                                                        }}>
                                                            {result.type === 'topic' ? <Type size={16} /> : (result.solved ? <CheckCircle size={16} /> : <Hash size={16} />)}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {result.type === 'topic' ? result.topicName : result.title}
                                                                </span>
                                                                {result.type === 'question' && (
                                                                    <span className={`badge badge-${result.difficulty?.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{result.difficulty}</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                {result.type === 'topic' ? 'Section' : result.topicName}
                                                                <ArrowRight size={10} />
                                                                {result.type === 'topic' ? `${result.questions?.length || 0} Problems` : `ID #${result.id}`}
                                                            </div>
                                                        </div>
                                                        <div style={{ color: '#cbd5e1' }}>
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                                <Search size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                                <p style={{ fontWeight: 600 }}>No direct matches for <strong>"{query}"</strong></p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hint in Bottom Right */}
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'white',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    border: '1px solid #e2e8f0'
                }}
            >
                <div style={{ display: 'flex', items: 'center', gap: '4px' }}>
                    <kbd style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #e2e8f0', color: '#64748b' }}>Ctrl</kbd>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>+</span>
                    <kbd style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #e2e8f0', color: '#64748b' }}>K</kbd>
                </div>
                <div style={{ height: '16px', width: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Search...</span>
            </div>
        </>
    );
};

export default CommandPalette;
