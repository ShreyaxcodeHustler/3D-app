import { useEffect, useMemo, useState } from "react";
import type { TopicDTO } from "../../stores/universeStore";
import { useProgressStore } from "../../stores/progressStore";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useAuthStore } from "../../stores/authStore";
import DSAVisualizer from "../visualizers/DSAVisualizer";

type TabKey = "overview" | "visualization" | "code" | "quiz" | "bookmark";

export default function TopicPanel({ topic, onClose }: { topic: TopicDTO; onClose: () => void }) {
  const { markComplete, upsertProgress } = useProgressStore();
  const { isBookmarked, toggleBookmark, load: loadBookmarks } = useBookmarkStore();
  const { status: authStatus, accessToken } = useAuthStore();
  const canPersist = authStatus === "authenticated" && Boolean(accessToken);
  const [tab, setTab] = useState<TabKey>("overview");

  const [codeDraft, setCodeDraft] = useState(topic.code || "");
  const hasVisualization = topic.visualization?.type && topic.visualization.type !== "none";

  const quizQuestions = topic.quiz || [];
  const quizEnabled = quizQuestions.length > 0;

  // Quiz UI state
  const [qIndex, setQIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [guestNotice, setGuestNotice] = useState<string | null>(null);

  const bookmarked = isBookmarked(topic.id);

  useEffect(() => {
    // Initialize local bookmark list.
    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When opening a new topic, reset panel UI.
    setTab("overview");
    setCodeDraft(topic.code || "");
    setQIndex(0);
    setSelectedOptionIndex(null);
    setSubmitted(false);
    setSubmitting(false);
    setCompleted(false);
    setGuestNotice(null);

    // Ensure user has an in-progress row as soon as they open the topic (auth only).
    if (canPersist) {
      upsertProgress(topic.id, { status: "in_progress", lastStepIndex: 0, attempts: 0 }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id, canPersist]);

  const difficultyColor = useMemo(() => {
    switch (topic.difficulty) {
      case "Easy":
        return "text-neon-2";
      case "Medium":
        return "text-neon";
      case "Hard":
        return "text-warn";
      default:
        return "text-white";
    }
  }, [topic.difficulty]);

  const currentQuestion = quizQuestions[qIndex];

  const onSubmitQuiz = async () => {
    if (!currentQuestion || selectedOptionIndex === null) return;
    setSubmitted(true);

    const isCorrect = selectedOptionIndex === currentQuestion.answerIndex;
    if (!isCorrect) return;

    if (qIndex < quizQuestions.length - 1) {
      // Move on to next question.
      setTimeout(() => {
        setQIndex((i) => i + 1);
        setSelectedOptionIndex(null);
        setSubmitted(false);
      }, 450);
      return;
    }

    // Last correct answer => mark topic complete.
    setSubmitting(true);
    try {
      if (!canPersist) {
        setGuestNotice("Sign in to save progress and mark this topic as completed.");
        return;
      }

      await markComplete(topic.id);
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => {
        // Click outside panel to close.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] lg:w-[620px] bg-bg-2 border-l border-white/10 p-4 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-neon text-xs tracking-widest uppercase font-semibold">Topic</div>
            <h2 className="text-white font-semibold text-xl mt-1 truncate">{topic.title}</h2>
            <div className="text-white/70 text-sm mt-1">
              <span className={difficultyColor}>{topic.difficulty}</span>
              <span className="text-white/40 mx-2">·</span>
              <span>{topic.category}</span>
            </div>
          </div>
          <button
            className="shrink-0 px-3 py-2 rounded-xl border border-white/10 text-white/70 hover:border-neon/60 hover:text-white"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            className={`px-3 py-2 rounded-xl border text-sm whitespace-nowrap ${
              tab === "overview" ? "border-neon/60 text-white bg-white/5" : "border-white/10 text-white/70 hover:border-neon/60"
            }`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          {hasVisualization ? (
            <button
              type="button"
              className={`px-3 py-2 rounded-xl border text-sm whitespace-nowrap ${
                tab === "visualization"
                  ? "border-neon/60 text-white bg-white/5"
                  : "border-white/10 text-white/70 hover:border-neon/60"
              }`}
              onClick={() => setTab("visualization")}
            >
              Visualization
            </button>
          ) : null}
          {topic.code ? (
            <button
              type="button"
              className={`px-3 py-2 rounded-xl border text-sm whitespace-nowrap ${
                tab === "code" ? "border-neon/60 text-white bg-white/5" : "border-white/10 text-white/70 hover:border-neon/60"
              }`}
              onClick={() => setTab("code")}
            >
              Code
            </button>
          ) : null}
          {quizEnabled ? (
            <button
              type="button"
              className={`px-3 py-2 rounded-xl border text-sm whitespace-nowrap ${
                tab === "quiz" ? "border-neon/60 text-white bg-white/5" : "border-white/10 text-white/70 hover:border-neon/60"
              }`}
              onClick={() => setTab("quiz")}
            >
              Quiz
            </button>
          ) : null}
          <button
            type="button"
            className={`px-3 py-2 rounded-xl border text-sm whitespace-nowrap ${
              tab === "bookmark" ? "border-neon/60 text-white bg-white/5" : "border-white/10 text-white/70 hover:border-neon/60"
            }`}
            onClick={() => setTab("bookmark")}
          >
            Bookmark
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-auto pr-1">
          {!canPersist ? (
            <div className="mb-3 rounded-2xl border border-white/10 bg-black/10 p-3 text-sm text-white/70">
              Explore freely as a guest. To save progress, complete quizzes, and update your dashboard, sign in.
            </div>
          ) : null}

          {tab === "overview" ? (
            <div className="text-white/80 text-sm leading-relaxed">
              <p className="whitespace-pre-wrap">{topic.description}</p>
              {topic.content ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
                  <pre className="whitespace-pre-wrap text-white/80">{topic.content}</pre>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "visualization" ? (
            <div className="mt-2">
              <DSAVisualizer
                topic={topic}
                onProgressChange={(lastStepIndex) => {
                  if (!canPersist) return;
                  upsertProgress(topic.id, { status: "in_progress", lastStepIndex }).catch(() => {});
                }}
              />
            </div>
          ) : null}

          {tab === "code" ? (
            <div className="mt-2">
              <div className="text-white/70 text-xs uppercase tracking-widest">Code Editor (local draft)</div>
              <textarea
                className="mt-2 w-full min-h-[260px] rounded-2xl border border-white/10 bg-black/20 p-3 font-mono text-sm text-white/90 outline-none focus:border-neon/60"
                value={codeDraft}
                onChange={(e) => setCodeDraft(e.target.value)}
              />
              <div className="text-white/50 text-xs mt-2">
                Draft is editable for learning; save/export can be added later.
              </div>
            </div>
          ) : null}

          {tab === "quiz" ? (
            <div className="mt-2">
              {quizQuestions.length ? (
                <>
                  <div className="text-white/70 text-xs uppercase tracking-widest">
                    Question {qIndex + 1} / {quizQuestions.length}
                  </div>
                  <div className="text-white font-semibold mt-2 text-sm">{currentQuestion.question}</div>

                  <div className="mt-3 flex flex-col gap-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const correct = submitted && idx === currentQuestion.answerIndex;
                      const wrong = submitted && isSelected && idx !== currentQuestion.answerIndex;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={submitting}
                          className={`text-left px-3 py-2 rounded-xl border ${
                            correct
                              ? "border-neon/60 bg-neon/10 text-neon"
                              : wrong
                              ? "border-red-300/60 bg-red-300/10 text-red-200"
                              : isSelected
                              ? "border-neon/60 bg-white/5 text-white"
                              : "border-white/10 text-white/80 hover:border-neon/60"
                          }`}
                          onClick={() => {
                            if (submitted) return;
                            setSelectedOptionIndex(idx);
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && selectedOptionIndex !== null ? (
                    <div className="mt-3 text-sm">
                      <div className="text-white/80">
                        {selectedOptionIndex === currentQuestion.answerIndex ? "Correct." : "Not quite."}
                      </div>
                      {selectedOptionIndex !== currentQuestion.answerIndex && currentQuestion.explanation ? (
                        <div className="text-white/60 mt-1">{currentQuestion.explanation}</div>
                      ) : null}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    disabled={selectedOptionIndex === null || submitting}
                    className="mt-4 w-full px-4 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 disabled:opacity-60"
                    onClick={onSubmitQuiz}
                  >
                    {submitting ? "Submitting…" : qIndex === quizQuestions.length - 1 ? "Finish" : "Check & Continue"}
                  </button>

                  {completed ? (
                    <div className="mt-4 rounded-2xl border border-neon/40 bg-black/10 p-3 text-neon">
                      Topic completed. Your progress has been saved.
                    </div>
                  ) : null}

                  {!completed && guestNotice ? (
                    <div className="mt-4 rounded-2xl border border-neon/40 bg-black/10 p-3 text-neon">
                      {guestNotice}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-white/70 text-sm">No quiz for this topic.</div>
              )}
            </div>
          ) : null}

          {tab === "bookmark" ? (
            <div className="mt-2">
              <div className="text-white/70 text-xs uppercase tracking-widest">Keep for later</div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-white font-semibold">{bookmarked ? "Bookmarked" : "Not bookmarked yet"}</div>
                <div className="text-white/60 text-sm mt-1">{topic.title}</div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(topic.id)}
                    className="px-4 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110"
                  >
                    {bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

