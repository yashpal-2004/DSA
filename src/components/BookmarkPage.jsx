import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Bookmark, Hash, AlertTriangle, ChevronRight, BookmarkCheck, MessageSquare, MessageCircle, X, Send, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const BookmarkPage = ({ topics, onToggleBookmark, onToggleSolved, onSaveComment }) => {
    const [statusFilter, setStatusFilter] = useState('All');

    // Comment State
    const [activeCommentQuestion, setActiveCommentQuestion] = useState(null);
    const [commentText, setCommentText] = useState('');

    const bookmarkedQuestions = useMemo(() => {
        return topics.flatMap(topic =>
            topic.questions
                .filter(q => q.bookmarked)
                .map(q => ({ ...q, topicName: topic.topicName, topicId: topic.id }))
        ).filter(q => {
            if (statusFilter === 'With Comments') return (q.comment?.trim()?.length > 0);
            return true;
        });
    }, [topics, statusFilter]);

    const openCommentModal = (q) => {
        setActiveCommentQuestion(q);
        setCommentText(q.comment || '');
    };

    const handleSave = () => {
        onSaveComment(activeCommentQuestion.topicId, activeCommentQuestion.id, commentText);
        setActiveCommentQuestion(null);
    };

    if (bookmarkedQuestions.length === 0 && statusFilter === 'All') {
        return (
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
                    <div style={{ background: '#f8fafc', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid #e2e8f0' }}>
                        <Bookmark size={40} color="#94a3b8" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>Your collection is empty</h1>
                    <p style={{ color: '#64748b', margin: '0.75rem 0 2.5rem', fontSize: '1.1rem' }}>Starred problems will appear here for quick access later.</p>
                    <Link to="/dashboard" className="btn btn-primary">Find Problems to Solve</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '1.5rem' }}>
            <header style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ background: '#f59e0b', width: '56px', height: '56px', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)' }}>
                        <BookmarkCheck size={32} color="white" />
                    </div>
                    <div>
                        <h1 className="section-title" style={{ marginBottom: '0.25rem' }}>Starred Collection</h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.05rem' }}>{bookmarkedQuestions.length} key problems saved for revision</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '0.75rem 1.25rem' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="All">All Starred</option>
                        <option value="With Comments">Starred with Notes</option>
                    </select>
                </div>
            </header>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th style={{ width: '200px' }}>Topic Domain</th>
                            <th>Problem Designation</th>
                            <th style={{ width: '150px' }}>Difficulty</th>
                            <th style={{ width: '140px', textAlign: 'center' }}>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookmarkedQuestions.map((q) => (
                            <tr key={q.id}>
                                <td>
                                    <Link to={`/topic/${q.topicId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Hash size={14} />
                                        </div>
                                        {q.topicName}
                                    </Link>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <a href={q.leetcodeLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem' }}>
                                                {q.title}
                                                <ExternalLink size={14} color="#94a3b8" />
                                            </a>
                                        </div>
                                        {q.comment?.trim()?.length > 0 && (
                                            <div style={{
                                                padding: '0.5rem 0.75rem',
                                                background: '#fffbeb',
                                                borderLeft: '3px solid #f59e0b',
                                                borderRadius: '6px',
                                                fontSize: '0.82rem',
                                                color: '#92400e',
                                                lineHeight: '1.4',
                                                fontStyle: 'italic',
                                                border: '1px solid #fef3c7',
                                                maxWidth: '500px'
                                            }}>
                                                {q.comment}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
                                        <button
                                            onClick={() => openCommentModal(q)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            title="Add Note"
                                        >
                                            <MessageCircle size={22} color={(q.comment?.trim()?.length > 0) ? 'var(--primary)' : '#cbd5e1'} fill={(q.comment?.trim()?.length > 0) ? 'var(--primary)20' : 'none'} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => onToggleBookmark(q.topicId, q.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            title="Remove Star"
                                        >
                                            <X size={22} color="#ef4444" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookmarkedQuestions.length === 0 && statusFilter !== 'All' && (
                    <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ marginBottom: '1.5rem', opacity: 0.1 }}><Search size={64} style={{ margin: '0 auto' }} /></div>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>No results matched your filters</h3>
                        <p style={{ marginTop: '0.5rem' }}>You don't have any starred questions with notes.</p>
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

export default BookmarkPage;
