import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Target, Trophy, Search, Play, CheckCircle, 
    ExternalLink, RotateCcw, Award, Calendar, List, 
    X, Sparkles, Film, ArrowLeft, Check, Flame,
    ArrowRight, Bookmark, Zap, Cpu, Crown
} from 'lucide-react';
import { videosData } from '../data/a2zData';
import { getLeetCodeNumber } from '../data/a2zLeetcodeMap';

// ---- Firebase Configuration for A2Z DSA ----
const a2zFirebaseConfig = {
    apiKey: "AIzaSyBQF_MD3goWyEdF-CLKbIS6yStN9yD_ypg",
    authDomain: "dsa-450-4fa5e.firebaseapp.com",
    projectId: "dsa-450-4fa5e",
    storageBucket: "dsa-450-4fa5e.firebasestorage.app",
    messagingSenderId: "363783581030",
    appId: "1:363783581030:web:4b354091054db1c151eca7",
    measurementId: "G-5E57MSK5ZL"
};

// Initialize secondary Firebase app to target original A2Z DSA database
const a2zApp = getApps().find(app => app.name === 'a2z_dsa') 
    || initializeApp(a2zFirebaseConfig, 'a2z_dsa');
const a2zDb = getFirestore(a2zApp);

const userId = 'shared_global_user';

// ---- Helper Functions ----
function getCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('recursion') || t.includes('re ')) return 'Recursion';
    if (t.includes('hashing') || t.includes('maps')) return 'Hashing';
    if (t.includes('sorting') || t.includes('sort ')) return 'Sorting';
    if (t.includes('linkedlist') || t.includes('ll') || t.includes('dll') || t.includes('linked list')) return 'Linked List';
    if (t.includes('stack') || t.includes('queue') || t.includes('parenthes') || t.includes('postfix') || t.includes('infix')) return 'Stack & Queue';
    if (t.includes('tree') || t.includes('bst') || t.includes('preorder') || t.includes('inorder') || t.includes('postorder')) return 'Trees & BST';
    if (t.includes('graph') || t.includes('bfs') || t.includes('dfs') || t.includes('dijkstra') || t.includes('kruskal') || t.includes('topological') || t.includes('provinces') || t.includes('islands') || t.includes('word ladder') || t.includes('safe states')) return 'Graphs';
    if (t.includes('dp ') || t.includes('dynamic programming') || t.includes('knapsack') || t.includes('lcs') || t.includes('subsequence') || t.includes('stairs') || t.includes('frog jump') || t.includes('house robber') || t.includes("ninja's training") || t.includes('grid') || t.includes('triangle') || t.includes('edit distance') || t.includes('stock') || t.includes('lis') || t.includes('mcm') || t.includes('stick') || t.includes('balloon') || t.includes('rectangle')) return 'Dynamic Programming';
    if (t.includes('sliding window') || t.includes('2 pointers') || t.includes('pointers') || t.includes('nice subarrays') || t.includes('substring')) return 'Sliding Window';
    if (t.includes('greedy') || t.includes('cookies') || t.includes('lemonade') || t.includes('jump game') || t.includes('sjf') || t.includes('sequencing') || t.includes('meeting') || t.includes('platforms') || t.includes('candy')) return 'Greedy';
    if (t.includes('maths') || t.includes('prime') || t.includes('divisors') || t.includes('sieve') || t.includes('exponentiation')) return 'Maths';
    if (t.includes('array') || t.includes('matrix') || t.includes('subarray')) return 'Arrays';
    return 'Basics & STL';
}

