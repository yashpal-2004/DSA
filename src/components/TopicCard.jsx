import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const TopicCard = ({ topic, customPath }) => {
    const navigate = useNavigate();
    const solvedCount = topic.questions.filter(q => q.solved).length;
    const totalCount = topic.questions.length;
    const progress = Math.round((solvedCount / totalCount) * 100) || 0;

    // Difficulty breakdown
    const getDiffCount = (diff) => ({
        solved: topic.questions.filter(q => q.difficulty === diff && q.solved).length,
        total: topic.questions.filter(q => q.difficulty === diff).length
    });

    const easy = getDiffCount('Easy');
    const medium = getDiffCount('Medium');
    const hard = getDiffCount('Hard');

    // Most recently solved question
    const solvedQuestions = topic.questions
        .filter(q => q.solved && q.solvedAt)
        .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
    const lastSolved = solvedQuestions[0] || null;

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            className="glass-card"
            onClick={() => navigate(customPath ? `${customPath}/${topic.id}` : `/topic/${topic.id}`)}
            style={{
                padding: '1.75rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                minHeight: '260px',
                position: 'relative',
                overflow: 'hidden',
                background: 'white'
            }}
        >
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'var(--primary)',
                opacity: 0.03,
                borderRadius: '50%',
            }}></div>

            <header>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{topic.topicName}</h3>
                <p style={{ fontSize: '0.85rem', color: progress === 100 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                    {progress === 100
                        ? '🎉 Completed'
                        : `${totalCount - solvedCount} to go`}
                </p>
            </header>

            <main style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>{progress}%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                            borderRadius: '4px'
                        }}
                    ></motion.div>
                </div>

                {/* Difficulty Breakdown Row */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    {[
                        { label: 'E', color: '#10b981', ...easy },
                        { label: 'M', color: '#f59e0b', ...medium },
                        { label: 'H', color: '#ef4444', ...hard }
                    ].map(d => (
                        <div key={d.label} style={{ flex: 1, background: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: d.color, marginBottom: '2px' }}>{d.label}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{d.solved}<span style={{ color: '#cbd5e1', fontWeight: 500 }}>/{d.total}</span></div>
                        </div>
                    ))}
                </div>
            </main>

            <footer style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: progress === 100 ? '#10b981' : 'var(--text-main)',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                    }}>
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                        <span>{solvedCount}/{totalCount} TOTAL</span>
                    </div>
                    <div style={{
                        background: '#f8fafc',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                        color: 'var(--primary)'
                    }}>
                        <ArrowRight size={18} />
                    </div>
                </div>

                {lastSolved ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.6rem',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        border: '1px solid #d1fae5'
                    }}>
                        <Clock size={10} color="#10b981" />
                        <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            Last: {lastSolved.title}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: '#6ee7b7', fontWeight: 600, marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {formatDate(lastSolved.solvedAt)}
                        </span>
                    </div>
                ) : null}
            </footer>
        </motion.div>
    );
};

export default TopicCard;
