import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { NLPClassificationResponse, Assessment } from '../types';
import {
  BookOpen,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  Tag,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface SubjectOption {
  subject_id: number;
  subject_code: string;
  subject_name: string;
}

const sampleQuestions = [
  {
    text: 'Define binary search algorithm and analyze its worst-case time complexity.',
    subjectId: 2, // Data Structures
    label: 'Analysis · Data Structures',
  },
  {
    text: 'Design a normalized relational database schema in Boyce-Codd Normal Form (BCNF) for an airline reservation system.',
    subjectId: 3, // DBMS
    label: 'Creation/Design · DBMS',
  },
  {
    text: 'Explain the three-way handshake mechanism used by the Transmission Control Protocol (TCP) to establish a reliable connection.',
    subjectId: 4, // Computer Networks
    label: 'Comprehension · Computer Networks',
  },
  {
    text: 'Calculate the fidelity of a quantum state under depolarizing channel noise.',
    subjectId: 1, // Quantum Computing
    label: 'Application · Quantum Computing',
  },
];

export const QuestionClassifier: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<NLPClassificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch unique subjects from /api/assessments/
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const res = await api.get('/api/assessments/');
        if (res.data.status === 'success' && Array.isArray(res.data.assessments)) {
          const map = new Map<number, SubjectOption>();
          res.data.assessments.forEach((a: Assessment) => {
            if (!map.has(a.subject_id)) {
              map.set(a.subject_id, {
                subject_id: a.subject_id,
                subject_code: a.subject_code,
                subject_name: a.subject_name,
              });
            }
          });
          const uniqueSubjects = Array.from(map.values());
          setSubjects(uniqueSubjects);
          if (uniqueSubjects.length > 0) {
            setSubjectId(String(uniqueSubjects[0].subject_id));
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionText.trim()) {
      setError('Please enter a question string to analyze');
      return;
    }

    setError(null);
    setIsClassifying(true);
    setClassification(null);

    try {
      const payload: { question_text: string; subject_id?: number } = {
        question_text: questionText.trim(),
      };
      if (subjectId) {
        payload.subject_id = parseInt(subjectId, 10);
      }

      const res = await api.post('/api/nlp/classify-question', payload);
      if (res.data.status === 'success') {
        setClassification(res.data);
      } else {
        setError(res.data.message || 'Classification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error communicating with NLP engine');
    } finally {
      setIsClassifying(false);
    }
  };

  const loadSample = (sample: { text: string; subjectId: number }) => {
    setQuestionText(sample.text);
    setSubjectId(String(sample.subjectId));
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Introduction Banner */}
      <div className="academic-card p-6 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-200 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-navy-800" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Bloom's Revised Taxonomy & CO Suggestion Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Syntactic NLP analyzer evaluates examination questions against action verbs and cognitive complexity hierarchies (Remember, Understand, Apply, Analyze, Evaluate, Create) while mapping content keywords to course outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="academic-card p-6">
        <form onSubmit={handleClassify} className="space-y-4">
          {/* Subject Dropdown (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Subject Context (Optional for CO Mapping)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={isLoadingSubjects || isClassifying}
              className="w-full sm:w-80 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-navy-600"
            >
              <option value="">No subject context (Bloom's Level only)</option>
              {subjects.map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  [{sub.subject_code}] {sub.subject_name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Examination Question Text <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {questionText.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Formulate a dynamic programming solution for the 0/1 Knapsack problem and establish its recurrence relation..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 leading-relaxed font-sans"
              required
            ></textarea>
          </div>

          {/* Sample Prompts */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Test Samples:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isClassifying || !questionText.trim()}
              className="px-6 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-navy-900/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isClassifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running NLP Classifier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Classify Bloom's Level & Map CO</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Classification Result Card */}
      {classification && (
        <div className="academic-card p-6 space-y-5 bg-white border-2 border-navy-700/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                NLP Classification Diagnostics
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
              Confidence: {classification.bloom_classification.confidence.toUpperCase()}
            </span>
          </div>

          {/* Grid of Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloom's Taxonomy Result */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Predicted Cognitive Complexity (Bloom's Revised)
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-bold text-navy-900">
                  {classification.bloom_classification.predicted_level}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {classification.bloom_classification.confidence} confidence
                </span>
              </div>

              {/* Matched Verbs */}
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Extracted Action Verbs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {classification.bloom_classification.matched_verbs &&
                  classification.bloom_classification.matched_verbs.length > 0 ? (
                    classification.bloom_classification.matched_verbs.map((verb, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-navy-100 text-navy-800"
                      >
                        {verb}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No direct action verbs detected</span>
                  )}
                </div>
              </div>

              {/* All Signals Found */}
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  All Cognitive Signals Detected:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {classification.bloom_classification.all_signals_found &&
                  classification.bloom_classification.all_signals_found.length > 0 ? (
                    classification.bloom_classification.all_signals_found.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700"
                      >
                        {sig}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Course Outcome (CO) Suggestion */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Automated Course Outcome (CO) Mapping
              </div>

              {classification.co_suggestion ? (
                <div className="space-y-3">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-2xl font-bold text-amber-700 font-mono">
                      {classification.co_suggestion.suggested_co}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Match Score: {classification.co_suggestion.match_score}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Based on domain syllabus keywords and Bloom's verb correlation, this question is mapped to Course Outcome{' '}
                    <span className="font-bold text-slate-900">{classification.co_suggestion.suggested_co}</span> (CO ID: {classification.co_suggestion.co_id}).
                  </p>

                  <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Audit Compliance:</span> Question can be directly assigned to {classification.co_suggestion.suggested_co} in question paper blue-prints.
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Select a subject context above to enable automated Course Outcome keyword matching.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
