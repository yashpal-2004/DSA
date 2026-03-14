import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Flame, History, Award, Info, Hash, ChevronRight, Zap } from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { submissionData } from '../data/submissions';

const ActivityTracker = ({ topics }) => {
    // Streak renews at 5 AM
    const FIVE_AM_OFFSET_MS = 5 * 60 * 60 * 1000;

    const initialTopics = useMemo(() => {
        // Only include original 464 questions for the stats breakdown
        return topics.filter(t => !t.id.startsWith('babbar') && t.id !== 'leetcode-top-150-plus');
    }, [topics]);

    const getLogicalDateStr = (dateInput) => {
        const d = new Date(dateInput);
        return new Date(d.getTime() - FIVE_AM_OFFSET_MS).toISOString().split('T')[0];
    };

    // 1. Extract all solved questions with logical dates from ALL TOPICS (dynamic updates)
    const activityFromTopics = useMemo(() => {
        const solvedQuestions = [];
        topics.forEach(topic => {
            topic.questions.forEach(q => {
                if (q.solved && q.solvedAt) {
                    const qDate = new Date(q.solvedAt);
                    solvedQuestions.push({
                        ...q,
                        topicName: topic.topicName,
                        topicId: topic.id,
                        logicalDate: getLogicalDateStr(qDate),
                        timestamp: qDate.getTime()
                    });
                }
            });
        });
        return solvedQuestions;
    }, [topics]);

    // 2. Combine with submissionData
    const allActivity = useMemo(() => {
        const combined = [];
        const processedIds = new Set();

        // 1. Add everything from submissionData first (reliable historical dates)
        submissionData.forEach(s => {
            if (s.status === 'Accepted' && !processedIds.has(String(s.id))) {
                combined.push({
                    id: s.id,
                    title: s.title,
                    difficulty: s.difficulty,
                    logicalDate: s.date,
                    timestamp: new Date(s.date).getTime(),
                    fromSubmission: true
                });
                processedIds.add(String(s.id));
            }
        });

        // 2. Add from topics only if the question is NOT in submissionData
        // (This catches new solves or things not synced yet)
        activityFromTopics.forEach(q => {
            if (!processedIds.has(String(q.id))) {
                combined.push(q);
                processedIds.add(String(q.id));
            }
        });

        const grouped = combined.reduce((acc, q) => {
            const dateStr = q.logicalDate;
            if (!acc[dateStr]) acc[dateStr] = { questions: [], timestamp: q.timestamp };
            acc[dateStr].questions.push(q);
            if (q.timestamp > acc[dateStr].timestamp) acc[dateStr].timestamp = q.timestamp;
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([date, data]) => ({
                date,
                ...data
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [activityFromTopics]);

    // Heatmap Data (last 12 months)
    const heatmapData = useMemo(() => {
        const data = {};
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            data[dateStr] = 0;
        }

        allActivity.forEach(day => {
            if (data[day.date] !== undefined) {
                data[day.date] = day.questions.length;
            }
        });

        return data;
    }, [allActivity]);

    // Dynamic Stats for the 464 questions circle card
    const stats = useMemo(() => {
        const allQuestions = initialTopics.flatMap(t => t.questions);
        const easy = allQuestions.filter(q => q.difficulty === 'Easy');
        const medium = allQuestions.filter(q => q.difficulty === 'Medium');
        const hard = allQuestions.filter(q => q.difficulty === 'Hard');

        return {
            total: allQuestions.length,
            solved: allQuestions.filter(q => q.solved).length,
            easy: { solved: easy.filter(q => q.solved).length, total: easy.length },
            medium: { solved: medium.filter(q => q.solved).length, total: medium.length },
            hard: { solved: hard.filter(q => q.solved).length, total: hard.length }
        };
    }, [initialTopics]);

    // Dynamic Activity Stats
    const activityStats = useMemo(() => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

        const lastYearActivity = allActivity.filter(day => day.date >= oneYearAgoStr);
        // Count unique questions solved in the past year
        const totalSubmissions = lastYearActivity.reduce((acc, day) => acc + day.questions.length, 0);
        const activeDaysCount = lastYearActivity.length;

        // Calculate Max Streak
        // Sort all activity by date ascending
        const sortedDates = allActivity.map(day => day.date).sort();
        let currentStreak = 0;
        let maxStreak = 0;
        let lastDate = null;

        sortedDates.forEach(dateStr => {
            const currentDate = new Date(dateStr);
            if (lastDate) {
                const diffTime = Math.abs(currentDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            lastDate = currentDate;
        });

        return {
            totalSubmissions,
            activeDaysCount,
            maxStreak
        };
    }, [allActivity]);

    const pieProgressData = [
        { name: 'Solved', value: stats.solved, color: '#f59e0b' },
        { name: 'Remaining', value: Math.max(0, stats.total - stats.solved), color: '#e2e8f0' }
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Zap size={24} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Activity Hub</span>
                </div>
                <h1 className="section-title">Preparation Timeline</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                    Track your LeetCode journey, badges, and consistency patterns.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Solved Summary Card */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '4rem', background: 'white', justifyContent: 'center' }}>
                    <div style={{ width: '220px', height: '160px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieProgressData}
                                    cx="50%"
                                    cy="70%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    startAngle={210}
                                    endAngle={-30}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieProgressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.solved}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/{stats.total}</span></div>
                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginTop: '-4px' }}>✓ Solved</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '240px' }}>
                        <DifficultyRow label="Easy" solved={stats.easy.solved} total={stats.easy.total} color="#10b981" />
                        <DifficultyRow label="Medium" solved={stats.medium.solved} total={stats.medium.total} color="#f59e0b" />
                        <DifficultyRow label="Hard" solved={stats.hard.solved} total={stats.hard.total} color="#ef4444" />
                    </div>
                </div>
            </div>

            {/* Heatmap Card */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', background: 'white', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', minWidth: '600px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{activityStats.totalSubmissions} <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>submissions in the past one year</span></div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        <span>Total active days: {activityStats.activeDaysCount}</span>
                        <span>Max streak: {activityStats.maxStreak}</span>
                    </div>
                </div>
                
                <SubmissionHeatmap data={heatmapData} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Less</span>
                       {[0, 1, 2, 3, 4].map(level => (
                           <div key={level} style={{ width: '10px', height: '10px', borderRadius: '2px', background: getHeatColor(level) }}></div>
                       ))}
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>More</span>
                   </div>
                </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, var(--primary), var(--bg-dark) 80%)', borderRadius: '4px' }}></div>

                {allActivity.length === 0 ? (
                    <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <History size={60} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>No Activity Yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Solve your first question to start the timeline!</p>
                    </div>
                ) : (
                    allActivity.map((day, idx) => (
                        <TimelineDay key={day.date} day={day} idx={idx} />
                    ))
                )}
            </div>
        </div>
    );
};

