import React, { useMemo, useState, useEffect } from 'react';
import { Target, Clock } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { videosData } from '../data/a2zData';

const TargetWidget = ({ topics }) => {
    const targetDate = new Date('2026-12-31T23:59:59');
    const [a2zCompleted, setA2zCompleted] = useState({});

    // Firebase real-time subscription for A2Z DSA sheet progress
    useEffect(() => {
        const a2zFirebaseConfig = {
            apiKey: "AIzaSyBQF_MD3goWyEdF-CLKbIS6yStN9yD_ypg",
            authDomain: "dsa-450-4fa5e.firebaseapp.com",
            projectId: "dsa-450-4fa5e",
            storageBucket: "dsa-450-4fa5e.firebasestorage.app",
            messagingSenderId: "363783581030",
            appId: "1:363783581030:web:4b354091054db1c151eca7",
            measurementId: "G-5E57MSK5ZL"
        };

        try {
            const a2zApp = getApps().find(app => app.name === 'a2z_dsa') 
                || initializeApp(a2zFirebaseConfig, 'a2z_dsa');
            const a2zDb = getFirestore(a2zApp);

            const docRef = doc(a2zDb, 'users', 'shared_global_user');
            const unsubscribe = onSnapshot(docRef, (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setA2zCompleted(data.completed || {});
                }
            }, (err) => {
                console.warn("Failed to listen to a2z progress in widget:", err);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Firebase init failed in TargetWidget:", err);
        }
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const diffTime = targetDate - now;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // 1. Q Stats (from core topics)
        const coreTopics = topics.filter(t => !t.id.startsWith('babbar') && t.id !== 'leetcode-top-150-plus');
        let totalQ = 0;
        let solvedQ = 0;
        coreTopics.forEach(topic => {
            totalQ += topic.questions.length;
            solvedQ += topic.questions.filter(q => q.solved).length;
        });
        const remainingQ = totalQ - solvedQ;
        const perDayQ = remainingQ > 0 ? (remainingQ / diffDays).toFixed(2) : 0;

        // 2. V Stats (from A2Z videosData)
        const totalV = videosData.length;
        const completedVCount = Object.keys(a2zCompleted).length;
        const remainingV = totalV - completedVCount;
        const perDayV = remainingV > 0 ? (remainingV / diffDays).toFixed(2) : 0;

        // Remaining watch duration
        const remainingDurationSec = videosData
            .filter(v => !a2zCompleted[v.id])
            .reduce((acc, v) => acc + (v.duration || 0), 0);

        const remainingMinutesPerDay = remainingDurationSec > 0 ? (remainingDurationSec / 60) / diffDays : 0;
        
        let dailyTimeV = '';
        if (remainingMinutesPerDay > 0) {
            const mins = Math.ceil(remainingMinutesPerDay);
            if (mins < 60) {
                dailyTimeV = `${mins}m/Day`;
            } else {
                const hrs = Math.floor(mins / 60);
                const remainingMins = mins % 60;
                dailyTimeV = remainingMins > 0 ? `${hrs}h ${remainingMins}m/Day` : `${hrs}h/Day`;
            }
        } else {
            dailyTimeV = '0m/Day';
        }

        return {
            diffDays,
            remainingQ,
            perDayQ,
            remainingV,
            perDayV,
            dailyTimeV
        };
    }, [topics, a2zCompleted]);

    return (
        <div style={{
            position: 'fixed',
            top: '1.5rem',
            right: '2rem',
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
            <div className="glass-card" style={{
                padding: '0.5rem 0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'auto',
                animation: 'slideIn 0.5s ease-out',
                width: '260px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.25rem'
                }}>
                    <Target size={10} color="var(--primary)" />
                    <span>Target:- 31st Dec 2026</span>
                </div>

                {/* Grid Layout to align rate and counts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr auto 1fr', gap: '0.6rem', alignItems: 'center' }}>
                    {/* Left Column: Rates */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {/* Q Rate */}
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                            <span style={{ color: 'var(--primary)' }}>{stats.perDayQ}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>Q/Day</span>
                        </div>
                        
                        {/* V Rate */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                <span style={{ color: 'var(--primary)' }}>{stats.perDayV}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>V/Day</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>
                                <Clock size={9} />
                                <span>{stats.dailyTimeV}</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Vertical Divider */}
                    <div style={{ width: '1px', alignSelf: 'stretch', background: '#e2e8f0' }}></div>

                    {/* Right Column: Remaining Counts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                        {/* Q Remaining */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                {stats.remainingQ}
                            </div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Q Left
                            </div>
                        </div>
                        
                        {/* V Remaining */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                {stats.remainingV}
                            </div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                V Left
                            </div>
                        </div>
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
