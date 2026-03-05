import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ChevronLeft, ExternalLink, CheckCircle, Bookmark, Filter, MessageSquare, MessageCircle, X, Send, CalendarCheck2, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

const TopicDetail = ({ topics, onToggleSolved, onToggleBookmark, onSaveComment, isGfgOrigin }) => {
    const { id } = useParams();
    const topic = topics.find(t => t.id === id);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('default');
    const [searchMode, setSearchMode] = useState('id'); // 'id' | 'title'

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Comment State
    const [activeCommentQuestion, setActiveCommentQuestion] = useState(null);
    const [commentText, setCommentText] = useState('');

    const openCommentModal = (q) => {
        setActiveCommentQuestion(q);
        setCommentText(q.comment || '');
    };

    const handleSave = () => {
        onSaveComment(topic.id, activeCommentQuestion.id, commentText);
        setActiveCommentQuestion(null);
    };

    const filteredQuestions = useMemo(() => {
        if (!topic) return [];
        const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 };
        const filtered = topic.questions.filter(q => {
            const term = searchTerm.trim();
            const matchesSearch = !term
                ? true
                : searchMode === 'id'
                    ? String(q.id) === term.replace('#', '')
                    : q.title.toLowerCase().includes(term.toLowerCase());
            const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Solved' ? q.solved :
                    statusFilter === 'Unsolved' ? !q.solved :
                        statusFilter === 'Bookmarked' ? q.bookmarked :
                            statusFilter === 'With Comments' ? (q.comment?.trim()?.length > 0) : true);
            return matchesSearch && matchesDifficulty && matchesStatus;
        });

        const sorted = [...filtered];
        switch (sortOrder) {
            case 'diff-asc': sorted.sort((a, b) => (DIFF_ORDER[a.difficulty] || 0) - (DIFF_ORDER[b.difficulty] || 0)); break;
            case 'diff-desc': sorted.sort((a, b) => (DIFF_ORDER[b.difficulty] || 0) - (DIFF_ORDER[a.difficulty] || 0)); break;
            case 'solved-first': sorted.sort((a, b) => (b.solved ? 1 : 0) - (a.solved ? 1 : 0)); break;
            case 'unsolved-first': sorted.sort((a, b) => (a.solved ? 1 : 0) - (b.solved ? 1 : 0)); break;
            case 'id-asc': sorted.sort((a, b) => Number(a.id) - Number(b.id)); break;
            case 'id-desc': sorted.sort((a, b) => Number(b.id) - Number(a.id)); break;
            case 'title-az': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'title-za': sorted.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'date-newest': sorted.sort((a, b) => (b.solvedAt ? new Date(b.solvedAt) : 0) - (a.solvedAt ? new Date(a.solvedAt) : 0)); break;
            case 'date-oldest': sorted.sort((a, b) => (a.solvedAt ? new Date(a.solvedAt) : Infinity) - (b.solvedAt ? new Date(b.solvedAt) : Infinity)); break;
            default: break;
        }
        return sorted;
    }, [topic, searchTerm, difficultyFilter, statusFilter, sortOrder]);

    if (!topic) return <div className="loader-container">Topic not found</div>;

    const solvedCount = topic.questions.filter(q => q.solved).length;
    const progress = Math.round((solvedCount / topic.questions.length) * 100);

    return (
        <div className="container" style={{ paddingTop: '1.5rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to={isGfgOrigin ? "/gfg" : "/"} className="glass-card" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none' }}>
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="section-title" style={{ marginBottom: '0.25rem' }}>{topic.topicName}</h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{topic.questions.length} problems curated for you</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Status</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{solvedCount} / {topic.questions.length}</div>
                    </div>
                    <div style={{ height: '40px', width: '1px', background: '#e2e8f0' }}></div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Efficiency</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{progress}%</div>
                    </div>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', position: 'sticky', top: '6.5rem', zIndex: 100 }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '300px', display: 'flex', alignItems: 'center' }}>
                    {/* Toggle: ID / Title */}
                    <div style={{ display: 'flex', borderRadius: '0.75rem 0 0 0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0', borderRight: 'none', flexShrink: 0 }}>
                        <button
                            onClick={() => { setSearchMode('id'); setSearchTerm(''); }}
                            style={{ padding: '0.85rem 1.1rem', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', background: searchMode === 'id' ? 'var(--primary)' : '#f8fafc', color: searchMode === 'id' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                        >
                            #ID
                        </button>
                        <button
                            onClick={() => { setSearchMode('title'); setSearchTerm(''); }}
                            style={{ padding: '0.85rem 1.1rem', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', background: searchMode === 'title' ? 'var(--primary)' : '#f8fafc', color: searchMode === 'title' ? 'white' : '#64748b', transition: 'all 0.2s', borderLeft: '1px solid #e2e8f0' }}
                        >
                            Title
                        </button>
                    </div>
                    <input
                        type={searchMode === 'id' ? 'number' : 'text'}
                        placeholder={searchMode === 'id' ? 'Enter question ID...' : 'Search problem title...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: 'none', borderRadius: '0 1rem 1rem 0', outline: 'none', padding: '0.85rem 1.25rem', color: 'var(--text-main)', fontSize: '0.95rem' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            style={{ padding: '0.85rem 1rem 0.85rem 2.75rem', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid #e2e8f0', borderRadius: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none', fontWeight: 600, minWidth: '160px' }}
                        >
                            <option value="All">All Levels</option>
                            <option value="Easy">Beginner</option>
                            <option value="Medium">Intermediate</option>
                            <option value="Hard">Advanced</option>
                        </select>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid #e2e8f0', borderRadius: '1rem', outline: 'none', cursor: 'pointer', fontWeight: 600, minWidth: '150px' }}
                    >
                        <option value="All">All Progress</option>
                        <option value="Solved">Solved Only</option>
                        <option value="Unsolved">To-Do Only</option>
                        <option value="Bookmarked">Starred</option>
                        <option value="With Comments">Notes Only</option>
                    </select>
                    <div style={{ position: 'relative' }}>
                        <ArrowUpDown size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            style={{ padding: '0.85rem 1rem 0.85rem 2.75rem', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid #e2e8f0', borderRadius: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none', fontWeight: 600, minWidth: '185px' }}
                        >
                            <option value="default">Default Order</option>
                            <option value="diff-asc">Easy → Hard</option>
                            <option value="diff-desc">Hard → Easy</option>
                            <option value="solved-first">Solved First</option>
                            <option value="unsolved-first">Unsolved First</option>
                            <option value="id-asc">ID: Low → High</option>
                            <option value="id-desc">ID: High → Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px', textAlign: 'center' }}>Solve</th>
                            <th style={{ width: '60px' }}>Rank</th>
                            <th>Problem Designation</th>
                            <th style={{ width: '140px' }}>Difficulty</th>
                            <th style={{ width: '150px' }}>Date Solved</th>
                            <th style={{ width: '150px', textAlign: 'center' }}>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuestions.map((q) => (
                            <tr key={q.id}>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => onToggleSolved(topic.id, q.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        <CheckCircle size={24} color={q.solved ? '#10b981' : '#e2e8f0'} fill={q.solved ? '#10b98120' : 'none'} strokeWidth={q.solved ? 2.5 : 2} />
                                    </button>
                                </td>
                                <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>#{q.id}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <a href={q.leetcodeLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
                                                {q.title}
                                                <ExternalLink size={14} color="#94a3b8" />
                                            </a>
                                            {q.tag && <span style={{ fontSize: '0.65rem', color: 'var(--primary)', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', border: '1px solid #dbeafe' }}>{q.tag}</span>}
                                        </div>
                                        {q.comment?.trim()?.length > 0 && (
                                            <div style={{
                                                marginTop: '0.25rem',
                                                padding: '0.5rem 0.75rem',
                                                background: '#fffbeb',
                                                borderLeft: '3px solid #f59e0b',
                                                borderRadius: '6px',
                                                fontSize: '0.82rem',
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
                                </td>
                                <td>
                                    <span className={`badge badge-${q.difficulty?.toLowerCase() || 'easy'}`}>{q.difficulty}</span>
                                </td>
                                <td>
                                    {q.solved && q.solvedAt ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <CalendarCheck2 size={13} color="#10b981" />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                                                    {new Date(q.solvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, paddingLeft: '18px' }}>
                                                {new Date(q.solvedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500 }}>— Not solved</span>
                                    )}
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
                                            onClick={() => onToggleBookmark(topic.id, q.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            title="Star Question"
                                        >
                                            <Bookmark size={22} color={q.bookmarked ? '#f59e0b' : '#cbd5e1'} fill={q.bookmarked ? '#f59e0b' : 'none'} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredQuestions.length === 0 && (
                    <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ marginBottom: '1.5rem', opacity: 0.1 }}><Search size={64} style={{ margin: '0 auto' }} /></div>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>No results matched your filters</h3>
                        <p style={{ marginTop: '0.5rem' }}>Try clearing your search or adjusting the filters.</p>
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

export default TopicDetail;
