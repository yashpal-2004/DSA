import React, { useMemo } from 'react';
import { Target, Calendar } from 'lucide-react';

const TargetWidget = ({ topics }) => {
    const targetDate = new Date('2026-12-31T23:59:59');
    
    const stats = useMemo(() => {
        // Only include the initial 464 questions (topics not starting with 'babbar' and not leetcode-top-150-plus)
        const coreTopics = topics.filter(t => !t.id.startsWith('babbar') && t.id !== 'leetcode-top-150-plus');
        
        const now = new Date();
        const diffTime = targetDate - now;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        let total = 0;
        let solved = 0;
        
        coreTopics.forEach(topic => {
            total += topic.questions.length;
            solved += topic.questions.filter(q => q.solved).length;
        });
        
        const remaining = total - solved;
        const perDay = remaining > 0 ? (remaining / diffDays).toFixed(2) : 0;
        
        return {
            diffDays,
            remaining,
            perDay,
            total,
            solved
        };
    }, [topics]);

    return (
        <div style={{
            position: 'fixed',
            top: '1.5rem',
            right: '2rem',
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
            <div className="glass-card" style={{
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'auto',
                animation: 'slideIn 0.5s ease-out'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <Target size={10} color="var(--primary)" />
                        Target:- 31st Dec 2026
                    </div>
                    <div style={{
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        color: 'var(--text-main)',
                        marginTop: '1px'
                    }}>
                        <span style={{ color: 'var(--primary)' }}>{stats.perDay}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '3px', fontWeight: 600 }}>Q/Day</span>
                    </div>
                </div>
                
                <div style={{
                    width: '1px',
                    height: '20px',
                    background: 'var(--border)'
                }}></div>
                
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {stats.remaining}
                    </div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Left
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default TargetWidget;
