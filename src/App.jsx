import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { initialTopics } from './data/initialData';
import { babbarTopics } from './data/babbarData';
import { leet160Topics } from './data/leet160Data';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GFGSheet from './components/GFGSheet';
import TopicDetail from './components/TopicDetail';
import BookmarkPage from './components/BookmarkPage';
import Roadmap from './components/Roadmap';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './components/HomePage';
import ActivityTracker from './components/ActivityTracker';
import CommandPalette from './components/CommandPalette';
import LeetCodeSheet from './components/LeetCodeSheet';
import Hot150Sheet from './components/Hot150Sheet';
import TargetWidget from './components/TargetWidget';
import StudyPlan from './components/StudyPlan';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('id'); // 'id' or 'title'
  const [zoomLevel, setZoomLevel] = useState(100);

  // Combined Initial Data
  const ALL_INITIAL_TOPICS = [...initialTopics, ...babbarTopics, ...leet160Topics];

  // Fetch topics and settings from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Firebase Fetch Timeout")), 5000);
      });

      try {
        // Fetch Settings First or Parallel
        const settingsPromise = getDoc(doc(db, "settings", "global"));
        const topicsPromise = getDocs(collection(db, "topics"));

        const [settingsSnap, querySnapshot] = await Promise.race([
          Promise.all([settingsPromise, topicsPromise]),
          timeout
        ]);

        // Handle Settings
        if (settingsSnap.exists() && settingsSnap.data().zoomLevel) {
          setZoomLevel(settingsSnap.data().zoomLevel);
        }

        // Handle Topics
        let dbTopics = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mergedTopics = ALL_INITIAL_TOPICS.map(initialTopic => {
          const dbTopic = dbTopics.find(t => t.id === initialTopic.id);
          if (dbTopic) {
            const mergedQuestions = initialTopic.questions.map(iq => {
              const dq = dbTopic.questions?.find(q => String(q.id) === String(iq.id));
              return dq ? {
                ...iq,
                solved: dq.solved || iq.solved || false,
                bookmarked: dq.bookmarked || false,
                comment: dq.comment || "",
                solvedAt: dq.solvedAt || (iq.solved ? new Date().toISOString() : null)
              } : iq;
            });
            return { ...initialTopic, questions: mergedQuestions };
          }
          return initialTopic;
        });

        // Sync local structural changes back to Firestore WITHOUT wiping progress
        (async () => {
          const batch = writeBatch(db);
          let needsUpdate = false;

          ALL_INITIAL_TOPICS.forEach(it => {
            const dt = dbTopics.find(t => t.id === it.id);
            if (dt) {
              const dtIds = dt.questions?.map(q => String(q.id)) || [];
              const itIds = it.questions.map(q => String(q.id));

              const isSameStructure = JSON.stringify(dtIds) === JSON.stringify(itIds);
              const hasSolvedMigration = it.questions.some(iq => {
                const dq = dt.questions?.find(q => String(q.id) === String(iq.id));
                return iq.solved && (!dq || !dq.solved);
              });

              if (!isSameStructure || hasSolvedMigration) {
                const preservedQuestions = it.questions.map(iq => {
                  const existingQ = dt.questions?.find(q => String(q.id) === String(iq.id));
                  return existingQ ? {
                    ...iq,
                    solved: existingQ.solved || iq.solved || false,
                    bookmarked: existingQ.bookmarked || false,
                    comment: existingQ.comment || "",
                    solvedAt: existingQ.solvedAt || (iq.solved ? new Date().toISOString() : null)
                  } : iq;
                });

                const ref = doc(db, "topics", it.id);
                batch.update(ref, { questions: preservedQuestions });
                needsUpdate = true;
              }
            }
          });
          if (needsUpdate) await batch.commit();
        })();

        setTopics(mergedTopics);
        setLoading(false);

        // Seed missing topics
        (async () => {
          try {
            const batch = writeBatch(db);
            let hasNewData = false;
            ALL_INITIAL_TOPICS.forEach((topic) => {
              const topicExists = dbTopics.some(t => t.id === topic.id);
              if (!topicExists) {
                const topicRef = doc(collection(db, "topics"), topic.id);
                batch.set(topicRef, {
                  topicName: topic.topicName,
                  questions: topic.questions
                });
                hasNewData = true;
              }
            });
            if (hasNewData) await batch.commit();
          } catch (seedError) {
            console.warn("Background merge/seed failed:", seedError);
          }
        })();

      } catch (error) {
        console.error("Error fetching or timeout: ", error);
        setTopics(ALL_INITIAL_TOPICS);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoomLevel(prev => {
            const next = Math.min(prev + 10, 200);
            saveZoom(next);
            return next;
          });
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomLevel(prev => {
            const next = Math.max(prev - 10, 50);
            saveZoom(next);
            return next;
          });
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(100);
          saveZoom(100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveZoom = (level) => {
    // Debounced or direct save to Firestore
    const settingsRef = doc(db, "settings", "global");
    setDoc(settingsRef, { zoomLevel: level }, { merge: true })
      .catch(e => console.error("Failed to save zoom:", e));
  };

  const handleToggleSolved = (topicId, questionId) => {
    let updatedQuestions = null;

    const updater = (prevTopics) => {
      return prevTopics.map(topic => {
        if (topic.id === topicId) {
          const newQ = topic.questions.map(q => {
            if (q.id === questionId) {
              const nowSolved = !q.solved;
              return {
                ...q,
                solved: nowSolved,
                solvedAt: nowSolved ? new Date().toISOString() : null
              };
            }
            return q;
          });
          updatedQuestions = newQ;
          return { ...topic, questions: newQ };
        }
        return topic;
      });
    };

    setTopics(updater);

    // Defer Firestore write until after render
    setTimeout(() => {
      if (updatedQuestions) {
        updateDoc(doc(db, 'topics', topicId), { questions: updatedQuestions })
          .catch(e => console.error('Firestore update failed:', e));
      }
    }, 0);
  };

  const handleAddQuestion = (topicId, question) => {
    let updatedQuestions = null;

    const updater = (prevTopics) => {
      return prevTopics.map(topic => {
        if (topic.id === topicId) {
          const exists = topic.questions.some(q => String(q.id) === String(question.id));
          if (exists) return topic;
          
          const newQuestion = {
            id: String(question.id),
            title: question.title,
            difficulty: question.difficulty || 'Easy',
            leetcodeLink: question.leetcodeLink || `https://leetcode.com/problems/${question.title.toLowerCase().replace(/ /g, '-')}/`,
            solved: true,
            solvedAt: question.solvedAt || new Date().toISOString(),
            comment: "",
            bookmarked: false
          };
          
          const newQ = [...topic.questions, newQuestion];
          updatedQuestions = newQ;
          return { ...topic, questions: newQ };
        }
        return topic;
      });
    };

    setTopics(updater);

    setTimeout(() => {
      if (updatedQuestions) {
        updateDoc(doc(db, 'topics', topicId), { questions: updatedQuestions })
          .catch(e => console.error('Firestore update failed:', e));
      }
    }, 0);
  };

  const handleSaveComment = (topicId, questionId, comment) => {
    let updatedQuestions = null;

    const updater = (prevTopics) => {
      return prevTopics.map(topic => {
        if (topic.id === topicId) {
          const newQ = topic.questions.map(q =>
            q.id === questionId ? { ...q, comment } : q
          );
          updatedQuestions = newQ;
          return { ...topic, questions: newQ };
        }
        return topic;
      });
    };

    setTopics(updater);

    setTimeout(() => {
      if (updatedQuestions) {
        updateDoc(doc(db, 'topics', topicId), { questions: updatedQuestions })
          .catch(e => console.error('Firestore update failed:', e));
      }
    }, 0);
  };

  const handleToggleBookmark = (topicId, questionId) => {
    let updatedQuestions = null;

    const updater = (prevTopics) => {
      return prevTopics.map(topic => {
        if (topic.id === topicId) {
          const newQ = topic.questions.map(q =>
            q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q
          );
          updatedQuestions = newQ;
          return { ...topic, questions: newQ };
        }
        return topic;
      });
    };

    setTopics(updater);

    setTimeout(() => {
      if (updatedQuestions) {
        updateDoc(doc(db, 'topics', topicId), { questions: updatedQuestions })
          .catch(e => console.error('Firestore update failed:', e));
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p style={{ marginTop: '2rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          Syncing your progress...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <ScrollToTop />
        <div className="app-main-wrapper" style={{ 
          display: 'flex', 
          minHeight: `calc(100vh / ${zoomLevel / 100})`,
          width: `calc(100vw / ${zoomLevel / 100})`,
          background: 'var(--bg-dark)', 
          color: 'var(--text-main)',
          zoom: `${zoomLevel}%`,
          overflowX: 'hidden'
        }}>
          <Sidebar zoomLevel={zoomLevel} setZoomLevel={(level) => {
            setZoomLevel(level);
            saveZoom(level);
          }} />
          <CommandPalette
            topics={topics}
            onSearch={setSearchTerm}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
          />
          <main style={{ 
            flex: 1,
            marginLeft: '280px',
            position: 'relative',
            padding: '1rem',
            minHeight: '100%'
          }}>
            <TargetWidget topics={topics} />
            <Routes>
              <Route path="/" element={<HomePage topics={topics.filter(t => !t.id.startsWith('babbar') && t.id !== 'leetcode-top-150-plus')} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} />} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard topics={topics} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/gfg" element={<ErrorBoundary><GFGSheet topics={topics.filter(t => t.id.startsWith('babbar'))} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/topic/:id" element={<ErrorBoundary><TopicDetail topics={topics} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/gfg/topic/:id" element={<ErrorBoundary><TopicDetail topics={topics} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} isGfgOrigin={true} /></ErrorBoundary>} />
              <Route path="/roadmap" element={<ErrorBoundary><Roadmap topics={topics} /></ErrorBoundary>} />
              <Route path="/bookmarks" element={<ErrorBoundary><BookmarkPage topics={topics} onToggleBookmark={handleToggleBookmark} onToggleSolved={handleToggleSolved} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/activity" element={<ErrorBoundary><ActivityTracker topics={topics} /></ErrorBoundary>} />
              <Route path="/plan" element={<ErrorBoundary><StudyPlan topics={topics} /></ErrorBoundary>} />
              <Route path="/leetcode" element={<ErrorBoundary><LeetCodeSheet topics={topics.filter(t => !t.id.startsWith('babbar') && t.id !== 'leetcode-top-150-plus')} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/hot150" element={<ErrorBoundary><Hot150Sheet topics={topics} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} onAddQuestion={handleAddQuestion} /></ErrorBoundary>} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