const DifficultyRow = ({ label, solved, total, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.8rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color }}>{label}</span>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{solved}<span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/{total}</span></div>
    </div>
);

const getHeatColor = (count) => {
    if (count === 0) return '#f1f5f9';
    if (count === 1) return '#dcfce7'; 
    if (count === 2) return '#86efac';
    if (count === 3) return '#22c55e';
    return '#10b981';
};

const SubmissionHeatmap = ({ data }) => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const weeks = [];
    let currentWeek = [];
    const startDate = new Date();
    startDate.setDate(today.getDate() - (52 * 7 + today.getDay())); 

    const dayIterator = new Date(startDate);
    
    for (let i = 0; i < 53 * 7; i++) {
        const dateStr = dayIterator.toISOString().split('T')[0];
        const count = data[dateStr] || 0;
        currentWeek.push({ date: dateStr, count, day: dayIterator.getDay() });
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        dayIterator.setDate(dayIterator.getDate() + 1);
    }

    return (
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '750px' }}>
                <div style={{ display: 'flex', marginBottom: '8px', paddingLeft: '35px' }}>
                    {weeks.map((week, i) => {
                        const firstDay = new Date(week[0].date);
                        if (i > 0 && firstDay.getDate() <= 7) {
                            return <div key={i} style={{ minWidth: '13px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{months[firstDay.getMonth()]}</div>
                        }
                        return <div key={i} style={{ minWidth: '13px' }}></div>
                    })}
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '10px', width: '25px' }}>
                        <div style={{ height: '10px' }}></div>
                        <div style={{ height: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mon</div>
                        <div style={{ height: '10px' }}></div>
                        <div style={{ height: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Wed</div>
                        <div style={{ height: '10px' }}></div>
                        <div style={{ height: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Fri</div>
                        <div style={{ height: '10px' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '3px' }}>
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {week.map((day, dIdx) => (
                                    <div 
                                        key={dIdx}
                                        style={{ 
                                            width: '10px', 
                                            height: '10px', 
                                            background: getHeatColor(day.count), 
                                            borderRadius: '2px',
                                            border: day.count === 0 ? '1px solid #e2e8f0' : 'none'
                                        }}
                                        title={`${day.date}: ${day.count} submissions`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimelineDay = ({ day, idx }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.01 }}
        viewport={{ once: true }}
        style={{ marginBottom: '3rem', position: 'relative' }}
    >
        <div style={{
            position: 'absolute',
            left: '-23px',
            top: '8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'white',
            border: `3px solid ${idx === 0 ? 'var(--primary)' : 'var(--border)'}`,
            zIndex: 1,
            boxShadow: idx === 0 ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
        }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{day.date}</span>
                <div style={{ padding: '4px 12px', background: '#f0fdf4', color: '#10b981', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #dcfce7' }}>
                    {day.questions.length} Question{day.questions.length !== 1 ? 's' : ''} Solved
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {day.questions.map((q, i) => (
                    <motion.div
                        key={`${q.id}-${i}`}
                        whileHover={{ x: 5 }}
                        className="glass-card"
                        style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'white' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: 0 }}>
                            <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{q.topicName || 'LeetCode Submission'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                           <span className={`badge badge-${(q.difficulty || 'Easy').toLowerCase().replace('.','').replace('med','medium')}`} style={{ fontSize: '0.65rem' }}>{q.difficulty || 'Easy'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.div>
);

export default ActivityTracker;
