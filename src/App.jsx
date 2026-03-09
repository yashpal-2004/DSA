import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { initialTopics } from './data/initialData';
import { babbarTopics } from './data/babbarData';
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

  // Combined Initial Data
  const ALL_INITIAL_TOPICS = [...initialTopics, ...babbarTopics];

  // Fetch topics from Firestore
  useEffect(() => {
    const fetchTopics = async () => {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Firebase Fetch Timeout")), 3000);
      });

      try {
        const querySnapshot = await Promise.race([
          getDocs(collection(db, "topics")),
          timeout
        ]);

        let dbTopics = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mergedTopics = ALL_INITIAL_TOPICS.map(initialTopic => {
          const dbTopic = dbTopics.find(t => t.id === initialTopic.id);
          if (dbTopic) {
            const mergedQuestions = initialTopic.questions.map(iq => {
              // Use string conversion for robust ID matching
              const dq = dbTopic.questions?.find(q => String(q.id) === String(iq.id));
              return dq ? {
                ...iq,
                solved: dq.solved || false,
                bookmarked: dq.bookmarked || false,
                comment: dq.comment || "",
                solvedAt: dq.solvedAt || null
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

              if (!isSameStructure) {
                // Topic structure changed in code (new questions added or removed)
                // We must update Firestore but PRESERVE the existing solved/bookmark/comment status
                const preservedQuestions = it.questions.map(iq => {
                  const existingQ = dt.questions?.find(q => String(q.id) === String(iq.id));
                  return existingQ ? {
                    ...iq,
                    solved: existingQ.solved || false,
                    bookmarked: existingQ.bookmarked || false,
                    comment: existingQ.comment || "",
                    solvedAt: existingQ.solvedAt || null
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

        // Seed missing topics to Firestore (including Babbar ones)
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

            if (hasNewData) {
              await batch.commit();
            }
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

    fetchTopics();
  }, []);

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
        <div className="app-main-wrapper" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
          <Sidebar />
          <CommandPalette
            topics={topics}
            onSearch={setSearchTerm}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
          />
          <main style={{ flex: 1, marginLeft: '280px', minHeight: '100vh', padding: '1rem' }}>
            <Routes>
              <Route path="/" element={<HomePage topics={topics} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} />} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard topics={topics.filter(t => !t.id.startsWith('babbar'))} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/gfg" element={<ErrorBoundary><GFGSheet topics={topics.filter(t => t.id.startsWith('babbar'))} searchTerm={searchTerm} searchMode={searchMode} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/topic/:id" element={<ErrorBoundary><TopicDetail topics={topics} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/gfg/topic/:id" element={<ErrorBoundary><TopicDetail topics={topics} onToggleSolved={handleToggleSolved} onToggleBookmark={handleToggleBookmark} onSaveComment={handleSaveComment} isGfgOrigin={true} /></ErrorBoundary>} />
              <Route path="/roadmap" element={<ErrorBoundary><Roadmap topics={topics} /></ErrorBoundary>} />
              <Route path="/bookmarks" element={<ErrorBoundary><BookmarkPage topics={topics} onToggleBookmark={handleToggleBookmark} onToggleSolved={handleToggleSolved} onSaveComment={handleSaveComment} /></ErrorBoundary>} />
              <Route path="/activity" element={<ErrorBoundary><ActivityTracker topics={topics} /></ErrorBoundary>} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
