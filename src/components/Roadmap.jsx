import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Flag,
    ChevronRight,
    Circle,
    CheckCircle2,
    ArrowRight,
    Code2,
    Blocks,
    Layers,
    Zap,
    Milestone,
    Target
} from 'lucide-react';

const RoadmapStep = ({ step, index, topics, navigate, isLast }) => {
    const topic = topics.find(t => t.id === step.topicId);
    const solvedCount = topic?.questions.filter(q => q.solved).length || 0;
    const totalCount = topic?.questions.length || 0;
    const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
    const isCompleted = progress === 100 && totalCount > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="roadmap-step"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '2rem',
                position: 'relative',
                marginBottom: '4rem',
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse'
            }}
        >
            {/* Connection Line */}
            {!isLast && (
                <div style={{
                    position: 'absolute',
                    top: '4rem',
                    left: 'calc(50% - 1px)',
                    width: '2px',
                    height: 'calc(100% - 2rem)',
                    background: 'linear-gradient(to bottom, var(--primary), #e2e8f0)',
                    zIndex: 0,
                    opacity: 0.3
                }}></div>
            )}

            {/* Content Card */}
            <div
                className="glass-card"
                onClick={() => navigate(`/topic/${step.topicId}`)}
                style={{
                    flex: 1,
                    padding: '1.5rem',
                    cursor: 'pointer',
                    maxWidth: '450px',
                    textAlign: index % 2 === 0 ? 'left' : 'right',
                    borderLeft: index % 2 === 0 ? '4px solid var(--primary)' : 'none',
                    borderRight: index % 2 !== 0 ? '4px solid var(--primary)' : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Phase {step.phase}</span>
                    {isCompleted && <CheckCircle2 size={16} color="#10b981" />}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>{step.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                    <div style={{ flex: 1, maxWidth: '200px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{progress}%</span>
                </div>
            </div>

            {/* Middle Marker */}
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isCompleted ? '#10b981' : 'white',
                border: `3px solid ${isCompleted ? '#10b981' : 'var(--primary)'}`,
                boxShadow: `0 0 20px ${isCompleted ? '#10b98140' : 'rgba(59, 130, 246, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                color: isCompleted ? 'white' : 'var(--primary)',
                flexShrink: 0
            }}>
                {step.icon}
            </div>

            <div style={{ flex: 1 }}></div>
        </motion.div >
    );
};

const Roadmap = ({ topics }) => {
    const navigate = useNavigate();

    const roadmapData = [
        {
            phase: 1,
            title: "Array Foundations",
            topicId: "array",
            description: "Master the most fundamental data structure. Learn traversals, basic manipulation, and property-based logic.",
            icon: <Layers size={24} />
        },
        {
            phase: 1,
            title: "String Processing",
            topicId: "string",
            description: "Go beyond characters. Master palindromes, anagrams, and fundamental string transformation patterns.",
            icon: <Code2 size={24} />
        },
        {
            phase: 1,
            title: "Sorting & Searching",
            topicId: "sorting",
            description: "Learn how to organize and find data efficiently. The backbone of algorithmic optimization.",
            icon: <Target size={24} />
        },
        {
            phase: 2,
            title: "Two Pointers Strategy",
            topicId: "two-pointer",
            description: "Master multi-marker traversal to optimize nested loops into linear time operations.",
            icon: <ChevronRight size={24} />
        },
        {
            phase: 2,
            title: "Sliding Window",
            topicId: "sliding-window",
            description: "Learn the window technique for subarray and substring problems. Essential for range-based logic.",
            icon: <Zap size={24} />
        },
        {
            phase: 2,
            title: "Prefix Sum Patterns",
            topicId: "prefix-sum",
            description: "Pre-calculate ranges to answer queries in O(1). A powerful optimization for sum-based problems.",
            icon: <Blocks size={24} />
        },
        {
            phase: 3,
            title: "Linked Lists",
            topicId: "linked-list",
            description: "Master pointers, node connections, and memory management. Solve cycles and complex reversals.",
            icon: <Blocks size={24} />
        },
        {
            phase: 3,
            title: "Grid & Matrix Logic",
            topicId: "matrix",
            description: "Navigate 2D data. Master spiral traversals, rotations, and recursive explorations of grids.",
            icon: <Layers size={21} />
        },
        {
            phase: 3,
            title: "Coordinate Mapping",
            topicId: "tuple",
            description: "Work with pairs, triplets, and geometric coordinates. Manage state in multi-dimensional space.",
            icon: <Circle size={20} />
        },
        {
            phase: 4,
            title: "Mapping & Uniqueness",
            topicId: "dictionary",
            description: "Master Hash Tables. Optimize lookups from O(n) to O(1) using key-value pair mapping.",
            icon: <Code2 size={24} />
        },
        {
            phase: 4,
            title: "Unique Collections",
            topicId: "set",
            description: "Learn to handle duplicates and membership tests efficiently using Set data structures.",
            icon: <Circle size={24} />
        },
        {
            phase: 5,
            title: "Recursive Thinking",
            topicId: "recursion",
            description: "Build the core mental model for solving subproblems. Breaking complex tasks into smaller pieces.",
            icon: <ArrowRight size={24} />
        },
        {
            phase: 5,
            title: "Backtracking Power",
            topicId: "backtracking",
            description: "Explore all possible states. Solve Sudokus, N-Queens, and complex decision-making paths.",
            icon: <Milestone size={24} />
        },
        {
            phase: 6,
            title: "Tree Architectures",
            topicId: "trees",
            description: "Master non-linear logic. Understand BFS, DFS, and Binary Search Tree properties.",
            icon: <Flag size={24} />
        },
        {
            phase: 6,
            title: "Greedy Strategy",
            topicId: "greedy",
            description: "Learn to make the locally optimal choice. Intervals, scheduling, and resource allocation.",
            icon: <Target size={24} />
        },
        {
            phase: 7,
            title: "Mathematical Foundations",
            topicId: "prime-numbers",
            description: "Understand number theory, primality tests, and mathematical optimizations in coding.",
            icon: <Zap size={24} />
        },
        {
            phase: 7,
            title: "System Design (OOPS)",
            topicId: "oops",
            description: "Learn Object Oriented Principles and design patterns. Move from scripts to modular software.",
            icon: <Blocks size={24} />
        },
        {
            phase: 8,
            title: "Dynamic Programming",
            topicId: "dp",
            description: "The peak of DSA. Master memoization and tabulation to turn exponential time into linear.",
            icon: <Flag size={32} />
        }
    ];

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#eff6ff', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                    <Target size={16} />
                    Career Path
                </div>
                <h1 className="section-title">The Master's Roadmap</h1>
                <p style={{ maxWidth: '700px', margin: '1rem auto 0', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                    A journey through 100+ logical milestones. Start with foundations and climb your way to the peak of competitive programming.
                </p>
            </header>

            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
                {roadmapData.map((step, index) => (
                    <RoadmapStep
                        key={index}
                        step={step}
                        index={index}
                        topics={topics}
                        navigate={navigate}
                        isLast={index === roadmapData.length - 1}
                    />
                ))}
            </div>

            <style>{`
                .roadmap-step:hover .glass-card {
                    background: white !important;
                    box-shadow: 0 20px 40px -15px rgba(59, 130, 246, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default Roadmap;
