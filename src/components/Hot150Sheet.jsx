import React, { useState, useMemo } from 'react';
import { Target, Trophy, Search, BookOpen, ExternalLink, CheckCircle, Bookmark, MessageCircle, X, Send, Filter, Check, Flame, Plus, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { submissionData } from '../data/submissions';

const Hot150Sheet = ({ topics, searchTerm, searchMode, onToggleSolved, onToggleBookmark, onSaveComment, onAddQuestion }) => {
    const navigate = useNavigate();

    // Filter States
    const [difficultyFilter, setDifficultyFilter] = useState('All'); 
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    
    // Manual Form State
    const [manualForm, setManualForm] = useState({
        id: '',
        title: '',
        difficulty: 'Medium',
        leetcodeLink: ''
    });
    
    // Comment State
    const [activeCommentQuestion, setActiveCommentQuestion] = useState(null);
    const [commentText, setCommentText] = useState('');

    const openCommentModal = (q) => {
        setActiveCommentQuestion(q);
        setCommentText(q.comment || '');
    };

    const handleSave = () => {
        onSaveComment(activeCommentQuestion.topicId, activeCommentQuestion.id, commentText);
        setActiveCommentQuestion(null);
    };

    // Filter ONLY for the new leet160 topics
    const hot150Topics = useMemo(() => topics.filter(t => t.id === 'leetcode-top-150-plus'), [topics]);
    const allQuestions = useMemo(() => hot150Topics.flatMap(t => t.questions.map(q => ({ ...q, topicId: t.id, topicName: t.topicName }))), [hot150Topics]);

    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
            if (statusFilter === 'Solved' && !q.solved) return false;
            if (statusFilter === 'Unsolved' && q.solved) return false;
            if (searchTerm) {
                const text = searchTerm.toLowerCase();
                const idMatchVal = searchTerm.replace('#', '');
                if (searchMode === 'id') return String(q.id) === idMatchVal;
                return q.title.toLowerCase().includes(text) || String(q.id).includes(idMatchVal);
            }
            return true;
        });
    }, [allQuestions, difficultyFilter, statusFilter, searchTerm, searchMode]);

    const totalSolved = allQuestions.filter(q => q.solved).length;
    const totalQuestions = allQuestions.length;
    const overallProgress = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

    // Find questions done in submissionData but NOT in any leetcode sheet
    const externalSolved = useMemo(() => {
        const processedIds = new Set(topics.flatMap(t => t.questions.map(q => String(q.id))));
        return submissionData
            .filter(s => s.status === 'Accepted' && !processedIds.has(String(s.id)))
            .map(s => ({
                id: s.id,
                title: s.title,
                difficulty: s.difficulty,
                solvedAt: s.date
            }));
    }, [topics]);

    const handleImport = (q) => {
        onAddQuestion('leetcode-top-150-plus', q);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualForm.title) return;
        
        onAddQuestion('leetcode-top-150-plus', {
            ...manualForm,
            id: manualForm.id || Date.now().toString().slice(-4),
            solved: true,
            solvedAt: new Date().toISOString()
        });
        
        setShowManualModal(false);
        setManualForm({ id: '', title: '', difficulty: 'Medium', leetcodeLink: '' });
    };

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '350px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#fef2f2', color: '#dc2626', padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
                        <Flame size={16} />
                        LeetCode Top 150 Plus
                    </div>
                    <h1 className="section-title">New Trending Questions</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        The latest high-frequency questions curated for top tier companies.
                        These questions were not in our original bank.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{totalQuestions}</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Current Items</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{totalSolved}</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Solved</div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowManualModal(true)}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '1rem',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <Plus size={20} />
                        Add Manually
                    </motion.button>
                </div>
            </header>

            {/* Filters */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>Difficulty:</div>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px', gap: '0.25rem' }}>
                        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                            <button key={d} onClick={() => setDifficultyFilter(d)} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, background: difficultyFilter === d ? 'white' : 'transparent', color: difficultyFilter === d ? 'var(--text-main)' : '#64748b' }}>{d}</button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>Status:</div>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px', gap: '0.25rem' }}>
                        {['All', 'Solved', 'Unsolved'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, background: statusFilter === s ? 'white' : 'transparent', color: statusFilter === s ? 'var(--text-main)' : '#64748b' }}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredQuestions.map((q, i) => (
                    <motion.div
                        key={`${q.topicId}-${q.id}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: q.solved ? '#f0fdf4' : 'white', border: q.solved ? '2px solid #10b981' : '1px solid #f1f5f9' }}
                    >
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', minWidth: '40px' }}>#{q.id}</span>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{q.title}</span>
                                {q.comment && <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic', marginTop: '4px' }}>{q.comment}</div>}
                            </div>
                            <span className={`badge badge-${q.difficulty?.toLowerCase() || 'easy'}`}>{q.difficulty}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <button onClick={() => onToggleSolved(q.topicId, q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <CheckCircle size={22} color={q.solved ? '#10b981' : '#cbd5e1'} />
                            </button>
                            <button onClick={() => openCommentModal(q)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <MessageCircle size={22} color={q.comment ? 'var(--primary)' : '#cbd5e1'} />
                            </button>
                            <a href={q.leetcodeLink} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Solve</a>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {activeCommentQuestion && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{activeCommentQuestion.title}</h2>
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '1rem', border: '2px solid #e2e8f0' }} />
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setActiveCommentQuestion(null)}>Cancel</button>
                            <button onClick={handleSave} style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Modal */}
            <AnimatePresence>
                {showSyncModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', padding: '0', background: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Sync External Problems</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', fontWeight: 600 }}>Detected {externalSolved.length} solved problems not in your sheets.</p>
                                </div>
                                <button onClick={() => setShowSyncModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {externalSolved.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                                        <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 700 }}>All detected solves are already synced!</p>
                                    </div>
                                ) : (
                                    externalSolved.map((q) => (
                                        <div key={q.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>#{q.id}</span>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{q.title}</span>
                                                <span className={`badge badge-${q.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{q.difficulty}</span>
                                            </div>
                                            <button
                                                onClick={() => handleImport(q)}
                                                style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Plus size={16} /> Add to List
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowSyncModal(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: 800, cursor: 'pointer', color: '#64748b' }}
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manual Add Modal */}
            <AnimatePresence>
                {showManualModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: 'white', position: 'relative' }}
                        >
                            <button onClick={() => setShowManualModal(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>

                            <header style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Manual Achievement</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', fontWeight: 600 }}>Record a solved question outside our bank.</p>
                            </header>

                            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Problem ID</label>
                                        <input 
                                            type="number" 
                                            placeholder="e.g. 1" 
                                            value={manualForm.id}
                                            onChange={(e) => setManualForm({...manualForm, id: e.target.value})}
                                            style={{ padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Difficulty</label>
                                        <select 
                                            value={manualForm.difficulty}
                                            onChange={(e) => setManualForm({...manualForm, difficulty: e.target.value})}
                                            style={{ padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: 700 }}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Problem Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. Two Sum" 
                                        value={manualForm.title}
                                        onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
                                        style={{ padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>LeetCode URL</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://leetcode.com/problems/..." 
                                        value={manualForm.leetcodeLink}
                                        onChange={(e) => setManualForm({...manualForm, leetcodeLink: e.target.value})}
                                        style={{ padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                                    }}
                                >
                                    <Check size={20} />
                                    Save Question
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Hot150Sheet;
