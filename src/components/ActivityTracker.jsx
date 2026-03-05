import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Flame, History, Award, Info, Hash } from 'lucide-react';

const ActivityTracker = ({ topics }) => {
    // Streak renews at 5 AM
    const FIVE_AM_OFFSET_MS = 5 * 60 * 60 * 1000;

    const getLogicalDateStr = (dateInput) => {
        const d = new Date(dateInput);
        return new Date(d.getTime() - FIVE_AM_OFFSET_MS).toLocaleDateString();
    };

    // 1. Extract all solved questions with logical dates
    const activityData = useMemo(() => {
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

        // Group by logical date
        const grouped = solvedQuestions.reduce((acc, q) => {
            const dateStr = q.logicalDate;
            if (!acc[dateStr]) acc[dateStr] = { questions: [], timestamp: q.timestamp };
            acc[dateStr].questions.push(q);
            // Keep the latest timestamp for sorting
            if (q.timestamp > acc[dateStr].timestamp) acc[dateStr].timestamp = q.timestamp;
            return acc;
        }, {});

        // Convert to array and sort by date descending
        return Object.entries(grouped)
            .map(([date, data]) => ({
                date,
                ...data
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [topics]);

    // Calculate Stats
    const totalSolved = activityData.reduce((sum, day) => sum + day.questions.length, 0);
    const activeDays = activityData.length;
    const maxInDay = activityData.length > 0 ? Math.max(...activityData.map(d => d.questions.length)) : 0;

    // Streak logic with 5 AM boundary
    const streak = useMemo(() => {
        if (activityData.length === 0) return 0;

        const activityDates = activityData.map(d => d.date);
        const logicalToday = getLogicalDateStr(new Date());
        const logicalYesterday = getLogicalDateStr(new Date(Date.now() - 86400000));

        let currentStreak = 0;
        let checkDateObj = null;

        if (activityDates.includes(logicalToday)) {
            checkDateObj = new Date();
        } else if (activityDates.includes(logicalYesterday)) {
            checkDateObj = new Date(Date.now() - 86400000);
        }

        if (!checkDateObj) return 0;

        while (true) {
            const dateStr = getLogicalDateStr(checkDateObj);
            if (activityDates.includes(dateStr)) {
                currentStreak++;
                // Move back 24 hours
                checkDateObj = new Date(checkDateObj.getTime() - 86400000);
            } else {
                break;
            }
        }
        return currentStreak;
    }, [activityData]);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            {/* Page Header */}
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.6rem', background: '#eff6ff', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Flame size={24} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Consistency Booster</span>
                </div>
                <h1 className="section-title">Preparation Roadmap</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                    Visualize your daily progress and patterns. Consistency is the secret ingredient to mastering DSA.
                    <span style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>Note: New days start at 5:00 AM.</span>
                </p>
            </header>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                <StatsCard
                    label="Current Streak"
                    value={`${streak} Days`}
                    icon={<Flame size={28} color="#f59e0b" />}
                    sub="Don't break the chain!"
                    color="#fef3c7"
                    borderColor="#fde68a"
                />
                <StatsCard
                    label="Total Solved"
                    value={totalSolved}
                    icon={<Award size={28} color="#10b981" />}
                    sub="Overall contribution"
                    color="#f0fdf4"
                    borderColor="#dcfce7"
                />
                <StatsCard
                    label="Active Days"
                    value={activeDays}
                    icon={<Calendar size={28} color="#3b82f6" />}
                    sub="Days with submissions"
                    color="#eff6ff"
                    borderColor="#dbeafe"
                />
                <StatsCard
                    label="Daily Best"
                    value={maxInDay}
                    icon={<CheckCircle2 size={28} color="#8b5cf6" />}
                    sub="Maximum in 24 hours"
                    color="#f5f3ff"
                    borderColor="#ddd6fe"
                />
            </div>

            {/* Timeline Roadmap */}
            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, var(--primary), #e2e8f0 80%)', borderRadius: '4px' }}></div>

                {activityData.length === 0 ? (
                    <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <History size={60} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>No Activity Yet</h3>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Solve your first question to start the timeline!</p>
                    </div>
                ) : (
                    activityData.map((day, idx) => (
                        <TimelineDay key={day.date} day={day} idx={idx} />
                    ))
                )}
            </div>
        </div>
    );
};

const StatsCard = ({ label, value, icon, sub, color, borderColor }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card"
        style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}
    >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '56px', height: '56px', background: color, border: `1px solid ${borderColor}`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</div>
            </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={14} />
            {sub}
        </div>
    </motion.div>
);

const TimelineDay = ({ day, idx }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05 }}
        viewport={{ once: true }}
        style={{ marginBottom: '3rem', position: 'relative' }}
    >
        {/* Dot on line */}
        <div style={{
            position: 'absolute',
            left: '-23px',
            top: '8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'white',
            border: `4px solid ${idx === 0 ? 'var(--primary)' : '#cbd5e1'}`,
            zIndex: 1,
            boxShadow: idx === 0 ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
        }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{day.date}</span>
                <div style={{ padding: '4px 12px', background: '#f0fdf4', color: '#10b981', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #dcfce7' }}>
                    {day.questions.length} Question{day.questions.length !== 1 ? 's' : ''} Solved
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {day.questions.map((q) => (
                    <motion.div
                        key={q.id}
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
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{q.topicName}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                                <Hash size={12} style={{ marginRight: '2px' }} />
                                {q.id}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.div>
);

export default ActivityTracker;
