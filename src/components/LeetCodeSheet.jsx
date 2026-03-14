import React, { useState, useMemo } from 'react';
import { Target, Trophy, Search, BookOpen, ExternalLink, CheckCircle, Bookmark, MessageCircle, X, Send, Filter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LeetCodeSheet = ({ topics, searchTerm, searchMode, onToggleSolved, onToggleBookmark, onSaveComment }) => {
    const navigate = useNavigate();

    // Filter States
    const [difficultyFilter, setDifficultyFilter] = useState('All'); // 'All', 'Easy', 'Medium', 'Hard'
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Solved', 'Unsolved'
    
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

    const leetcodeTopics = useMemo(() => topics.filter(t => !t.id.startsWith('babbar')), [topics]);
    const allQuestions = useMemo(() => {
        return leetcodeTopics
            .flatMap(t => t.questions.map(q => ({ ...q, topicId: t.id, topicName: t.topicName })))
            .sort((a, b) => Number(a.id) - Number(b.id));
    }, [leetcodeTopics]);

    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            // Difficulty Filter
            if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
            
            // Status Filter
            if (statusFilter === 'Solved' && !q.solved) return false;
            if (statusFilter === 'Unsolved' && q.solved) return false;
            
            // Search Term (if any)
            if (searchTerm) {
                const text = searchTerm.toLowerCase();
                const idMatchVal = searchTerm.replace('#', '');
                if (searchMode === 'id') {
                    return String(q.id) === idMatchVal;
                }
                return q.title.toLowerCase().includes(text) || q.topicName.toLowerCase().includes(text) || String(q.id).includes(idMatchVal);
            }
            
            return true;
        });
    }, [allQuestions, difficultyFilter, statusFilter, searchTerm, searchMode]);

    const totalSolved = allQuestions.filter(q => q.solved).length;
    const totalQuestions = allQuestions.length;
    const overallProgress = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

    // Difficulty Stats
    const getDiffStats = (diff) => {
        const questions = allQuestions.filter(q => q.difficulty === diff);
        return {
            solved: questions.filter(q => q.solved).length,
            total: questions.length
        };
    };

    const easy = getDiffStats('Easy');
    const medium = getDiffStats('Medium');
    const hard = getDiffStats('Hard');

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '350px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#ecfdf5', color: '#059669', padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', border: '1px solid #d1fae5' }}>
                        <Target size={16} />
                        LeetCode Master Sheet
                    </div>
                    <h1 className="section-title">Ultimate Question Bank</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        The most comprehensive collection of LeetCode questions categorized by topics.
                        Master these patterns to ace your technical interviews.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{totalQuestions}</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{totalSolved}</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Solved</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{overallProgress}%</div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Progress</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {[
                            { label: 'Easy', color: '#10b981', ...easy },
                            { label: 'Medium', color: '#f59e0b', ...medium },
                            { label: 'Hard', color: '#ef4444', ...hard }
                        ].map(d => (
                            <div key={d.label} className="glass-card" style={{ flex: 1, padding: '0.75rem', textAlign: 'center', borderBottom: `3px solid ${d.color}` }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: d.color, textTransform: 'uppercase', marginBottom: '2px' }}>{d.label}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{d.solved}<span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>/{d.total}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Filters Section */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Filter size={18} />
                        Difficulty:
                    </div>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px', gap: '0.25rem' }}>
                        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficultyFilter(d)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    background: difficultyFilter === d ? 'white' : 'transparent',
                                    color: difficultyFilter === d ? 'var(--text-main)' : '#64748b',
                                    boxShadow: difficultyFilter === d ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Check size={18} />
                        Status:
                    </div>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px', gap: '0.25rem' }}>
                        {['All', 'Solved', 'Unsolved'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    background: statusFilter === s ? 'white' : 'transparent',
                                    color: statusFilter === s ? 'var(--text-main)' : '#64748b',
                                    boxShadow: statusFilter === s ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                    Showing <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{filteredQuestions.length}</span> questions
                </div>
            </div>

            {/* Questions List */}
            <div style={{ minHeight: '400px' }}>
                {filteredQuestions.length === 0 ? (
                    <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No matching questions</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <AnimatePresence mode='popLayout'>
                            {filteredQuestions.map((q, i) => (
                                <motion.div
                                    key={`${q.topicId}-${q.id}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.3) }}
                                    className="glass-card"
                                    style={{
                                        padding: '1rem 1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer',
                                        background: q.solved ? '#f0fdf4' : 'white',
                                        border: q.solved ? '2px solid #10b981' : '1px solid #f1f5f9',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 12px 24px -8px rgba(0,0,0,0.08)' }}
                                >
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => navigate(`/topic/${q.topicId}`)}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', minWidth: '40px' }}>#{q.id}</span>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{q.title}</span>
                                            </div>
                                            {q.comment?.trim()?.length > 0 && (
                                                <div style={{
                                                    padding: '0.5rem 0.75rem',
                                                    background: '#fffbeb',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    color: '#92400e',
                                                    lineHeight: '1.4',
                                                    fontStyle: 'italic',
                                                    border: '1px solid #fef3c7',
                                                    borderLeft: '3px solid #f59e0b',
                                                }}>
                                                    {q.comment}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: 'var(--primary)', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>{q.topicName}</span>
                                        <span className={`badge badge-${q.difficulty?.toLowerCase() || 'easy'}`}>{q.difficulty}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderRight: '1px solid #e2e8f0', paddingRight: '1.25rem' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleSolved(q.topicId, q.id); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                title="Mark Solved"
                                            >
                                                <CheckCircle size={22} color={q.solved ? '#10b981' : '#cbd5e1'} fill={q.solved ? '#10b98120' : 'none'} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openCommentModal(q); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                title="Add Note"
                                            >
                                                <MessageCircle size={22} color={(q.comment?.trim()?.length > 0) ? 'var(--primary)' : '#cbd5e1'} fill={(q.comment?.trim()?.length > 0) ? 'var(--primary)20' : 'none'} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleBookmark(q.topicId, q.id); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                title="Star Question"
                                            >
                                                <Bookmark size={22} color={q.bookmarked ? '#f59e0b' : '#cbd5e1'} fill={q.bookmarked ? '#f59e0b' : 'none'} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <a
                                            href={q.leetcodeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                background: q.solved ? '#10b981' : 'var(--primary)',
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                boxShadow: q.solved ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.2)'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Solve <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Comment Modal */}
            {activeCommentQuestion && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card"
                        style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
                    >
                        <button onClick={() => setActiveCommentQuestion(null)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>

                        <header style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Personal Study Notes</div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{activeCommentQuestion.title}</h2>
                        </header>

                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write your logic, edge cases, or reminders here..."
                            style={{
                                width: '100%',
                                minHeight: '180px',
                                padding: '1.25rem',
                                background: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: '1rem',
                                outline: 'none',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                resize: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                            autoFocus
                        />

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setActiveCommentQuestion(null)}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'none', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '0.75rem 1.75rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                                }}
                            >
                                <Send size={18} />
                                Save Note
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LeetCodeSheet;