function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDurationSummary(seconds) {
    if (!seconds || seconds <= 0) return '0h 00m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

// Prepare video items statically
const processedVideos = videosData.map((v, index) => ({
    ...v,
    index: index + 1,
    category: getCategory(v.title),
    leetcode: getLeetCodeNumber(v.title)
}));

// Achievement badges definitions
const BADGES = [
    { id: 'first_step', title: 'First Step', desc: 'Any progress made', threshold: 0.01, tier: 'bronze', icon: ArrowRight },
    { id: 'dedicated', title: 'Dedicated', desc: '10% of course time watched', threshold: 10, tier: 'bronze', icon: Bookmark },
    { id: 'consistent', title: 'Consistent', desc: '25% of course time watched', threshold: 25, tier: 'silver', icon: Zap },
    { id: 'halfway_hero', title: 'Halfway Hero', desc: '50% of course time watched', threshold: 50, tier: 'gold', icon: Target },
    { id: 'grinder', title: 'Grinder', desc: '75% of course time watched', threshold: 75, tier: 'gold', icon: Flame },
    { id: 'algorithm_pro', title: 'Algorithm Pro', desc: '90% of course time watched', threshold: 90, tier: 'platinum', icon: Cpu },
    { id: 'dsa_master', title: 'DSA Master', desc: 'Full A2Z course completed', threshold: 100, tier: 'diamond', icon: Crown }
];

const tierStyles = {
    bronze: { border: '#b45309', bg: '#fffbeb', text: '#b45309', borderLight: '#fed7aa' },
    silver: { border: '#475569', bg: '#f8fafc', text: '#475569', borderLight: '#e2e8f0' },
    gold: { border: '#a16207', bg: '#fefcbf', text: '#a16207', borderLight: '#fef08a' },
    platinum: { border: '#0369a1', bg: '#f0f9ff', text: '#0369a1', borderLight: '#bae6fd' },
    diamond: { border: '#6b21a8', bg: '#faf5ff', text: '#6b21a8', borderLight: '#e9d5ff' }
};

const CATEGORIES = [
    'All',
    'Basics & STL',
    'Maths',
    'Recursion',
    'Hashing',
    'Sorting',
    'Arrays',
    'Linked List',
    'Sliding Window',
    'Greedy',
    'Stack & Queue',
    'Trees & BST',
    'Graphs',
    'Dynamic Programming'
];

// ---- Circular Progress Ring component ----
const ProgressCircle = ({ pct }) => {
    const radius = 50;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.35s' }}
                />
            </svg>
            <div style={{ position: 'absolute', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {pct}%
            </div>
        </div>
    );
};

// ---- A2Z DSA Tracker Page ----
const A2ZDsaSheet = () => {
    const [completedMap, setCompletedMap] = useState({});
    const [lcSolvedMap, setLcSolvedMap] = useState({});
    const [submissionsList, setSubmissionsList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('checklist'); // 'checklist', 'heatmap'
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'incomplete', 'leetcode-solved', 'leetcode-unsolved'
    const [activeVideo, setActiveVideo] = useState(null);

    // Sync state if user exits fullscreen manually (e.g. Esc key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFs = !!(document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
            if (!isFs) {
                setActiveVideo(null);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Request native fullscreen when activeVideo is set
    useEffect(() => {
        if (activeVideo) {
            const enterFullscreen = () => {
                const element = document.getElementById('a2z-fullscreen-player-root');
                if (element) {
                    if (element.requestFullscreen) {
                        element.requestFullscreen().catch(err => console.log("Fullscreen failed:", err));
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                }
            };
            const timer = setTimeout(enterFullscreen, 80);
            return () => clearTimeout(timer);
        } else {
            const isFs = !!(document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
            if (isFs && document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.log("Exit fullscreen failed:", err));
            }
        }
    }, [activeVideo]);

    // Fetch progress from Firebase
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const docRef = doc(a2zDb, 'users', userId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    const completed = data.completed || {};
                    const lcSolved = data.lcSolved || {};
                    let submissions = data.submissions || [];
                    
                    // Auto-migrate completed items to submissions if submissions log is empty
                    if (submissions.length === 0 && Object.keys(completed).length > 0) {
                        submissions = Object.entries(completed).map(([videoId, timestamp]) => {
                            const video = processedVideos.find(v => v.id === videoId);
                            return {
                                videoId,
                                title: video ? video.title : 'Migrated Video',
                                timestamp: typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
                            };
                        });
                        
                        // Persist the migrated logs to Firebase immediately
                        setDoc(docRef, {
                            completed,
                            lcSolved,
                            submissions,
                            lastUpdated: new Date()
                        }).catch(err => console.error("Auto-migration save failed:", err));
                    }
                    
                    setCompletedMap(completed);
                    setLcSolvedMap(lcSolved);
                    setSubmissionsList(submissions);
                }
            } catch (err) {
                console.warn("Failed to load progress from Firestore:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    // Helper to persist changes
    const saveProgress = async (newCompleted, newLc, newSubmissions) => {
        try {
            const docRef = doc(a2zDb, 'users', userId);
            await setDoc(docRef, {
                completed: newCompleted,
                lcSolved: newLc,
                submissions: newSubmissions,
                lastUpdated: new Date()
            });
        } catch (err) {
            console.error("Failed to save progress to Firestore:", err);
        }
    };

    // Toggles completed state for a video
    const handleToggleCompleted = (videoId) => {
        const nextCompleted = { ...completedMap };
        const nextSubmissions = [...submissionsList];
        
        if (nextCompleted[videoId]) {
            delete nextCompleted[videoId];
        } else {
            const now = Date.now();
            nextCompleted[videoId] = now;
            // Record check event as a contribution log
            const video = processedVideos.find(v => v.id === videoId);
            nextSubmissions.push({
                videoId,
                title: video ? video.title : 'Unknown Video',
                timestamp: now
            });
        }
        setCompletedMap(nextCompleted);
        setSubmissionsList(nextSubmissions);
        saveProgress(nextCompleted, lcSolvedMap, nextSubmissions);
    };

    // Toggles solved state for a LeetCode problem
    const handleToggleLcSolved = (videoId) => {
        const nextLc = { ...lcSolvedMap };
        if (nextLc[videoId]) {
            delete nextLc[videoId];
        } else {
            nextLc[videoId] = true;
        }
        setLcSolvedMap(nextLc);
        saveProgress(completedMap, nextLc, submissionsList);
    };

    // Reset progress action
    const handleResetProgress = () => {
        if (window.confirm("Are you sure you want to reset all progress for Striver's A2Z DSA?")) {
            setCompletedMap({});
            setLcSolvedMap({});
            setSubmissionsList([]);
            saveProgress({}, {}, []);
        }
    };

    // Statistics Calculations
    const totalVideos = processedVideos.length;
    const completedVideosCount = Object.keys(completedMap).length;
    const remainingVideosCount = totalVideos - completedVideosCount;

    const totalDuration = processedVideos.reduce((acc, v) => acc + (v.duration || 0), 0);
    const completedDuration = processedVideos
        .filter(v => !!completedMap[v.id])
        .reduce((acc, v) => acc + (v.duration || 0), 0);
    const remainingDuration = totalDuration - completedDuration;

    const lcVideos = processedVideos.filter(v => !!v.leetcode);
    const totalLcCount = lcVideos.length;
    const solvedLcCount = lcVideos.filter(v => !!lcSolvedMap[v.id]).length;
    const remainingLcCount = totalLcCount - solvedLcCount;

    const pct = totalDuration > 0
        ? parseFloat(((completedDuration / totalDuration) * 100).toFixed(2))
        : 0;

    // Motivational Label logic
    const getMotivationalLabel = () => {
        if (pct === 0)        return "Let's get started!";
        if (pct < 10)    return 'First steps taken. Keep it up!';
        if (pct < 20)    return 'Warming up nicely!';
        if (pct < 30)    return 'Great start! You are building momentum.';
        if (pct < 40)    return 'Almost a third done. Solid work!';
        if (pct < 50)    return 'Approaching halfway. Stay consistent!';
        if (pct < 60)    return 'Past halfway! The hard part is behind you.';
        if (pct < 70)    return 'Over 60% done. You are on fire!';
        if (pct < 80)    return 'Three-quarters there. Incredible effort!';
        if (pct < 90)    return 'Almost there. Do not stop now!';
        if (pct < 100)   return 'Final stretch. Finish what you started!';
        return 'Masterclass complete. Legend status!';
    };

    // Categorized video summary counts
    const categoryCounts = useMemo(() => {
        const counts = { All: totalVideos };
        processedVideos.forEach(v => {
            counts[v.category] = (counts[v.category] || 0) + 1;
        });
        return counts;
    }, []);

    // Filtered Video Selection
    const filteredVideos = useMemo(() => {
        return processedVideos.filter(v => {
            // Category filter
            if (activeCategory !== 'All' && v.category !== activeCategory) return false;

            // Search query filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const titleMatch = v.title.toLowerCase().includes(query);
                const leetcodeMatch = v.leetcode && (v.leetcode.num.toLowerCase().includes(query) || v.leetcode.slug.toLowerCase().includes(query));
                if (!titleMatch && !leetcodeMatch) return false;
            }

            // Status filter
            if (statusFilter === 'completed' && !completedMap[v.id]) return false;
            if (statusFilter === 'incomplete' && completedMap[v.id]) return false;
            if (statusFilter === 'leetcode-solved' && (!v.leetcode || !lcSolvedMap[v.id])) return false;
            if (statusFilter === 'leetcode-unsolved' && (!v.leetcode || lcSolvedMap[v.id])) return false;

            return true;
        });
    }, [activeCategory, searchQuery, statusFilter, completedMap, lcSolvedMap]);

    // Calendar Heatmap generation
    const getLogicalDateStr = (dateInput) => {
        const d = new Date(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const activityStats = useMemo(() => {
        const dataMap = {};
        const datesSet = new Set();
        
        (submissionsList || []).forEach(sub => {
            if (!sub.timestamp) return;
            const d = new Date(sub.timestamp);
            if (isNaN(d.getTime())) return;
            const dateStr = getLogicalDateStr(d);
            dataMap[dateStr] = (dataMap[dateStr] || 0) + 1;
            datesSet.add(dateStr);
        });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoStr = getLogicalDateStr(oneYearAgo);

        let totalSubmissions = 0;
        let activeDaysCount = 0;
        
        Object.entries(dataMap).forEach(([dateStr, count]) => {
            if (dateStr >= oneYearAgoStr) {
                totalSubmissions += count;
                activeDaysCount++;
            }
        });

        const sortedDates = Array.from(datesSet).sort();
        if (sortedDates.length === 0) {
            return { totalSubmissions: 0, activeDaysCount: 0, maxStreak: 0, currentStreak: 0 };
        }

        let tempStreak = 0;
        let maxStreak = 0;
        
        const firstDate = new Date(sortedDates[0]);
        const dayIter = new Date(firstDate);
        const todayObj = new Date();
        const logicalToday = getLogicalDateStr(todayObj);

        while (getLogicalDateStr(dayIter) <= logicalToday) {
            const dateStr = getLogicalDateStr(dayIter);
            const count = dataMap[dateStr] || 0;
            
            if (count > 0) {
                tempStreak++;
            } else {
                tempStreak = 0;
            }
            maxStreak = Math.max(maxStreak, tempStreak);
            dayIter.setDate(dayIter.getDate() + 1);
        }

        let currentStreak = 0;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const logicalYesterday = getLogicalDateStr(yesterday);
        
        let checkDate = null;
        if (dataMap[logicalToday] > 0) {
            checkDate = todayObj;
        } else if (dataMap[logicalYesterday] > 0) {
            checkDate = yesterday;
        }

        if (checkDate) {
            const iterDate = new Date(checkDate);
            while (dataMap[getLogicalDateStr(iterDate)] > 0) {
                currentStreak++;
                iterDate.setDate(iterDate.getDate() - 1);
            }
        }

        return {
            totalSubmissions,
            activeDaysCount,
            maxStreak,
            currentStreak
        };
    }, [submissionsList]);

    const heatmapMonths = useMemo(() => {
        const data = {};
        (submissionsList || []).forEach(sub => {
            if (!sub.timestamp) return;
            const d = new Date(sub.timestamp);
            if (isNaN(d.getTime())) return;
            const dateStr = getLogicalDateStr(d);
            data[dateStr] = (data[dateStr] || 0) + 1;
        });

        const today = new Date();
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const currentYear = today.getFullYear();
        const currentMonthIndex = today.getMonth();

        for (let mOffset = -12; mOffset <= 0; mOffset++) {
            const targetDate = new Date(currentYear, currentMonthIndex + mOffset, 1);
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();
            
            const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());
            const daysInMonth = isCurrentMonth ? today.getDate() : new Date(year, month + 1, 0).getDate();
            
            const days = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const dateObj = new Date(year, month, d);
                const dateStr = getLogicalDateStr(dateObj);
                days.push({
                    date: dateStr,
                    dayOfWeek: dateObj.getDay(),
                    count: data[dateStr] || 0
                });
            }

            const weeks = [];
            let currentWeek = Array(7).fill(null);

            days.forEach(day => {
                currentWeek[day.dayOfWeek] = day;
                if (day.dayOfWeek === 6) {
                    weeks.push(currentWeek);
                    currentWeek = Array(7).fill(null);
                }
            });

            if (currentWeek.some(d => d !== null)) {
                weeks.push(currentWeek);
            }

            months.push({
                name: monthNames[month],
                year: year,
                weeks: weeks
            });
        }
        
        return months;
    }, [submissionsList]);

    const getHeatColor = (count) => {
        if (count === 0) return '#ebedf0';
        if (count <= 1) return '#9be9a8'; 
        if (count <= 3) return '#40c463';
        if (count <= 5) return '#30a14e';
        return '#216e39';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #eff6ff', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>Syncing A2Z DSA progress...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (activeVideo) {
        return createPortal(
            <div id="a2z-fullscreen-player-root" style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: '#0f172a',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
            }}>
                {/* Header Overlay */}
                <div style={{
                    padding: '1rem 2rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 0 }}>
                        <button 
                            onClick={() => setActiveVideo(null)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.25rem', border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.75rem', background: 'rgba(255,255,255,0.08)', color: 'white',
                                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        >
                            <ArrowLeft size={16} />
                            Back to A2Z DSA
                        </button>
                        
                        <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Playing Video</span>
                            <h2 style={{ margin: '0.1rem 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeVideo.title}</h2>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
                            Duration: {formatDuration(activeVideo.duration)}
                        </span>
                        
                        <button
                            onClick={() => handleToggleCompleted(activeVideo.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: completedMap[activeVideo.id] ? '#059669' : '#3b82f6',
                                color: 'white',
                                border: 'none', borderRadius: '0.5rem', fontWeight: 800,
                                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <CheckCircle size={16} />
                            {completedMap[activeVideo.id] ? 'Completed!' : 'Mark Completed'}
                        </button>
                    </div>
                </div>

                {/* Actual Fullscreen Player Video Frame */}
                <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: 'black' }}>
                    <iframe 
                        src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                        title={activeVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
                    />
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem', minHeight: '100vh', boxSizing: 'border-box' }}>
            {/* Header */}
            <header style={{ marginBottom: '2rem', position: 'relative' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', border: '1px solid #dbeafe' }}>
                    <Target size={16} />
                    Striver's A2Z Sheet
                </div>
            </header>

            {/* Dashboard Stats */}
            <section className="a2z-stats-section">
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'white', flex: '1 1 350px', borderRadius: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <ProgressCircle pct={pct} />
                    <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>{getMotivationalLabel()}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Progress calculated by total course duration watched.</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: 'white', flex: '2 1 600px', borderRadius: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{totalVideos}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Videos</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{completedVideosCount}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>Completed</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>{formatDurationSummary(totalDuration)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Hours</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>{formatDurationSummary(completedDuration)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>Time Watched</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>{formatDurationSummary(remainingDuration)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>Time Left</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#eab308' }}>{totalLcCount}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>Mapped LCs</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>{solvedLcCount}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>LCs Solved</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ea580c' }}>{remainingLcCount}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>LC Remaining</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs View Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <button 
                    onClick={() => setActiveTab('checklist')} 
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
                        border: 'none', background: 'none', cursor: 'pointer', 
                        fontWeight: 700, fontSize: '0.95rem', color: activeTab === 'checklist' ? '#2563eb' : '#64748b',
                        borderBottom: activeTab === 'checklist' ? '2px solid #2563eb' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <List size={18} />
                    Checklist
                </button>
                <button 
                    onClick={() => setActiveTab('heatmap')} 
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
                        border: 'none', background: 'none', cursor: 'pointer', 
                        fontWeight: 700, fontSize: '0.95rem', color: activeTab === 'heatmap' ? '#2563eb' : '#64748b',
                        borderBottom: activeTab === 'heatmap' ? '2px solid #2563eb' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Calendar size={18} />
                    Activity Heatmap
                </button>
            </div>

            {/* Checklist View */}
            {activeTab === 'checklist' && (
                <div>
                    {/* Controls Row */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1 1 300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text"
                                placeholder="Search videos by title or LeetCode mapping..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                    border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                                    fontSize: '0.95rem', background: 'white', boxSizing: 'border-box',
                                    color: 'var(--text-main)'
                                }}
                            />
                        </div>

                        {/* Status Filter */}
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem', background: 'white', fontWeight: 700,
                                color: '#64748b', fontSize: '0.95rem', cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Progress</option>
                            <option value="completed">Completed Only</option>
                            <option value="incomplete">Incomplete Only</option>
                            <option value="leetcode-solved">LeetCode Solved</option>
                            <option value="leetcode-unsolved">LeetCode Unsolved</option>
                        </select>

                        {/* Reset Button */}
                        <button 
                            onClick={handleResetProgress}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', border: '1px solid #fecaca',
                                borderRadius: '0.75rem', background: '#fef2f2', color: '#ef4444',
                                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                transition: 'all 0.2s', marginLeft: 'auto'
                            }}
                        >
                            <RotateCcw size={16} />
                            Reset Progress
                        </button>
                    </div>

                    {/* Category tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', scrollbarWidth: 'none' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    whiteSpace: 'nowrap', padding: '0.5rem 1.25rem',
                                    borderRadius: '2rem', border: '1px solid',
                                    borderColor: activeCategory === cat ? '#2563eb' : '#e2e8f0',
                                    background: activeCategory === cat ? '#eff6ff' : 'white',
                                    color: activeCategory === cat ? '#2563eb' : '#64748b',
                                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat} <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', opacity: 0.6 }}>({categoryCounts[cat] || 0})</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Split Layout */}
                    <div className="a2z-split-layout">
                        
                        {/* Video List Grid Column */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {filteredVideos.length === 0 ? (
                                <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white' }}>
                                    <Film size={48} style={{ opacity: 0.1, marginBottom: '1.5rem', color: '#64748b' }} />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>No videos match your filter</h3>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', margin: 0 }}>Try clearing your search query or choosing another status filter.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {filteredVideos.map(video => {
                                        const isCompleted = !!completedMap[video.id];
                                        const isLcSolved = !!lcSolvedMap[video.id];
                                        const completionTime = completedMap[video.id];
                                        
                                        let formattedCheckTime = '';
                                        if (isCompleted && completionTime) {
                                            const d = new Date(completionTime);
                                            if (!isNaN(d.getTime())) {
                                                const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                                                const hours = d.getHours();
                                                const minutes = String(d.getMinutes()).padStart(2, '0');
                                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                                const formattedHours = hours % 12 || 12;
                                                formattedCheckTime = `${dateStr} ${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
                                            }
                                        }
                                        
                                        return (
                                            <div 
                                                key={video.id}
                                                className="glass-card"
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '1.25rem',
                                                    border: '1px solid #f1f5f9',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    padding: '1rem',
                                                    position: 'relative',
                                                    transition: 'all 0.3s',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* Top Row: Index & Completed Checkmark */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <div style={{
                                                        background: isCompleted ? '#e6f4ea' : '#f1f5f9',
                                                        color: isCompleted ? '#137333' : '#475569',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '100px'
                                                    }}>
                                                        #{video.index}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleToggleCompleted(video.id)}
                                                        style={{
                                                            width: '28px', height: '28px', borderRadius: '50%',
                                                            border: 'none',
                                                            background: isCompleted ? '#10b981' : '#f1f5f9',
                                                            color: isCompleted ? 'white' : '#94a3b8',
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title={isCompleted ? "Mark incomplete" : "Mark completed"}
                                                    >
                                                        <Check size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                
                                                {/* Video Thumbnail (Middle) */}
                                                <div 
                                                    onClick={() => setActiveVideo(video)}
                                                    style={{
                                                        position: 'relative',
                                                        borderRadius: '0.75rem',
                                                        overflow: 'hidden',
                                                        aspectRatio: '16/9',
                                                        cursor: 'pointer',
                                                        marginBottom: '1rem',
                                                        border: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    <img 
                                                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                                                        alt={video.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                        background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', opacity: 0, transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                                    >
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '50%',
                                                            background: 'white', display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                        }}>
                                                            <Play size={18} fill="#2563eb" color="#2563eb" style={{ marginLeft: '2px' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Title */}
                                                <h4 
                                                    style={{
                                                        margin: '0 0 0.75rem 0',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700,
                                                        color: isCompleted ? '#94a3b8' : 'var(--text-main)',
                                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                                        lineHeight: '1.4',
                                                        flex: 1,
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setActiveVideo(video)}
                                                >
                                                    {video.title}
                                                </h4>
                                                
                                                {/* Checked Date Box */}
                                                {isCompleted && formattedCheckTime && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        background: '#f8fafc',
                                                        padding: '0.4rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.75rem',
                                                        color: '#64748b',
                                                        marginBottom: '1rem',
                                                        border: '1px solid #f1f5f9'
                                                    }}>
                                                        <Calendar size={14} />
                                                        <span>Checked: {formattedCheckTime}</span>
                                                    </div>
                                                )}
                                                
                                                {/* Bottom Row Controls */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                                                        {formatDuration(video.duration)}
                                                    </span>
                                                    
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: 800,
                                                        padding: '0.15rem 0.5rem',
                                                        background: '#f1f5f9',
                                                        color: '#475569',
                                                        borderRadius: '4px',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '80px'
                                                    }} title={video.category}>
                                                        {video.category}
                                                    </span>
                                                    
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {/* LeetCode link inside card if mapped */}
                                                        {video.leetcode && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#fffbeb', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid #fef3c7' }}>
                                                                <button 
                                                                    onClick={() => handleToggleLcSolved(video.id)}
                                                                    style={{
                                                                        width: '16px', height: '16px', borderRadius: '3px',
                                                                        border: '1.5px solid',
                                                                        borderColor: isLcSolved ? '#d97706' : '#cbd5e1',
                                                                        background: isLcSolved ? '#fef3c7' : 'transparent',
                                                                        color: '#d97706', display: 'flex', alignItems: 'center',
                                                                        justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                                                                    }}
                                                                    title="Mark LeetCode problem as solved"
                                                                >
                                                                    {isLcSolved && <Check size={10} strokeWidth={4} />}
                                                                </button>
                                                                <a 
                                                                    href={`https://leetcode.com/problems/${video.leetcode.slug}/`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.15rem' }}
                                                                    title={`LeetCode ${video.leetcode.num}`}
                                                                >
                                                                    LC
                                                                    <ExternalLink size={10} />
                                                                </a>
                                                            </div>
                                                        )}
                                                        
                                                        <a 
                                                            href={`https://www.youtube.com/watch?v=${video.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                color: '#94a3b8',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                            title="Open on YouTube"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Column - Badges */}
                        <aside className="glass-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', sticky: 'top', top: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                                <Trophy size={20} color="#eab308" />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Achievements</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {BADGES.map(badge => {
                                    const isUnlocked = pct >= badge.threshold;
                                    const IconComponent = badge.icon;
                                    const style = tierStyles[badge.tier];
                                    
                                    return (
                                        <div 
                                            key={badge.id}
                                            style={{
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '1rem',
                                                padding: '0.85rem 1rem', 
                                                borderRadius: '1rem',
                                                background: 'white',
                                                border: isUnlocked ? `1px solid ${style.borderLight}` : '1px solid #f1f5f9',
                                                boxShadow: isUnlocked ? '0 4px 15px rgba(0, 0, 0, 0.02)' : 'none',
                                                opacity: isUnlocked ? 1 : 0.6,
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {/* Badge Icon circle */}
                                            <div style={{
                                                width: '46px', 
                                                height: '46px', 
                                                borderRadius: '50%',
                                                background: isUnlocked ? style.bg : '#f8fafc',
                                                border: isUnlocked ? `1.5px solid ${style.borderLight}` : '1.5px solid #e2e8f0',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: isUnlocked ? style.text : '#94a3b8',
                                                flexShrink: 0
                                            }}>
                                                <IconComponent size={20} />
                                            </div>
                                            
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {/* Tier Pill */}
                                                <span style={{
                                                    display: 'inline-block',
                                                    fontSize: '0.55rem',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '100px',
                                                    background: isUnlocked ? style.bg : '#f1f5f9',
                                                    color: isUnlocked ? style.text : '#64748b',
                                                    marginBottom: '0.2rem'
                                                }}>
                                                    {badge.tier}
                                                </span>
                                                
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{badge.title}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={badge.desc}>{badge.desc}</div>
                                                
                                                {/* Status label */}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.2rem', 
                                                    marginTop: '0.3rem',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    color: isUnlocked ? '#16a34a' : '#94a3b8'
                                                }}>
                                                    {isUnlocked ? (
                                                        <>
                                                            <Check size={10} strokeWidth={4} />
                                                            <span>Earned</span>
                                                        </>
                                                    ) : (
                                                        <span>Locked</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>
                    </div>
                </div>
            )}

            {/* Heatmap View */}
            {activeTab === 'heatmap' && (
                <div className="glass-card" style={{ padding: '2rem', background: 'white', borderRadius: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', minWidth: '800px', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            {activityStats.totalSubmissions} <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>submissions in the past one year</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            <span>Total active days: {activityStats.activeDaysCount}</span>
                            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Flame size={15} fill="#f59e0b" /> Current: {activityStats.currentStreak}
                            </span>
                            <span>Max streak: {activityStats.maxStreak}</span>
                        </div>
                    </div>

                    {/* Rendering pure CSS Grid heatmap grid like ActivityTracker.jsx */}
                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '1rem', minWidth: '900px' }}>
                        {/* Day labels column */}
                        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px', width: '25px', height: '88px', fontSize: '0.65rem', color: 'var(--text-muted)', position: 'relative', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: '13px' }}>Mon</div>
                            <div style={{ position: 'absolute', top: '39px' }}>Wed</div>
                            <div style={{ position: 'absolute', top: '65px' }}>Fri</div>
                        </div>

                        {/* Month grids */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {heatmapMonths.map((month) => (
                                <div key={`${month.name}-${month.year}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Grid of columns for this month */}
                                    <div style={{ display: 'flex', gap: '3px' }}>
                                        {month.weeks.map((week, wIdx) => (
                                            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                {week.map((day, dIdx) => {
                                                    if (!day) {
                                                        return (
                                                            <div 
                                                                key={dIdx} 
                                                                style={{ width: '10px', height: '10px', background: 'transparent' }} 
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <div 
                                                            key={dIdx}
                                                            style={{ 
                                                                width: '10px', 
                                                                height: '10px', 
                                                                background: getHeatColor(day.count), 
                                                                borderRadius: '2px'
                                                            }}
                                                            title={`${day.date}: ${day.count} videos completed`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Month label centered */}
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
                                        {month.name}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', marginBottom: '0.5rem', marginLeft: '2rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Less</span>
                            {[0, 1, 2, 4, 6].map(level => (
                                <div key={level} style={{ width: '10px', height: '10px', borderRadius: '2px', background: getHeatColor(level) }}></div>
                            ))}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>More</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default A2ZDsaSheet;
