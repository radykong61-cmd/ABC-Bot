/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Gamepad2, Volume2, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { ALPHABET_DATA } from './data';
import { AppMode, LessonData } from './types';
import { speak, speakFallback, imagine } from './services/geminiService';

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentData = ALPHABET_DATA[currentLetterIdx];

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioUrl = await speak(text);
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
          audioRef.current.onended = () => setIsSpeaking(false);
        }
      } else {
        speakFallback(text);
        setIsSpeaking(false);
      }
    } catch (e) {
      speakFallback(text);
      setIsSpeaking(false);
    }
  };

  const handleImagine = async (data: LessonData) => {
    if (generatedImages[data.letter] || isGenerating[data.letter]) return;
    
    setIsGenerating(prev => ({ ...prev, [data.letter]: true }));
    
    // Construct prompt from lesson attributes
    const color = data.questions.find(q => q.type === 'color')?.answer || '';
    const location = data.questions.find(q => q.type === 'location')?.answer || '';
    const count = data.questions.find(q => q.type === 'count')?.answer || '';
    
    const prompt = `One ${data.word}, color: ${color}, located: ${location}. Specifically: ${count}. Artistic style.`;
    
    const url = await imagine(prompt);
    if (url) {
      setGeneratedImages(prev => ({ ...prev, [data.letter]: url }));
    }
    setIsGenerating(prev => ({ ...prev, [data.letter]: false }));
  };

  const nextLetter = () => {
    setCurrentLetterIdx((prev) => (prev + 1) % ALPHABET_DATA.length);
  };

  const prevLetter = () => {
    setCurrentLetterIdx((prev) => (prev - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length);
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-primary selection:bg-brand-accent-soft">
      <audio ref={audioRef} hidden />
      
      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto px-10 py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-primary">ABC Adventure</h1>
          <p className="text-brand-secondary font-medium tracking-wide uppercase text-sm">Unit 1 • Alphabet Fun</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-300 ${i === (currentLetterIdx % 5) ? 'w-6 bg-brand-accent' : 'w-2.5 bg-gray-200'}`} 
              />
            ))}
          </div>
          <button 
            onClick={() => setMode('menu')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${mode === 'menu' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'bg-white text-brand-secondary hover:bg-gray-50 border border-gray-100'}`}
          >
            All Letters
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 pb-12">
        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
            >
              {ALPHABET_DATA.map((item, idx) => (
                <button
                  key={item.letter}
                  onClick={() => {
                    setCurrentLetterIdx(idx);
                    setMode('lesson');
                  }}
                  className="aspect-square bg-brand-card border border-gray-100 rounded-brand p-8 flex flex-col items-center justify-center gap-3 hover:border-brand-accent hover:shadow-2xl hover:shadow-black/5 transition-all group"
                >
                  <span className="text-4xl font-black text-brand-primary group-hover:scale-110 group-hover:text-brand-accent transition-all">
                    {item.letter}
                  </span>
                  <span className="text-xs font-bold text-brand-secondary uppercase tracking-widest">
                    {item.word}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {mode === 'lesson' && (
            <LessonView 
              data={currentData} 
              onBack={() => setMode('menu')}
              onNext={nextLetter}
              onPrev={prevLetter}
              onSpeak={handleSpeak}
              onStartExercise={() => setMode('exercise')}
              isSpeaking={isSpeaking}
              generatedUrl={generatedImages[currentData.letter]}
              onGenerate={() => handleImagine(currentData)}
              isGenerating={isGenerating[currentData.letter]}
            />
          )}

          {mode === 'exercise' && (
            <ExerciseView 
              data={currentData} 
              onBack={() => setMode('lesson')}
              onSpeak={handleSpeak}
              generatedUrl={generatedImages[currentData.letter]}
              onGenerate={() => handleImagine(currentData)}
              isGenerating={isGenerating[currentData.letter]}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function LessonView({ 
  data, onBack, onNext, onPrev, onSpeak, onStartExercise, isSpeaking, generatedUrl, onGenerate, isGenerating
}: { 
  data: LessonData; 
  onBack: () => void; 
  onNext: () => void;
  onPrev: () => void;
  onSpeak: (text: string) => void;
  onStartExercise: () => void;
  isSpeaking: boolean;
  generatedUrl?: string;
  onGenerate: () => void;
  isGenerating?: boolean;
}) {
  useEffect(() => {
    if (!generatedUrl && !isGenerating) {
      onGenerate();
    }
  }, [data.letter, generatedUrl, isGenerating, onGenerate]);

  return (
    <motion.div
      key={`lesson-${data.letter}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8 px-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-secondary hover:text-brand-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit Lesson</span>
        </button>
        
        <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={onPrev} className="p-3 hover:bg-brand-bg rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-2xl font-black w-12 text-center text-brand-accent">{data.letter}</span>
          <button onClick={onNext} className="p-3 hover:bg-brand-bg rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-brand-card p-10 rounded-brand shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 flex flex-col items-center justify-center relative min-h-[500px]">
          <div className="w-72 h-72 bg-brand-accent-soft rounded-full flex items-center justify-center mb-12 overflow-hidden shadow-inner relative">
             {isGenerating ? (
               <div className="flex flex-col items-center gap-2">
                 <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                 <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Creating Image...</span>
               </div>
             ) : (
               <img 
                  src={generatedUrl || `https://loremflickr.com/600/600/${data.imageKeyword}`}
                  alt={data.word}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
             )}
             {generatedUrl && (
               <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                 <Sparkles className="w-4 h-4 text-brand-accent" />
               </div>
             )}
          </div>
          
          <button 
            onClick={() => onSpeak(data.word)}
            disabled={isSpeaking}
            className="absolute bottom-10 bg-brand-accent text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-xl shadow-brand-accent/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Volume2 className="w-6 h-6" />
            Listen to Pronunciation
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-brand-card p-10 rounded-brand shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 flex-grow">
            <h2 className="text-xs font-black text-brand-secondary uppercase tracking-[0.2em] mb-8">Guided Phrases</h2>
            <div className="space-y-8">
              {data.questions.map((q, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-accent-soft" 
                  onClick={() => onSpeak(`${q.question} ${q.answer}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-brand-bg group-hover:bg-white flex items-center justify-center text-brand-secondary text-sm font-black shrink-0 transition-colors">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-brand-secondary font-bold text-sm group-hover:text-brand-accent transition-colors">{q.question}</p>
                      <p className="text-2xl font-bold text-brand-primary leading-tight">→ {q.answer}</p>
                    </div>
                  </div>
                  <div className="mt-1 opacity-20 group-hover:opacity-100 group-hover:text-brand-accent transition-all">
                    <Volume2 className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onStartExercise}
            className="w-full bg-brand-primary text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-brand-accent transition-all shadow-xl shadow-black/10"
          >
            <Gamepad2 className="w-7 h-7" />
            Master this Letter
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ExerciseView({ data, onBack, onSpeak, generatedUrl, onGenerate, isGenerating }: { 
  data: LessonData, onBack: () => void, onSpeak: (t: string) => void,
  generatedUrl?: string, onGenerate: () => void, isGenerating?: boolean
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const baseQuestions = data.questions.filter(q => q.type !== 'like');
  const spellingQuestion = {
    type: 'spelling' as const,
    question: `How do we spell "${data.word}"?`,
    answer: data.word.toLowerCase()
  };
  const questions = [...baseQuestions, spellingQuestion];
  const q = questions[currentStep];

  const [spellingInput, setSpellingInput] = useState<string[]>([]);
  const shuffledLetters = useRef(data.word.toLowerCase().split('').sort(() => Math.random() - 0.5)).current;

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer.toLowerCase() === q.answer.toLowerCase() || (q.type === 'identity' && answer === q.answer);
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      onSpeak("Correct!");
    } else {
      onSpeak("Try again");
    }
  };

  const nextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setSpellingInput([]);
    } else {
      setFinished(true);
    }
  };

  const options = useMemo(() => {
    if (q.type === 'spelling') return [];
    const getFakes = () => {
      if (q.type === 'identity') return ["It's a banana.", "It's an orange.", "It's a house."];
      if (q.type === 'color') return ["It's black.", "It's blue.", "It's green."];
      if (q.type === 'count') return ["There are 10.", "There are none.", "There is one."];
      return ["In the kitchen.", "At the store.", "In the park."];
    };
    return [q.answer, ...getFakes().slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [q]);

  if (finished) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto text-center py-20 bg-brand-card p-12 rounded-brand shadow-2xl shadow-black/5 border border-black/5"
      >
        <div className="w-24 h-24 bg-brand-accent-soft rounded-full flex items-center justify-center text-brand-accent mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black mb-3 text-brand-primary">Great Progress!</h2>
        <p className="text-xl text-brand-secondary mb-10 font-bold">You've earned <span className="text-brand-accent">{score} / {questions.length}</span> stars!</p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => {
              setCurrentStep(0);
              setSelectedAnswer(null);
              setIsCorrect(null);
              setScore(0);
              setFinished(false);
              setSpellingInput([]);
            }}
            className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-brand-accent shadow-xl shadow-black/10 transition-all active:scale-95"
          >
            Retry Practice
          </button>
          <button 
            onClick={onBack}
            className="w-full bg-brand-accent-soft text-brand-accent py-5 rounded-2xl font-black text-lg hover:bg-brand-accent hover:text-white transition-all active:scale-95"
          >
            Back to Lesson
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8 px-2">
        <button onClick={onBack} className="text-brand-secondary hover:text-brand-primary flex items-center gap-2 font-black transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Stop Practice</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-brand-card p-10 rounded-brand shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 flex flex-col items-center justify-center relative min-h-[500px]">
          <div className="w-64 h-64 bg-brand-accent-soft rounded-full flex items-center justify-center mb-10 overflow-hidden shadow-inner relative">
             {isGenerating ? (
               <div className="flex flex-col items-center gap-2">
                 <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
               </div>
             ) : (
               <img 
                  src={generatedUrl || `https://loremflickr.com/800/800/${data.imageKeyword}`}
                  alt="Exercise Visual"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
             )}
          </div>
          
          <div className="text-center px-4 mb-20">
             <h3 className="text-2xl font-black text-brand-primary mb-4 leading-tight">{q.question}</h3>
             <button 
                onClick={() => onSpeak(q.question)}
                className="mx-auto flex items-center gap-3 text-brand-accent font-black hover:scale-105 transition-transform"
             >
               <Volume2 className="w-6 h-6" />
               Hear Question
             </button>
          </div>

          {isCorrect === true && (
            <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1 }}
               className="absolute top-10 right-10 bg-brand-success text-white p-4 rounded-full shadow-lg"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
          )}

          {selectedAnswer && (
            <button 
              onClick={nextQuestion}
              className="absolute bottom-10 bg-brand-primary text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-4 shadow-2xl shadow-black/20 hover:bg-brand-accent transition-all animate-bounce"
            >
              Continue <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {q.type === 'spelling' ? (
            <div className="bg-brand-card p-10 rounded-brand border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-10 flex flex-col justify-center min-h-[500px]">
              <div className="flex flex-wrap gap-2 justify-center">
                {data.word.split('').map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-12 h-16 border-2 rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${
                      spellingInput[i] ? 'border-brand-accent bg-brand-accent-soft text-brand-accent shadow-sm' : 'border-[#EDF2F7] bg-brand-bg'
                    }`}
                  >
                    {spellingInput[i] || ''}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {shuffledLetters.map((letter, i) => {
                  const countInInput = spellingInput.filter(l => l === letter).length;
                  const countInTarget = data.word.toLowerCase().split('').filter(l => l === letter).length;
                  const isUsed = countInInput >= countInTarget;
                  
                  return (
                    <button
                      key={i}
                      disabled={isUsed || selectedAnswer !== null}
                      onClick={() => {
                        const next = [...spellingInput, letter];
                        setSpellingInput(next);
                        if (next.length === data.word.length) {
                          handleAnswer(next.join(''));
                        }
                      }}
                      className={`w-14 h-14 rounded-2xl font-black text-2xl transition-all ${
                        isUsed 
                          ? 'opacity-10 cursor-not-allowed scale-90' 
                          : 'bg-white border-2 border-[#EDF2F7] hover:border-brand-accent text-brand-primary hover:bg-brand-accent-soft hover:shadow-lg active:scale-95'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setSpellingInput([])}
                  disabled={selectedAnswer !== null || spellingInput.length === 0}
                  className="w-14 h-14 rounded-2xl border-2 border-red-50 text-red-400 font-black flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <XCircle />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-8 rounded-brand border-2 text-left font-bold text-xl transition-all flex items-center gap-6 group ${
                    selectedAnswer === opt
                      ? opt === q.answer
                        ? 'border-brand-success bg-green-50 text-brand-success'
                        : 'border-red-500 bg-red-50 text-red-500'
                      : selectedAnswer !== null && opt === q.answer
                        ? 'border-brand-success bg-green-50 text-brand-success'
                        : 'border-[#EDF2F7] bg-white hover:border-brand-accent hover:bg-brand-accent-soft text-brand-secondary hover:text-brand-accent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                    selectedAnswer === opt
                      ? opt === q.answer ? 'bg-brand-success text-white' : 'bg-red-500 text-white'
                      : 'bg-brand-bg text-brand-secondary group-hover:bg-brand-accent group-hover:text-white'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="flex-grow">{opt}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

