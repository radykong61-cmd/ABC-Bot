/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Upload, Brain, Table as TableIcon, 
  ChevronRight, Search, Download, Trash2, 
  CreditCard, Clock, UserCheck, AlertCircle,
  FileCheck, Loader2, Sparkles, X, Plus, Filter
} from 'lucide-react';
import { Student, ExtractionMode } from './types';
import { parseStudentData } from './services/geminiService';

const MODE_CONFIG: Record<ExtractionMode, { icon: any, label: string, color: string }> = {
  Hall: { icon: UserCheck, label: 'Hall Study', color: 'bg-blue-500' },
  Finance: { icon: CreditCard, label: 'Finance & Fees', color: 'bg-emerald-500' },
  Attendance: { icon: FileCheck, label: 'Attendance', color: 'bg-indigo-500' },
  DailyTask: { icon: Clock, label: 'Daily Task', color: 'bg-amber-500' },
  Penalty: { icon: AlertCircle, label: 'Penalty Log', color: 'bg-rose-500' },
  PenaltyHall: { icon: AlertCircle, label: 'Hall Penalty', color: 'bg-orange-500' },
};

export default function App() {
  const [students, setStudents] = useState<Partial<Student>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ExtractionMode>('Hall');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!inputText && !selectedFile) return;
    
    setIsProcessing(true);
    try {
      const results = await parseStudentData(inputText, selectedFile || undefined, mode);
      if (results) {
        setStudents(prev => [...results, ...prev]);
        setInputText('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.displayId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.level?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1C1E21] selection:bg-blue-100">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E4E6EB] p-6 hidden lg:flex flex-col gap-8 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Student AI</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Intelligence Suite</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 ml-2">Extraction Modes</p>
          {(Object.keys(MODE_CONFIG) as ExtractionMode[]).map((m) => {
            const config = MODE_CONFIG[m];
            const Icon = config.icon;
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="text-sm">{config.label}</span>
                {isActive && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-gray-700">Multi-Key Engine</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            API throughput optimized across multiple redundant Gemini nodes.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 md:p-10">
        <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">
              <TableIcon className="w-4 h-4" />
              <span>Smart Extraction Dashboard</span>
            </div>
            <h2 className="text-3xl font-black text-[#1C1E21]">Extraction Workspace</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl border border-[#E4E6EB] p-2 flex items-center shadow-sm">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input 
                type="text" 
                placeholder="Find student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none px-4 py-2 text-sm w-48 lg:w-64"
              />
            </div>
            <button className="bg-white p-4 rounded-xl border border-[#E4E6EB] shadow-sm hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[24px] border border-[#E4E6EB] shadow-sm p-8 space-y-6 sticky top-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Source Data
                </h3>
                <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-black ${MODE_CONFIG[mode].color} uppercase`}>
                  {mode}
                </span>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                    selectedFile 
                      ? 'border-blue-400 bg-blue-50/50' 
                      : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <FileCheck className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-blue-700 truncate max-w-[150px]">{selectedFile.name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-[10px] text-red-500 font-bold uppercase mt-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                        <Upload className="text-gray-400 w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-700">Drop image or scan</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Supports JPEG, PNG, PDF</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="...or paste raw text context here"
                    className="w-full h-40 bg-gray-50 rounded-2xl p-4 text-sm border border-gray-100 outline-none focus:bg-white focus:border-blue-300 transition-all resize-none font-mono"
                  />
                  <div className="absolute top-4 right-4 opacity-10">
                    <FileText className="w-8 h-8" />
                  </div>
                </div>

                <button 
                  onClick={handleProcess}
                  disabled={isProcessing || (!inputText && !selectedFile)}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing OCR & Intelligence...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Analyze with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-gray-400" />
                Parsed Records ({filteredStudents.length})
              </h3>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Recent Arrivals</span>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredStudents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-[#E4E6EB] rounded-[24px] p-20 text-center space-y-4 shadow-sm"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-gray-200" />
                  </div>
                  <h4 className="font-black text-xl text-gray-300 uppercase tracking-tighter italic">Ready for input</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">Upload an image or paste text to extract structured student data automatically.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student, idx) => (
                    <motion.div
                      key={`${student.name}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-[#E4E6EB] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-lg">
                            {student.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-[#1C1E21]">{student.name}</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {student.displayId && <Badge label={`ID: ${student.displayId}`} color="bg-gray-100 text-gray-600" />}
                              {student.level && <Badge label={student.level} color="bg-blue-100 text-blue-700" />}
                              {student.startDate && <Badge label={`Start: ${student.startDate}`} color="bg-emerald-50 text-emerald-700" />}
                              {student.deadline && <Badge label={`Deadline: ${student.deadline}`} color="bg-amber-50 text-amber-700" />}
                              {student.schoolFee && <Badge label={`Fee: ${student.schoolFee}`} color="bg-purple-100 text-purple-700" />}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duration</p>
                            <p className="text-sm font-bold text-gray-700">{student.duration || 'N/A'}</p>
                          </div>
                          <button 
                            onClick={() => setStudents(prev => prev.filter((_, i) => i !== idx))}
                            className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Detail View Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-50">
                        <InfoItem label="Time" value={student.time || 'Not set'} />
                        <InfoItem label="Teacher" value={student.teachers || 'No teacher'} />
                        <InfoItem label="Subject" value={student.subject || 'All subjects'} />
                        <InfoItem label="Schedule" value={student.schedule || 'Flexible'} />
                      </div>

                      {/* Penalty/Payment Status */}
                      {(student.penaltyType1 || student.payments) && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex flex-wrap gap-4">
                           {student.penaltyType1 && (
                             <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-700">Penalty: {student.penaltyType1} ({student.penaltyDate1})</span>
                             </div>
                           )}
                           {student.payments && Object.keys(student.payments).length > 0 && (
                             <div className="flex flex-wrap gap-2">
                               {Object.entries(student.payments).map(([period, status]) => (
                                 <span key={period} className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${(status as string).toLowerCase() === 'paid' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                   {period}: {status}
                                 </span>
                               ))}
                             </div>
                           )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Nav Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-50">
         <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
           <Plus className="w-7 h-7" />
         </button>
         <button onClick={() => {}} className="w-14 h-14 bg-white text-gray-500 border border-gray-200 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
           <Filter className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string, color: string }) {
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-sm tracking-wide ${color}`}>
      {label}
    </span>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-gray-600 truncate">{value}</p>
    </div>
  );
}
