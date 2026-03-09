import React, { useState, useMemo } from 'react';
import { Target, Trophy, Clock, Search, ExternalLink, CheckCircle, Bookmark, MessageCircle, MessageSquare, X, Send, Flame, Calendar, TrendingUp, Flag, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import TopicCard from './TopicCard';

// Logical DSA learning order, beginner to advanced
const TOPIC_ORDER = [
    'array',
    'string',
    'sorting',
    'two-pointer',
    'sliding-window',
    'prefix-sum',
    'linked-list',
    'matrix',
    'tuple',
    'dictionary',
    'set',
    'recursion',
    'backtracking',
    'trees',
    'greedy',
    'prime-numbers',
    'oops',
    'dp',
];

const Dashboard = ({ topics, searchTerm, searchMode, onToggleSolved, onToggleBookmark, onSaveComment }) => {
    const navigate = useNavigate();

    // State
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

    const allQuestions = topics.flatMap(t => t.questions);
    const totalSolved = allQuestions.filter(q => q.solved).length;
    const totalQuestions = allQuestions.length;
    const overallProgress = Math.round((totalSolved / totalQuestions) * 100) || 0;



    // Data for Radar Chart (Topic Mastery)
    const radarData = useMemo(() => {
        return topics
            .filter(t => t.questions.length > 0)
            .map(t => {
                const solved = t.questions.filter(q => q.solved).length;
                return {
                    subject: t.topicName.length > 10 ? t.topicName.substring(0, 8) + '..' : t.topicName,
                    fullName: t.topicName,
                    A: Math.round((solved / t.questions.length) * 100),
                    fullMark: 100
                };
            })
            .slice(0, 8); // Just show top 8 for clarity
    }, [topics]);

    // Data for Pie Chart (Difficulty Distribution)
    const pieData = useMemo(() => {
        const easy = allQuestions.filter(q => q.difficulty === 'Easy').length;
        const medium = allQuestions.filter(q => q.difficulty === 'Medium').length;
        const hard = allQuestions.filter(q => q.difficulty === 'Hard').length;
        return [
            { name: 'Easy', value: easy, color: '#10b981' },
            { name: 'Medium', value: medium, color: '#f59e0b' },
            { name: 'Hard', value: hard, color: '#ef4444' }
        ];
    }, [allQuestions]);

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

    const sortedTopics = [...topics].sort((a, b) => {
        const ai = TOPIC_ORDER.indexOf(a.id);
        const bi = TOPIC_ORDER.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    const activeSearch = searchTerm || '';
    const isSearching = activeSearch.length > 0;

    // Get matching questions for search mode
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

    return (
        <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '100%' }}>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.5rem' }}
            >
                <h1 className="section-title" style={{ margin: 0, fontSize: '2.2rem' }}>Preparation Analytics</h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>A deep dive into your DSA mastery and progress.</p>
            </motion.header>

            {/* Bento Grid Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(2, 220px)',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {/* Large Main Stat Card */}
                <div className="glass-card" style={{
                    gridColumn: 'span 2',
                    gridRow: 'span 2',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}>
                        <Trophy size={200} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Overall Progress</div>
                    <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{overallProgress}<span style={{ fontSize: '2rem', color: '#cbd5e1' }}>%</span></div>
                    <div style={{ marginTop: '1.5rem', width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #60a5fa)', borderRadius: '6px' }}
                        />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>{totalSolved} Solved</span>
                        <span>{totalQuestions - totalSolved} To Go</span>
                    </div>
                </div>

                {/* Radar Chart Tile (Large 2x2) */}
                <div className="glass-card" style={{ gridColumn: 'span 2', gridRow: 'span 2', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Skill Mastery Radar</div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <Radar
                                    name="Progress"
                                    dataKey="A"
                                    stroke="var(--primary)"
                                    fill="var(--primary)"
                                    fillOpacity={0.5}
                                />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* Study Plan Section */}
            {(() => {
                const remainingQuestions = totalQuestions - totalSolved;
                const completionDate = new Date();
                completionDate.setDate(completionDate.getDate() + remainingQuestions);
                const formattedDate = completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                const progressPercent = Math.round((totalSolved / totalQuestions) * 100) || 0;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            padding: '2rem',
                            marginBottom: '3rem',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            border: '1px solid #e2e8f0',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', right: '-30px', top: '-30px', opacity: 0.03, transform: 'rotate(15deg)' }}>
                            <Calendar size={240} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '8px', background: 'var(--primary)', color: 'white', borderRadius: '10px' }}>
                                        <TrendingUp size={20} />
                                    </div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Flexible Study Plan</h2>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '500px' }}>
                                    Targeting <strong>1 question per day</strong> baseline. You have <strong>{remainingQuestions}</strong> questions remaining out of <strong>{totalQuestions}</strong>, with an estimated completion by <strong>{formattedDate}</strong>.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Daily Goal</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            1 Question <Zap size={16} color="#f59e0b" fill="#f59e0b" />
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Monthly Target</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>30 Questions</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Course Completion Progress</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{progressPercent}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                                    </div>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <Flag size={14} /> Total Progress: {totalSolved} / {totalQuestions}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1, padding: '1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px dotted #bae6fd', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Calendar size={18} color="#0369a1" />
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Days Left</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0c4a6e' }}>{remainingQuestions} Days</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px dotted #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={18} color="#15803d" />
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Status</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#064e3b' }}>{totalSolved > 0 ? "Ahead of Plan" : "Level 1 Start"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })()}


            {/* Quick Difficulty Stats (Compact) */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Easy', color: '#10b981', ...easy },
                    { label: 'Medium', color: '#f59e0b', ...medium },
                    { label: 'Hard', color: '#ef4444', ...hard }
                ].map(d => (
                    <div key={d.label} className="glass-card" style={{ flex: 1, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${d.color}` }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: d.color, textTransform: 'uppercase' }}>{d.label}</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{d.solved}<span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>/{d.total}</span></div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ marginBottom: '3rem' }}>
                {isSearching ? (
                    matchedQuestions.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <Search size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p style={{ fontWeight: 600 }}>No results found for <strong>"{activeSearch}"</strong></p>
                        </div>
                    ) : (
                        <div>
                            {matchedQuestions.map((q, i) => (
                                <motion.div
                                    key={`${q.topicId}-${q.id}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.01 }}
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
                            ))}
                        </div>
                    )
                ) : (
                    <motion.div
                        layout
                        className="stagger-grid"
                    >
                        {sortedTopics.map((topic) => (
                            <TopicCard key={topic.id} topic={topic} />
                        ))}
                    </motion.div>
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

export default Dashboard;
