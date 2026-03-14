import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Flag, Zap, CheckCircle, Target, ArrowRight, BookOpen, Clock, ChevronDown, ChevronUp, Circle, List } from 'lucide-react';
import { submissionData } from '../data/submissions';

const StudyPlan = ({ topics }) => {
    // Only include the initial 464 questions for the study plan
    const coreTopics = useMemo(() => topics.filter(t => !t.id.startsWith('babbar') && t.id !== 'leetcode-top-150-plus'), [topics]);
    const allQuestions = useMemo(() => coreTopics.flatMap(t => t.questions), [coreTopics]);
    
    const totalSolved = allQuestions.filter(q => q.solved).length;
    const totalQuestions = allQuestions.length;
    
    const remainingQuestions = totalQuestions - totalSolved;
    const targetDate = new Date('2026-12-31T23:59:59');
    const now = new Date();
    const diffDays = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    const perDay = remainingQuestions > 0 ? (remainingQuestions / diffDays).toFixed(2) : 0;
    const progressPercent = Math.round((totalSolved / totalQuestions) * 100) || 0;

    const [expandedMonth, setExpandedMonth] = React.useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    const monthlyPlan = useMemo(() => {
        const months = [];
        const startOfYear = new Date('2026-01-01');
        const endOfYear = new Date('2026-12-31');
        
        // Group all solved questions by month/week (aligned with ActivityTracker logic)
        const solvedGrouped = {};
        const processedIds = new Set();

        // 1. Add from submissionData (historical)
        submissionData.forEach(s => {
            if (s.status === 'Accepted' && !processedIds.has(String(s.id))) {
                const date = new Date(s.date);
                if (date.getFullYear() === 2026) {
                    const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    const day = date.getDate();
                    const weekIdx = Math.min(3, Math.floor((day - 1) / 7));

                    if (!solvedGrouped[monthKey]) solvedGrouped[monthKey] = { total: 0, weeks: [0, 0, 0, 0] };
                    solvedGrouped[monthKey].total++;
                    solvedGrouped[monthKey].weeks[weekIdx]++;
                }
                processedIds.add(String(s.id));
            }
        });

        // 2. Add from topics (catch dynamic updates)
        topics.forEach(topic => {
            topic.questions.forEach(q => {
                if (q.solved && q.solvedAt && !processedIds.has(String(q.id))) {
                    const date = new Date(q.solvedAt);
                    if (date.getFullYear() === 2026) {
                        const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                        const day = date.getDate();
                        const weekIdx = Math.min(3, Math.floor((day - 1) / 7));

                        if (!solvedGrouped[monthKey]) solvedGrouped[monthKey] = { total: 0, weeks: [0, 0, 0, 0] };
                        solvedGrouped[monthKey].total++;
                        solvedGrouped[monthKey].weeks[weekIdx]++;
                    }
                    processedIds.add(String(q.id));
                }
            });
        });

        let tempDate = new Date(startOfYear);
        while (tempDate <= endOfYear) {
            const monthLabel = tempDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            // Calculate Target for future months
            let monthTarget = 0;
            const isPast = tempDate < new Date(now.getFullYear(), now.getMonth(), 1);
            const isCurrent = tempDate.getMonth() === now.getMonth() && tempDate.getFullYear() === now.getFullYear();

            if (isCurrent || !isPast) {
                let daysToConsider;
                if (isCurrent) {
                    const lastDay = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
                    daysToConsider = Math.max(1, lastDay - now.getDate() + 1);
                } else {
                    daysToConsider = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
                }
                monthTarget = Math.round(perDay * daysToConsider);
            }

            const achieved = solvedGrouped[monthLabel] || { total: 0, weeks: [0, 0, 0, 0] };
            
            const weeks = [];
            const questionsPerWeek = Math.floor(monthTarget / 4);
            const extra = monthTarget % 4;

            for(let i=1; i<=4; i++) {
                weeks.push({
                    label: `Week ${i}`,
                    target: monthTarget > 0 ? (questionsPerWeek + (i <= extra ? 1 : 0)) : 0,
                    achieved: achieved.weeks[i-1] || 0
                });
            }

            months.push({
                month: monthLabel,
                target: monthTarget,
                achieved: achieved.total,
                weeks,
                isPast,
                isCurrent
            });
            
            tempDate.setMonth(tempDate.getMonth() + 1);
        }
        return months;
    }, [topics, now, perDay]);

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '3rem' }}
            >
                <div>
                    <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Personalized Study Plan</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>Data-driven strategy to master DSA by Dec 2026</p>
                </div>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    padding: '3rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '3rem'
                }}
            >
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.03, transform: 'rotate(15deg)' }}>
                    <Calendar size={320} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: '1 1 500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '14px', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Flexible Goal tracking</h2>
                        </div>
                        
                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '600px' }}>
                            To successfully cover all <strong>{totalQuestions} questions</strong> in the master sheet before your deadline, you need to maintain a steady pace. Currently, you have <strong>{remainingQuestions}</strong> questions left.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Daily Baseline</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {perDay} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Q/Day</span>
                                    <Zap size={20} color="#f59e0b" fill="#f59e0b" />
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Weekly Target</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                    {(perDay * 7).toFixed(1)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Questions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Total Roadmap Progress</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', background: '#eff6ff', padding: '4px 12px', borderRadius: '10px' }}>{progressPercent}%</span>
                            </div>
                            <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '7px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #60a5fa)', borderRadius: '7px' }} 
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                <Flag size={18} color="var(--primary)" /> 
                                <span>Completed <strong>{totalSolved}</strong> of <strong>{totalQuestions}</strong> fundamental questions</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ flex: 1, padding: '1.5rem', background: '#f0f9ff', borderRadius: '20px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} color="#0369a1" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Time Horizon</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0c4a6e' }}>{diffDays} <span style={{ fontSize: '0.9rem', color: '#0369a1' }}>Days</span></div>
                            </div>
                            <div style={{ flex: 1, padding: '1.5rem', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={16} color="#15803d" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Status</span>
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#064e3b' }}>{totalSolved > 0 ? "Ahead of Plan" : "Starting Up"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '10px', background: 'var(--primary)', color: 'white', borderRadius: '12px' }}>
                        <List size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>2026 Monthly Roadmap</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {monthlyPlan.map((m) => (
                        <motion.div
                            key={m.month}
                            initial={false}
                            className="glass-card"
                            style={{
                                padding: '0',
                                overflow: 'hidden',
                                border: expandedMonth === m.month ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                                background: expandedMonth === m.month ? 'white' : (m.isPast ? '#f1f5f9' : '#f8fafc'),
                                boxShadow: expandedMonth === m.month ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : 'none',
                                cursor: 'pointer',
                                opacity: m.isPast && expandedMonth !== m.month ? 0.7 : 1
                            }}
                            onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                        >
                            <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                    <div style={{ minWidth: '160px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: expandedMonth === m.month ? 'var(--primary)' : '#1e293b' }}>
                                            {m.month}
                                            {m.isCurrent && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>CURRENT</span>}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginTop: '4px' }}>
                                            {m.target > 0 ? `Target: ${m.target}` : 'No Target'}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Achieved</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: m.achieved >= m.target && m.target > 0 ? '#10b981' : '#1e293b' }}>{m.achieved}</div>
                                        </div>
                                        
                                        {m.target > 0 && (
                                            <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${Math.min(100, Math.round((m.achieved/m.target)*100))}%`, 
                                                    height: '100%', 
                                                    background: m.achieved >= m.target ? '#10b981' : 'var(--primary)', 
                                                    borderRadius: '4px' 
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    {expandedMonth === m.month ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="#94a3b8" />}
                                </div>
                            </div>

                            {expandedMonth === m.month && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    style={{ padding: '0 2rem 2rem 2rem', borderTop: '1px solid #f1f5f9' }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                                        {m.weeks.map((w, idx) => (
                                            <div key={idx} style={{ 
                                                padding: '1.25rem 1rem', 
                                                background: '#ffffff', 
                                                borderRadius: '16px', 
                                                border: '1px solid #f1f5f9', 
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', 
                                                textAlign: 'center',
                                                position: 'relative'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{w.label}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e293b' }}>{w.achieved}</div>
                                                    <div style={{ height: '1px', background: '#e2e8f0', width: '40%', margin: '4px auto' }} />
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}>{w.target > 0 ? w.target : '-'}</div>
                                                </div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#cbd5e1', marginTop: '4px', textTransform: 'uppercase' }}>Achieved / Target</div>
                                                
                                                {w.achieved >= w.target && w.target > 0 && (
                                                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                        <CheckCircle size={14} color="#10b981" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: 'linear-gradient(to right, #f0fdf4, #ffffff)', borderRadius: '16px', border: '1px dashed #bbf7d0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '8px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                <TrendingUp size={18} color="#15803d" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14532d' }}>Performance Insight</div>
                                                <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                                                    {m.achieved >= m.target && m.target > 0 ? 
                                                        `Excellent work! You've exceeded your target for ${m.month.split(' ')[0]} by ${m.achieved - m.target} questions.` : 
                                                        `You have achieved ${m.achieved} questions so far. ${m.target > m.achieved ? `Keep pushing to reach your goal of ${m.target}!` : ''}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Target size={20} color="var(--primary)" />
                        Strategic Milestones
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>By following this roadmap, you'll cover all fundamental data structures by June and master advanced algorithms by December.</p>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Zap size={20} color="#f59e0b" />
                        Consistency is Key
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Maintain your <strong>{perDay} questions/day</strong> streak. Missing even a few days can significantly increase your workload later.</p>
                </div>
            </div>
        </div>
    );
};

export default StudyPlan;
