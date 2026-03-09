import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Target, Trophy, ArrowRight, LayoutDashboard, Search, ExternalLink, CheckCircle, Bookmark, MessageCircle, MessageSquare, X, Send, Hash } from 'lucide-react';

// Logical order matching dashboard
const TOPIC_ORDER = [
    'array', 'string', 'sorting', 'two-pointer', 'sliding-window', 'prefix-sum',
    'linked-list', 'matrix', 'tuple', 'dictionary', 'set', 'recursion',
    'backtracking', 'trees', 'greedy', 'prime-numbers', 'oops', 'dp'
];

const HomePage = ({ topics = [], searchTerm = '', searchMode, onToggleSolved, onToggleBookmark, onSaveComment }) => {
    const navigate = useNavigate();

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

    const mainTopics = topics.filter(t => !t.id.startsWith('babbar'));
    const sortedTopics = [...mainTopics].sort((a, b) => {
        const ai = TOPIC_ORDER.indexOf(a.id);
        const bi = TOPIC_ORDER.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    const allQuestions = mainTopics.flatMap(t => t.questions);
    const totalSolved = allQuestions.filter(q => q.solved).length;
    const totalQuestions = allQuestions.length;
    const totalLeft = totalQuestions - totalSolved;
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

    // ---- Search Logic ----
    const activeSearch = searchTerm || '';
    const isSearching = activeSearch.length > 0;
    let matchedQuestions = [];
    if (isSearching) {
        const text = activeSearch.toLowerCase();
        const idMatchVal = activeSearch.replace('#', '');
        matchedQuestions = sortedTopics.flatMap(t => {
            const topicMatch = t.topicName.toLowerCase().includes(text);
            return t.questions
                .filter(q => {
                    if (searchMode === 'id') {
                        return String(q.id) === idMatchVal;
                    }
                    return topicMatch || q.title.toLowerCase().includes(text) || String(q.id).includes(idMatchVal);
                })
                .map(q => ({ ...q, topicId: t.id, topicName: t.topicName }));
        });
    }
    // ----------------------

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
            >
                <div>
                    <h1 className="section-title" style={{ marginBottom: '0.25rem' }}>Overview</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Your complete DSA progress at a glance</p>
                </div>
            </motion.header>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}
            >
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Target size={22} color="#3b82f6" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{totalQuestions}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Trophy size={22} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{totalSolved}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Solved</div>
                </div>
                {[
                    { label: 'Easy', color: '#10b981', ...easy },
                    { label: 'Medium', color: '#f59e0b', ...medium },
                    { label: 'Hard', color: '#ef4444', ...hard }
                ].map(d => (
                    <div key={d.label} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: `3px solid ${d.color}` }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: d.color, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{d.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{d.solved}<span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>/{d.total}</span></div>
                    </div>
                ))}
            </motion.div>

            {/* Conditional Content */}
            {isSearching ? (
                <div style={{ marginBottom: '1.5rem' }}>
                    {matchedQuestions.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <Search size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p style={{ fontWeight: 600 }}>No results found for <strong>"{activeSearch}"</strong></p>
                        </div>
                    ) : (
                        matchedQuestions.map((q, i) => (
                            <motion.div
                                key={`${q.topicId}-${q.id}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="glass-card"
                                style={{
                                    padding: '1rem 1.5rem',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    background: q.solved ? '#f0fdf4' : 'white',
                                    border: q.solved ? '2px solid #10b981' : '1px solid #f1f5f9'
                                }}
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
                                                borderLeft: '3px solid #f59e0b',
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
                                            background: 'var(--primary)',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Solve <ExternalLink size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            ) : (
                <>
                    {/* Overall Completion Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className="glass-card"
                        style={{ padding: '1.5rem 2rem', marginBottom: '2.5rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>Overall Completion</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{overallProgress}%</span>
                        </div>
                        <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{totalSolved} solved</span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{totalLeft} remaining</span>
                        </div>
                    </motion.div>

                    {/* Topic-wise Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24 }}
                    >
                        <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Topic Breakdown</h2>
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            {sortedTopics.map((topic, index) => {
                                const solved = topic.questions.filter(q => q.solved).length;
                                const total = topic.questions.length;
                                const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                                const isComplete = pct === 100 && total > 0;
                                return (
                                    <motion.div
                                        key={topic.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                        onClick={() => navigate(`/topic/${topic.id}`)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.25rem',
                                            padding: '1rem 1.75rem',
                                            cursor: 'pointer',
                                            borderBottom: index < sortedTopics.length - 1 ? '1px solid #f8fafc' : 'none',
                                            transition: 'background 0.15s'
                                        }}
                                        whileHover={{ backgroundColor: '#f8fafc' }}
                                    >
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isComplete ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isComplete ? '#d1fae5' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {isComplete ? <CheckCircle2 size={14} color="#10b981" /> : <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8' }}>{index + 1}</span>}
                                        </div>
                                        <div style={{ flex: '0 0 200px', minWidth: 0 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{topic.topicName}</span>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 + index * 0.03 }}
                                                    style={{
                                                        height: '100%',
                                                        background: isComplete ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                                        borderRadius: '3px'
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isComplete ? '#10b981' : 'var(--primary)', minWidth: '38px', textAlign: 'right' }}>{pct}%</span>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '80px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{solved}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}> / {total}</span>
                                        </div>
                                        <ArrowRight size={16} color="#cbd5e1" style={{ flexShrink: 0 }} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}

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

export default HomePage;
