/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  Clock, 
  BookOpen, 
  Calculator, 
  Trophy, 
  MessageSquare, 
  X, 
  Send, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Heart, 
  Monitor,
  Flame,
  Coffee,
  Moon,
  Smartphone,
  Droplets,
  Calendar,
  ChevronDown,
  Info,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Data ---

const EXAM_SCHEDULE = [
  { id: 'b1', nameEn: 'Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র', date: '2026-04-21T10:00:00+06:00', group: 'All', icon: '📖' },
  { id: 'b2', nameEn: 'Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র', date: '2026-04-22T10:00:00+06:00', group: 'All', icon: '📝' },
  { id: 'e1', nameEn: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র', date: '2026-04-24T10:00:00+06:00', group: 'All', icon: '🔤' },
  { id: 'e2', nameEn: 'English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র', date: '2026-04-25T10:00:00+06:00', group: 'All', icon: '✍️' },
  { id: 'math', nameEn: 'Mathematics', nameBn: 'সাধারণ গণিত', date: '2026-04-27T10:00:00+06:00', group: 'All', icon: '🔢' },
  { id: 'rel', nameEn: 'Religion', nameBn: 'ধর্ম শিক্ষা', date: '2026-04-28T10:00:00+06:00', group: 'All', icon: '🕌' },
  { id: 'bgs', nameEn: 'BGS', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', date: '2026-04-30T10:00:00+06:00', group: 'All', icon: '🌍' },
  { id: 'ict', nameEn: 'ICT', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', date: '2026-05-01T10:00:00+06:00', group: 'All', icon: '💻' },
  { id: 'phys', nameEn: 'Physics', nameBn: 'পদার্থবিজ্ঞান', date: '2026-05-04T10:00:00+06:00', group: 'Science', icon: '⚛️' },
  { id: 'chem', nameEn: 'Chemistry', nameBn: 'রসায়ন', date: '2026-05-05T10:00:00+06:00', group: 'Science', icon: '🧪' },
  { id: 'bio', nameEn: 'Biology', nameBn: 'জীববিজ্ঞান', date: '2026-05-06T10:00:00+06:00', group: 'Science', icon: '🧬' },
  { id: 'hmath', nameEn: 'Higher Mathematics', nameBn: 'উচ্চতর গণিত', date: '2026-05-07T10:00:00+06:00', group: 'Science', icon: '📐' },
  { id: 'agri', nameEn: 'Agriculture / Home Science', nameBn: 'কৃষিশিক্ষা / গার্হস্থ্য বিজ্ঞান', date: '2026-05-08T10:00:00+06:00', group: 'All', icon: '🌾' },
  { id: 'acc', nameEn: 'Accounting', nameBn: 'হিসাববিজ্ঞান', date: '2026-05-11T10:00:00+06:00', group: 'Commerce', icon: '📊' },
  { id: 'bus', nameEn: 'Business Entrepreneurship', nameBn: 'ব্যবসায় উদ্যোগ', date: '2026-05-12T10:00:00+06:00', group: 'Commerce', icon: '💼' },
  { id: 'fin', nameEn: 'Finance & Banking', nameBn: 'ফিন্যান্স ও ব্যাংকিং', date: '2026-05-13T10:00:00+06:00', group: 'Commerce', icon: '🏦' },
  { id: 'hist', nameEn: 'History of Bangladesh & World', nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', date: '2026-05-15T10:00:00+06:00', group: 'Humanities', icon: '🏛️' },
  { id: 'econ', nameEn: 'Economics', nameBn: 'অর্থনীতি', date: '2026-05-18T10:00:00+06:00', group: 'Humanities', icon: '📈' },
  { id: 'geo', nameEn: 'Geography & Environment', nameBn: 'ভূগোল ও পরিবেশ', date: '2026-05-19T10:00:00+06:00', group: 'Humanities', icon: '🗺️' },
  { id: 'civ', nameEn: 'Civics & Good Governance', nameBn: 'পৌরনীতি ও সুশাসন', date: '2026-05-20T10:00:00+06:00', group: 'Humanities', icon: '⚖️' },
];

const MCQ_TARGETS = [
  { subject: 'Bangla', target: 200, icon: '📝' },
  { subject: 'English', target: 200, icon: '🔤' },
  { subject: 'Mathematics', target: 300, icon: '🔢' },
  { subject: 'Physics', target: 200, icon: '⚛️' },
  { subject: 'Chemistry', target: 200, icon: '🧪' },
  { subject: 'Biology', target: 200, icon: '🧬' },
  { subject: 'ICT', target: 150, icon: '💻' },
  { subject: 'BGS', target: 200, icon: '🌍' },
];

const MOTIVATIONAL_QUOTES = [
  "মানুষ যা চায়, সে তাই পায়। তুমি A+ চাইলে A+ পাবে।",
  "প্রতিদিনের ছোট উন্নতিই বড় সাফল্যের পথ।",
  "ইনশাআল্লাহ, তুমি পারবে।",
  "তোমার বাবা-মার স্বপ্ন পূরণ করার সময় এখন।"
];

const HEALTH_REMINDERS = [
  { icon: <Moon className="w-5 h-5" />, text: "Sleep 6-7 hours straight — no broken sleep" },
  { icon: <Smartphone className="w-5 h-5" />, text: "Put your phone face-down while studying" },
  { icon: <Zap className="w-5 h-5" />, text: "No social media for the next 40 days" },
  { icon: <Droplets className="w-5 h-5" />, text: "Drink water, take breaks, eat properly" },
  { icon: <Coffee className="w-5 h-5" />, text: "Sehri time (4 AM - 6 AM): Use for hardest subjects" },
  { icon: <Calendar className="w-5 h-5" />, text: "Eid break: Only 3 slots — Eve, Day, Night" }
];

const STRATEGY_DATA: Record<string, { tips: string[] }> = {
  "Bangla": {
    tips: [
      "গদ্য ও পদ্যের মূলভাব ভালো করে পড়ো।",
      "সৃজনশীল প্রশ্নের ক ও খ অংশের জন্য জ্ঞানমূলক ও অনুধাবনমূলক প্রশ্নগুলো মুখস্থ করো।",
      "MCQ এর জন্য পাঠ্যবইয়ের প্রতিটি লাইন গুরুত্বপূর্ণ।"
    ]
  },
  "English": {
    tips: [
      "Practice grammar rules daily.",
      "Focus on writing sections (Paragraph, Letter, Composition).",
      "Read comprehension passages carefully before answering."
    ]
  },
  "Mathematics": {
    tips: [
      "সূত্রগুলো ভালো করে আয়ত্ত করো।",
      "প্রতিদিন অন্তত ২টি করে সৃজনশীল প্রশ্ন সমাধান করো।",
      "জ্যামিতির উপপাদ্য ও সম্পাদ্যগুলো বারবার আঁকো।"
    ]
  },
  "Science": {
    tips: [
      "চিত্রগুলো পরিষ্কার করে আঁকার অভ্যাস করো।",
      "গাণিতিক সমস্যাগুলো নিয়মিত প্র্যাকটিস করো।",
      "গুরুত্বপূর্ণ সংজ্ঞা ও বৈশিষ্ট্যগুলো নোট করে রাখো।"
    ]
  },
  "ICT": {
    tips: [
      "বইয়ের প্রতিটি অধ্যায়ের গুরুত্বপূর্ণ পয়েন্টগুলো আন্ডারলাইন করে পড়ো।",
      "প্রোগ্রামিং ও এইচটিএমএল কোডগুলো প্র্যাকটিস করো।",
      "MCQ এর জন্য বিগত বছরের প্রশ্নগুলো সমাধান করো।"
    ]
  }
};

const SUGGESTIONS_DATA = [
  {
    id: 'bangla1',
    titleEn: 'Bangla 1st Paper',
    titleBn: 'বাংলা ১ম পত্র',
    examDate: 'April 21',
    marks: '100 (CQ: 70, MCQ: 30)',
    format: '11 CQ given → answer any 7 in 2h 30min + 30 MCQ in 30min',
    newPattern: 'সহপাঠ থেকে বর্ণনামূলক প্রশ্ন যুক্ত হয়েছে',
    mustRead: [
      { type: 'Prose (গদ্য)', items: ['সুভা (Rabindranath Tagore)', 'মানুষ মুহম্মদ (সাঃ)', 'শিক্ষা ও মনুষ্যত্ব', 'মমতাদি', 'প্রত্যুপকার'] },
      { type: 'Poetry (কবিতা)', items: ['জীবন-সঙ্গীত', 'সেইদিন এই মাঠ', 'বঙ্গবাণী', 'কপোতাক্ষ নদ', 'আমার পরিচয়'] },
      { type: 'Novel/Drama', items: ['কাকতাড়ুয়া (উপন্যাস)', 'বহিপীর (নাটক)'] }
    ],
    important: ['আমার বাংলা', 'নিয়তি', 'পল্লিজননী'],
    mcqTip: 'MCQ আসে সম্পূর্ণ পাঠ্যবই থেকে — কোনো লাইন skip করা যাবে না! সাহিত্যিকদের জন্ম-মৃত্যু, রচনার নাম, শব্দার্থ থেকে আসে।'
  },
  {
    id: 'bangla2',
    titleEn: 'Bangla 2nd Paper',
    titleBn: 'বাংলা ২য় পত্র',
    examDate: 'April 22',
    marks: '100 (Written: 70, MCQ: 30)',
    newPattern: 'অনুবাদ (10 marks) বাদ → সংবাদ প্রতিবেদন (10 marks) যুক্ত',
    mustRead: [
      { type: 'Written (লিখিত - 70)', items: ['রচনা: জুলাই বিপ্লব ২০২৪, বিজ্ঞান ও প্রযুক্তি, পরিবেশ দূষণ', 'সংবাদ প্রতিবেদন (NEW)', 'চিঠি/দরখাস্ত', 'সারাংশ/সারমর্ম', 'ভাব-সম্প্রসারণ', 'অনুচ্ছেদ: মুক্তিযুদ্ধ, একুশে ফেব্রুয়ারি'] },
      { type: 'Grammar (MCQ 30)', items: ['সন্ধি বিচ্ছেদ', 'সমাস', 'কারক ও বিভক্তি', 'শব্দের শ্রেণিবিভাগ', 'বাক্য শুদ্ধিকরণ', 'বিপরীতার্থক শব্দ', 'এক কথায় প্রকাশ'] }
    ],
    skip: ['অনুবাদ (removed from syllabus 2026!)']
  },
  {
    id: 'english1',
    titleEn: 'English 1st Paper',
    titleBn: 'ইংরেজি ১ম পত্র',
    examDate: 'April 24',
    marks: '100 (Written: 70, MCQ: 30)',
    mustRead: [
      { type: 'Prose/Story', items: ['Independence Day', 'Mr. Moti by Rahat Abir', 'Environmental pollution', 'Humayun Ahmed', 'Shere Bangla'] },
      { type: 'Writing', items: ['Paragraph: July Revolution 2024, Antidiscrimination, Graffiti in July Revolution', 'Formal/Informal Letter: Describing Student Movement, Annual prize giving'] }
    ],
    mcqTip: 'Reading comprehension passages — practice understanding context, not memorizing!'
  },
  {
    id: 'english2',
    titleEn: 'English 2nd Paper',
    titleBn: 'ইংরেজি ২য় পত্র',
    examDate: 'April 25',
    marks: '100 (Written: 70, MCQ: 30)',
    mustRead: [
      { type: 'Grammar (30 Marks)', items: ['Right Form of Verbs (MUST)', 'Articles', 'Prepositions', 'Transformation', 'Narration', 'Punctuation', 'Tag questions', 'Connectors', 'Completing sentences', 'Substitution table'] },
      { type: 'Composition', items: ['Paragraph: Same as 1st paper', 'Formal letter (application)', 'Story writing / Dialogue'] }
    ],
    important: ['Suffix/Prefix', 'Sentence correction', 'Synonyms/Antonyms']
  },
  {
    id: 'math',
    titleEn: 'General Mathematics',
    titleBn: 'সাধারণ গণিত',
    examDate: 'April 27',
    marks: '100 (CQ: 50, MCQ: 30, Short: 20)',
    format: '4 sections (ক,খ,গ,ঘ) — answer 1 from each + 1 extra',
    mustRead: [
      { type: 'Section ক (Stats+Sets)', items: ['পরিসংখ্যান (Statistics) — 25-30 marks guaranteed!', 'সেট ও ফাংশন'] },
      { type: 'Section খ (Algebra)', items: ['বীজগাণিতিক রাশি', 'বীজগাণিতিক অনুপাত'] },
      { type: 'Section গ (Geometry)', items: ['ত্রিকোণমিতি (Very important!)', 'বৃত্ত', 'পরিমিতি'] },
      { type: 'Section ঘ (Construction)', items: ['সম্পাদ্য: কোণ সমদ্বিখণ্ডন, ত্রিভুজ অঙ্কন, বৃত্তের স্পর্শক'] }
    ],
    examStrategy: ['MCQ: 30 questions in 30 min', '12-15 MCQs can be done by calculator', 'Short Questions: 10 x 2 marks'],
    skip: ['Real Numbers (বাস্তব সংখ্যা) if no time']
  },
  {
    id: 'hmath',
    titleEn: 'Higher Mathematics',
    titleBn: 'উচ্চতর গণিত',
    examDate: 'May 7',
    marks: '100 (CQ: 50, MCQ: 25, Short: 25)',
    mustRead: [
      { type: 'Chapters', items: ['Ch 2: Algebraic Expressions (Value finding, Remainder/Factor theorem, Partial fractions)', 'Ch 1: Sets & Functions', 'Ch 7: Geometry (High CQ probability!)'] }
    ],
    important: ['Ch 3: Trigonometry', 'Ch 10: Algebra'],
    calculatorTricks: ['Value: Direct substitute', 'Remainder: Shift+Solve', 'Factor: Polynomial mode', 'Partial Fractions: Cover-up method']
  },
  {
    id: 'physics',
    titleEn: 'Physics',
    titleBn: 'পদার্থবিজ্ঞান',
    examDate: 'May 4',
    marks: '100 (CQ: 50, MCQ: 25, Prac: 25)',
    mustRead: [
      { type: 'Chapters', items: ['Ch 2: Motion (v=u+at, s=ut+½at²)', 'Ch 3: Force (F=ma)', 'Ch 4: Work, Power, Energy', 'Ch 5: Pressure', 'Ch 6: Heat', 'Ch 7: Wave & Sound'] }
    ],
    important: ['Ch 8: Light', 'Ch 9: Electrostatics'],
    skip: ['Ch 1: Physical Quantities (less CQ likely)']
  },
  {
    id: 'chemistry',
    titleEn: 'Chemistry',
    titleBn: 'রসায়ন',
    examDate: 'May 5',
    marks: '100 (CQ: 50, MCQ: 25, Prac: 25)',
    mustRead: [
      { type: 'Chapters', items: ['Ch 3: Atomic Structure', 'Ch 4: Periodic Table', 'Ch 5: Chemical Bonding', 'Ch 6: Mole Concept (Heavily tested!)', 'Ch 11: Organic Chemistry (MUST!)'] }
    ],
    important: ['Ch 2: States of Matter', 'Ch 7: Chemical Reactions'],
    skip: ['Ch 1: Concept of Chemistry']
  },
  {
    id: 'biology',
    titleEn: 'Biology',
    titleBn: 'জীববিজ্ঞান',
    examDate: 'May 6',
    marks: '100 (CQ: 50, MCQ: 25, Prac: 25)',
    mustRead: [
      { type: 'Chapters', items: ['Cell Structure (Diagrams MUST!)', 'DNA, RNA, Cell division', 'Plant Physiology (Photosynthesis)', 'Animal Nutrition (Digestive system diagram)', 'Classification', 'Human Physiology (Heart, Circulatory)'] }
    ],
    important: ['Genetics (Mendel\'s laws)', 'Ecosystem'],
    tip: 'Learn all diagrams! Label correctly: Plant cell, Animal cell, Heart, Kidney nephron.'
  },
  {
    id: 'ict',
    titleEn: 'ICT',
    titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    examDate: 'May 1',
    marks: '100',
    mustRead: [
      { type: 'Chapters', items: ['Ch 1: Intro to ICT', 'Ch 2: Computer (Binary, CPU, RAM)', 'Ch 3: Network & Internet', 'Ch 4: Spreadsheet (Excel formulas)', 'Ch 5: Database'] }
    ],
    important: ['HTML basics', 'Number systems conversion']
  },
  {
    id: 'bgs',
    titleEn: 'BGS',
    titleBn: 'বাংলাদেশ ও বিশ্ব পরিচয়',
    examDate: 'April 30',
    marks: '100 (CQ: 70, MCQ: 30)',
    mustRead: [
      { type: 'History', items: ['Liberation War 1971 (Most important!)', 'Language Movement 1952', 'Constitution', 'July Revolution 2024 (NEW!)'] },
      { type: 'Economy', items: ['RMG, Remittance, GDP'] },
      { type: 'Society/World', items: ['Ethnic minorities', 'UN, SAARC, Climate change'] }
    ],
    mcqTip: 'Target 27+ in MCQ. Study all "কে, কখন, কোথায়" type info.'
  },
  {
    id: 'religion',
    titleEn: 'Religion',
    titleBn: 'ইসলাম শিক্ষা',
    examDate: 'April 28',
    marks: '100 (CQ: 70, MCQ: 30)',
    mustRead: [
      { type: 'Topics', items: ['Al-Quran (Surah Fatiha, Ikhlas, Baqara ayats)', 'Al-Hadith', 'Aqaid (6 pillars)', 'Ibadat (Salat, Sawm, Zakat, Hajj)', 'Sirat (Prophet\'s life)', 'Islamic Values'] }
    ]
  }
];

// --- Components ---

const CountdownDisplay = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const getStatusColor = () => {
    const distance = new Date(targetDate).getTime() - new Date().getTime();
    const days = distance / (1000 * 60 * 60 * 24);
    if (distance < 0) return 'text-gray-500';
    if (days < 1) return 'text-danger-red animate-pulse-glow';
    if (days < 3) return 'text-orange-500';
    if (days < 7) return 'text-amber-warning';
    return 'text-teal-accent';
  };

  return (
    <div className={`flex gap-4 md:gap-8 orbitron font-bold text-4xl md:text-7xl ${getStatusColor()}`}>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.d).padStart(2, '0')}</span>
        <span className="text-xs md:text-sm font-sans uppercase tracking-widest opacity-60">Days</span>
      </div>
      <span className="opacity-30">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.h).padStart(2, '0')}</span>
        <span className="text-xs md:text-sm font-sans uppercase tracking-widest opacity-60">Hours</span>
      </div>
      <span className="opacity-30">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.m).padStart(2, '0')}</span>
        <span className="text-xs md:text-sm font-sans uppercase tracking-widest opacity-60">Mins</span>
      </div>
      <span className="opacity-30">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.s).padStart(2, '0')}</span>
        <span className="text-xs md:text-sm font-sans uppercase tracking-widest opacity-60">Secs</span>
      </div>
    </div>
  );
};

const SuggestionsSection = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
            <BookOpen className="text-teal-accent" /> সাজেশন ও গুরুত্বপূর্ণ টপিক
          </h2>
          <p className="text-sm opacity-50 uppercase tracking-widest mt-1">Subject-wise Mission Briefings</p>
        </div>
      </div>

      <div className="space-y-4">
        {SUGGESTIONS_DATA.map((sub) => (
          <div key={sub.id} className={`glass-card overflow-hidden transition-all ${expandedId === sub.id ? 'ring-1 ring-teal-accent/30' : ''}`}>
            <button 
              onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{EXAM_SCHEDULE.find(e => e.id.startsWith(sub.id.substring(0, 3)))?.icon || '📘'}</span>
                <div className="text-left">
                  <h3 className="font-bold text-lg">{sub.titleEn}</h3>
                  <p className="bengali-text text-sm opacity-60">{sub.titleBn}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-mono opacity-50 uppercase">Exam Date</p>
                  <p className="text-xs font-bold text-teal-accent">{sub.examDate}</p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedId === sub.id ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {expandedId === sub.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-[10px] font-mono opacity-50 uppercase mb-1">Marks & Format</p>
                          <p className="text-sm font-bold">{sub.marks}</p>
                          {sub.format && <p className="text-xs opacity-60 mt-1">{sub.format}</p>}
                          {sub.newPattern && <p className="text-xs text-amber-warning mt-2 flex items-center gap-2"><Info className="w-3 h-3" /> {sub.newPattern}</p>}
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-mono text-teal-accent uppercase tracking-widest">✅ MUST READ (100% Likely)</h4>
                          <div className="space-y-4">
                            {sub.mustRead.map((group, i) => (
                              <div key={i} className="space-y-1">
                                <p className="text-[10px] font-bold opacity-40 uppercase">{group.type}</p>
                                <ul className="grid grid-cols-1 gap-1">
                                  {group.items.map((item, j) => (
                                    <li key={j} className="text-sm flex gap-2 items-start">
                                      <span className="text-teal-accent">•</span>
                                      <span className="bengali-text">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {sub.important && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono text-orange-500 uppercase tracking-widest">⚠️ IMPORTANT</h4>
                            <ul className="grid grid-cols-1 gap-1">
                              {sub.important.map((item, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start">
                                  <span className="text-orange-500">•</span>
                                  <span className="bengali-text">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {sub.calculatorTricks && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono text-purple-400 uppercase tracking-widest">🧮 CALCULATOR TRICKS</h4>
                            <ul className="grid grid-cols-1 gap-1">
                              {sub.calculatorTricks.map((item, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start">
                                  <span className="text-purple-400">•</span>
                                  <span className="bengali-text">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {sub.mcqTip && (
                          <div className="p-4 bg-teal-accent/5 rounded-xl border border-teal-accent/20">
                            <h4 className="text-xs font-mono text-teal-accent uppercase tracking-widest mb-2">💡 MCQ TIP</h4>
                            <p className="text-sm bengali-text opacity-80 leading-relaxed">{sub.mcqTip}</p>
                          </div>
                        )}

                        {sub.skip && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono text-danger-red uppercase tracking-widest">❌ SKIP</h4>
                            <ul className="grid grid-cols-1 gap-1">
                              {sub.skip.map((item, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start opacity-50">
                                  <span className="text-danger-red">•</span>
                                  <span className="bengali-text">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

const MarkDistributionTable = () => {
  const data = [
    { sub: 'Bangla 1st', cq: 70, mcq: 30, prac: 0, total: 100 },
    { sub: 'Bangla 2nd', cq: 70, mcq: 30, prac: 0, total: 100 },
    { sub: 'English 1st', cq: 70, mcq: 30, prac: 0, total: 100 },
    { sub: 'English 2nd', cq: 70, mcq: 30, prac: 0, total: 100 },
    { sub: 'Gen. Math', cq: '50+20', mcq: 30, prac: 0, total: 100 },
    { sub: 'Physics', cq: 50, mcq: 25, prac: 25, total: 100 },
    { sub: 'Chemistry', cq: 50, mcq: 25, prac: 25, total: 100 },
    { sub: 'Biology', cq: 50, mcq: 25, prac: 25, total: 100 },
    { sub: 'Higher Math', cq: '50+25', mcq: 25, prac: 0, total: 100 },
    { sub: 'ICT', cq: 'varies', mcq: 'varies', prac: 'varies', total: 100 },
    { sub: 'BGS', cq: 70, mcq: 30, prac: 0, total: 100 },
    { sub: 'Religion', cq: 70, mcq: 30, prac: 0, total: 100 },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-white/5 uppercase opacity-50">
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">CQ/Written</th>
              <th className="px-4 py-3">MCQ</th>
              <th className="px-4 py-3">Practical</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold">{row.sub}</td>
                <td className="px-4 py-3">{row.cq}</td>
                <td className="px-4 py-3">{row.mcq}</td>
                <td className="px-4 py-3">{row.prac}</td>
                <td className="px-4 py-3 text-teal-accent">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const APlusCalculator = () => {
  const [mcq, setMcq] = useState(25);
  const [cq, setCq] = useState(55);
  const total = mcq + cq;
  const needed = Math.max(0, 80 - total);

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="orbitron text-sm font-bold text-teal-accent flex items-center gap-2">
        <Calculator className="w-4 h-4" /> A+ CALCULATION HELPER
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase opacity-50 font-mono">Expected MCQ</label>
          <input 
            type="number" 
            value={mcq} 
            onChange={(e) => setMcq(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase opacity-50 font-mono">Expected CQ</label>
          <input 
            type="number" 
            value={cq} 
            onChange={(e) => setCq(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-accent"
          />
        </div>
      </div>
      <div className="p-4 bg-navy-900/50 rounded-xl border border-white/5 flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold orbitron">{total} / 100</p>
          <p className="text-[10px] uppercase opacity-50 font-mono">{total >= 80 ? 'A+ ACHIEVED ✓' : `NEED ${needed} MORE FOR A+`}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold orbitron text-lg ${total >= 80 ? 'bg-teal-accent text-navy-900 shadow-[0_0_15px_rgba(0,212,170,0.4)]' : 'bg-danger-red/20 text-danger-red border border-danger-red/30'}`}>
          {total >= 80 ? 'A+' : 'F'}
        </div>
      </div>
      <p className="text-[10px] opacity-40 italic text-center">"MCQ 25/30 + CQ 55/70 = 80 = A+ ✓"</p>
    </div>
  );
};

const WhatsNewBox = () => (
  <div className="glass-card p-6 border-l-4 border-l-amber-warning space-y-4">
    <h3 className="orbitron text-sm font-bold text-amber-warning flex items-center gap-2">
      <AlertTriangle className="w-4 h-4" /> WHAT'S NEW IN 2026 (বিশেষ পরিবর্তন)
    </h3>
    <ul className="space-y-2">
      {[
        'Bangla 2nd Paper: অনুবাদ বাদ → সংবাদ প্রতিবেদন যুক্ত',
        'July Revolution 2024 topics added to BGS & English',
        'Short syllabus — group system BACK (Science/Commerce/Humanities)',
        'Regular students: Revised short syllabus',
        'Irregular/Improvement students: Full syllabus',
        'Calculator allowed: Non-programmable scientific only',
        'Exam starts: 10:00 AM | Must enter hall by 9:30 AM',
        'Practical exams: June 7-14, 2026'
      ].map((text, i) => (
        <li key={i} className="text-xs bengali-text flex gap-2 items-start">
          <span className="text-amber-warning">⚠️</span>
          <span className="opacity-80">{text}</span>
        </li>
      ))}
    </ul>
  </div>
);

const RevisionMatrix = () => (
  <div className="space-y-4">
    <h3 className="orbitron text-sm font-bold text-soft-white flex items-center gap-2">
      <LayoutGrid className="w-4 h-4" /> QUICK REVISION PRIORITY MATRIX
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass-card p-4 border-t-2 border-t-danger-red">
        <p className="text-[10px] font-mono text-danger-red uppercase mb-2">🔴 DO NOW (Highest Impact)</p>
        <ul className="text-xs space-y-1 opacity-70 bengali-text">
          <li>• পরিসংখ্যান (Statistics)</li>
          <li>• Right Form of Verbs (English)</li>
          <li>• গতি + বল chapters (Physics)</li>
          <li>• জৈব রসায়ন (Organic Chemistry)</li>
          <li>• মুক্তিযুদ্ধ (BGS)</li>
        </ul>
      </div>
      <div className="glass-card p-4 border-t-2 border-t-orange-500">
        <p className="text-[10px] font-mono text-orange-500 uppercase mb-2">🟠 THIS WEEK</p>
        <ul className="text-xs space-y-1 opacity-70 bengali-text">
          <li>• বাংলা 2nd Paper grammar rules</li>
          <li>• Math: Trigonometry + Geometry</li>
          <li>• Biology diagrams</li>
          <li>• Chemistry: Mole concept</li>
          <li>• ICT: Computer + Network</li>
        </ul>
      </div>
      <div className="glass-card p-4 border-t-2 border-t-teal-accent">
        <p className="text-[10px] font-mono text-teal-accent uppercase mb-2">🟢 BEFORE EXAM (Final 3 Days)</p>
        <ul className="text-xs space-y-1 opacity-70 bengali-text">
          <li>• CQ answer practice (hand writing!)</li>
          <li>• MCQ speed practice (timed)</li>
          <li>• Formula sheet review</li>
          <li>• Previous year board questions</li>
        </ul>
      </div>
    </div>
  </div>
);

export default function App() {
  const [completedExams, setCompletedExams] = useState<string[]>(() => {
    const saved = localStorage.getItem('ssc_completed_exams');
    return saved ? JSON.parse(saved) : [];
  });

  const [mcqCounts, setMcqCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ssc_mcq_counts');
    return saved ? JSON.parse(saved) : {};
  });

  const [studyTime, setStudyTime] = useState(() => {
    const saved = localStorage.getItem('ssc_study_time');
    return saved ? JSON.parse(saved) : { total: 0, today: 0, lastDate: new Date().toDateString() };
  });

  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState<'study' | 'break' | 'deep'>('study');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>(() => {
    const saved = sessionStorage.getItem('ssc_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [studyPlan, setStudyPlan] = useState<string[]>([]);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  useEffect(() => {
    localStorage.setItem('ssc_completed_exams', JSON.stringify(completedExams));
  }, [completedExams]);

  useEffect(() => {
    localStorage.setItem('ssc_mcq_counts', JSON.stringify(mcqCounts));
  }, [mcqCounts]);

  useEffect(() => {
    localStorage.setItem('ssc_study_time', JSON.stringify(studyTime));
  }, [studyTime]);

  useEffect(() => {
    sessionStorage.setItem('ssc_chat_history', JSON.stringify(chatMessages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      setCurrentReminderIndex(prev => (prev + 1) % HEALTH_REMINDERS.length);
    }, 3600000); // Change every hour
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
        if (timerSeconds % 60 === 0) {
          setStudyTime((prev: any) => {
            const today = new Date().toDateString();
            const isNewDay = prev.lastDate !== today;
            return {
              total: prev.total + 1,
              today: isNewDay ? 1 : prev.today + 1,
              lastDate: today
            };
          });
        }
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      alert(timerMode === 'study' || timerMode === 'deep' ? "Study session done! Take a break." : "Break over! Back to work.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerMode]);

  // --- Helpers ---

  const nextExam = useMemo(() => {
    const now = new Date().getTime();
    return EXAM_SCHEDULE.find(exam => new Date(exam.date).getTime() > now && !completedExams.includes(exam.id));
  }, [completedExams]);

  useEffect(() => {
    if (nextExam) {
      const updateTitle = () => {
        const now = new Date().getTime();
        const distance = new Date(nextExam.date).getTime() - now;
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        document.title = `📚 ${d}d ${h}h ${m}m — ${nextExam.nameEn}`;
      };
      updateTitle();
      const interval = setInterval(updateTitle, 60000);
      return () => clearInterval(interval);
    }
  }, [nextExam]);

  const toggleExam = (id: string) => {
    setCompletedExams(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const updateMcq = (subject: string, amount: number) => {
    setMcqCounts(prev => ({
      ...prev,
      [subject]: (prev[subject] || 0) + amount
    }));
  };

  const generateStudyPlan = () => {
    if (selectedSubjects.length === 0) return;
    
    const plan: string[] = [];
    let day = 1;
    
    selectedSubjects.forEach(sub => {
      let daysNeeded = 2;
      if (['Physics', 'Chemistry', 'Biology'].includes(sub)) daysNeeded = 3;
      if (['General Math', 'Higher Math'].includes(sub)) daysNeeded = 4;
      if (sub === 'English') daysNeeded = 5;
      if (sub === 'ICT') daysNeeded = 1;

      for (let i = 0; i < daysNeeded; i++) {
        plan.push(`Day ${day}: Focus on ${sub} (Session ${i + 1}/${daysNeeded})`);
        day++;
      }
    });

    const totalDaysLeft = Math.floor((new Date('2026-04-21').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (day > totalDaysLeft) {
      plan.push(`⚠️ WARNING: You need ${day} days but only ${totalDaysLeft} days left! Increase study hours to 14h+ daily.`);
    } else {
      plan.push(`✅ You need ${day} days. You have ${totalDaysLeft} days left. Maintain 10-12h daily.`);
    }

    setStudyPlan(plan);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      // 1. Try Ollama Proxy (Backend)
      try {
        const response = await axios.post('/api/chat', {
          prompt: `System: You are an expert SSC exam tutor for Bangladesh. You help students with SSC 2026 preparation. You know all subjects: Bangla, English, Mathematics (General & Higher), Physics, Chemistry, Biology, ICT, BGS, and Religion. Give concise, practical study tips. When asked about Math, give step-by-step solutions. Respond in Bengali when the student writes in Bengali, in English when they write in English. Be encouraging and motivating. Keep responses under 150 words unless explaining a complex math problem. Always end with 'ইনশাআল্লাহ তুমি পারবে!'\n\nUser: ${chatInput}`,
        });
        
        if (response.data.response) {
          setChatMessages(prev => [...prev, { role: 'ai', text: response.data.response }]);
          setIsTyping(false);
          return;
        }
      } catch (ollamaErr) {
        console.warn("Ollama failed, falling back to Gemini:", ollamaErr);
      }

      // 2. Fallback to Gemini (Frontend)
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `System: You are an expert SSC exam tutor for Bangladesh. You help students with SSC 2026 preparation. You know all subjects: Bangla, English, Mathematics (General & Higher), Physics, Chemistry, Biology, ICT, BGS, and Religion. Give concise, practical study tips. When asked about Math, give step-by-step solutions. Respond in Bengali when the student writes in Bengali, in English when they write in English. Be encouraging and motivating. Keep responses under 150 words unless explaining a complex math problem. Always end with 'ইনশাআল্লাহ তুমি পারবে!'\n\nUser: ${chatInput}`,
      });

      const result = await model;
      setChatMessages(prev => [...prev, { role: 'ai', text: result.text || "I'm sorry, I couldn't generate a response. ইনশাআল্লাহ তুমি পারবে!" }]);
    } catch (err) {
      console.error("AI Error:", err);
      setChatMessages(prev => [...prev, { role: 'ai', text: "AI সংযোগে সমস্যা হচ্ছে — নিজেই পড়ো! 💪 ইনশাআল্লাহ তুমি পারবে!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.4)]">
            <Monitor className="text-navy-900 w-6 h-6" />
          </div>
          <div>
            <h1 className="orbitron font-bold text-lg tracking-tighter text-teal-accent">SSC 2026 MISSION CONTROL</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Status: Operational // BD Time: {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 font-mono text-xs">
          <div className="flex flex-col items-end">
            <span className="opacity-50">STUDY STREAK</span>
            <span className="text-teal-accent flex items-center gap-1"><Flame className="w-3 h-3" /> 12 DAYS</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="opacity-50">TOTAL HOURS</span>
            <span className="text-amber-warning">{(studyTime.total / 60).toFixed(1)}H</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32 space-y-12">
        
        {/* Section 1: Hero Countdown */}
        <section className="relative overflow-hidden glass-card p-8 md:p-16 flex flex-col items-center text-center space-y-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-accent to-transparent opacity-50" />
          
          {nextExam ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <span className="text-teal-accent orbitron text-sm tracking-[0.3em] uppercase opacity-70">Next Objective</span>
                <h2 className="text-3xl md:text-5xl font-bold">{nextExam.nameEn}</h2>
                <h3 className="bengali-text text-2xl md:text-3xl opacity-60">{nextExam.nameBn}</h3>
              </motion.div>

              <CountdownDisplay targetDate={nextExam.date} />

              <div className="flex flex-wrap justify-center gap-4 text-xs font-mono uppercase tracking-widest opacity-60">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(nextExam.date).toLocaleDateString('en-BD', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 10:00 AM BST</span>
              </div>
            </>
          ) : (
            <div className="py-12">
              <Trophy className="w-20 h-20 text-teal-accent mx-auto mb-6 animate-bounce" />
              <h2 className="text-4xl font-bold orbitron">MISSION ACCOMPLISHED</h2>
              <p className="bengali-text text-xl opacity-60 mt-2">সব পরীক্ষা শেষ! এখন ফলাফলের অপেক্ষা।</p>
            </div>
          )}
        </section>

        {/* Section 2: Suggestions & Topics */}
        <SuggestionsSection />

        {/* Section 3: Exam Timeline */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
                <Clock className="text-teal-accent" /> EXAM TIMELINE
              </h2>
              <p className="text-sm opacity-50 uppercase tracking-widest mt-1">Chronological Sequence of Battles</p>
            </div>
            <div className="text-xs font-mono opacity-40">SCROLL HORIZONTALLY →</div>
          </div>

          <div className="flex overflow-x-auto pb-6 gap-4 snap-x">
            {EXAM_SCHEDULE.map((exam) => {
              const isCompleted = completedExams.includes(exam.id);
              const date = new Date(exam.date);
              const now = new Date();
              const diffTime = date.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              let statusText = `${diffDays} Days Away`;
              let borderColor = 'border-white/10';
              let glow = '';

              if (isCompleted) {
                statusText = 'DONE ✓';
                borderColor = 'border-gray-700 opacity-50';
              } else if (diffDays === 0) {
                statusText = 'TODAY!';
                borderColor = 'border-danger-red';
                glow = 'shadow-[0_0_15px_rgba(255,71,87,0.3)] animate-pulse';
              } else if (diffDays <= 3) {
                statusText = `${diffDays} Days Left`;
                borderColor = 'border-orange-500';
                glow = 'shadow-[0_0_10px_rgba(249,115,22,0.2)]';
              } else if (diffDays <= 7) {
                borderColor = 'border-amber-warning';
              }

              return (
                <div 
                  key={exam.id}
                  onClick={() => toggleExam(exam.id)}
                  className={`flex-shrink-0 w-64 glass-card p-6 cursor-pointer transition-all hover:scale-[1.02] snap-start ${borderColor} ${glow} ${isCompleted ? 'grayscale' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
                      exam.group === 'Science' ? 'border-purple-500 text-purple-400' :
                      exam.group === 'Commerce' ? 'border-blue-500 text-blue-400' :
                      'border-teal-accent/30 text-teal-accent/70'
                    }`}>
                      {exam.group}
                    </span>
                    <span className={`text-[10px] font-mono ${isCompleted ? 'text-gray-500' : 'text-teal-accent'}`}>
                      {statusText}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{exam.nameEn}</h4>
                  <p className="bengali-text text-sm opacity-60 mb-4">{exam.nameBn}</p>
                  <div className="text-xs font-mono opacity-40">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Strategy Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
                <BookOpen className="text-teal-accent" /> STRATEGY GUIDE
              </h2>
              <div className="glass-card overflow-hidden">
                <div className="flex overflow-x-auto border-b border-white/10 bg-white/5">
                  {Object.keys(STRATEGY_DATA).map((sub) => (
                    <button
                      key={sub}
                      className="px-6 py-4 text-sm font-mono whitespace-nowrap hover:bg-white/5 transition-colors border-r border-white/10 last:border-r-0"
                      onClick={() => {
                        const el = document.getElementById(`strategy-${sub}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                <div className="p-6 h-96 overflow-y-auto space-y-12 scroll-smooth">
                  {Object.entries(STRATEGY_DATA).map(([sub, data]) => (
                    <div key={sub} id={`strategy-${sub}`} className="space-y-4">
                      <h3 className="text-xl font-bold text-teal-accent flex items-center gap-2">
                        <ChevronRight className="w-5 h-5" /> {sub}
                      </h3>
                      <ul className="space-y-3">
                        {data.tips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm opacity-80 leading-relaxed">
                            <span className="text-teal-accent mt-1">•</span>
                            <span className={tip.includes('(') ? 'bengali-text' : ''}>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
                <TableIcon className="text-teal-accent" /> MARK DISTRIBUTION SUMMARY
              </h2>
              <MarkDistributionTable />
            </div>

            <RevisionMatrix />
          </div>

          <div className="space-y-8">
            {/* Section 5: Study Plan Calculator */}
            <div className="space-y-6">
              <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
                <Calculator className="text-teal-accent" /> PLANNER
              </h2>
              <div className="glass-card p-6 space-y-6">
                <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Select Unfinished Subjects</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Bangla 2nd', 'English', 'General Math', 'Higher Math', 'Physics', 'Chemistry', 'Biology', 'BGS', 'ICT', 'Religion'].map(sub => (
                    <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedSubjects.includes(sub)}
                        onChange={() => setSelectedSubjects(prev => 
                          prev.includes(sub) ? prev.filter(x => x !== sub) : [...prev, sub]
                        )}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSubjects.includes(sub) ? 'bg-teal-accent border-teal-accent' : 'border-white/20 group-hover:border-teal-accent/50'}`}>
                        {selectedSubjects.includes(sub) && <CheckCircle2 className="w-3 h-3 text-navy-900" />}
                      </div>
                      <span className="text-xs opacity-70 group-hover:opacity-100">{sub}</span>
                    </label>
                  ))}
                </div>
                <button 
                  onClick={generateStudyPlan}
                  className="w-full py-3 bg-teal-accent text-navy-900 font-bold orbitron text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] transition-all active:scale-95"
                >
                  GENERATE MISSION PLAN
                </button>

                {studyPlan.length > 0 && (
                  <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5 space-y-2 max-h-60 overflow-y-auto font-mono text-[10px]">
                    {studyPlan.map((line, i) => (
                      <div key={i} className={line.startsWith('⚠️') ? 'text-danger-red font-bold' : line.startsWith('✅') ? 'text-teal-accent font-bold' : 'opacity-60'}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <APlusCalculator />
            
            <WhatsNewBox />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 5: MCQ Tracker */}
          <div className="space-y-6">
            <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
              <Zap className="text-teal-accent" /> MCQ TRACKER
            </h2>
            <div className="glass-card p-6 space-y-6">
              {['General Math', 'Physics', 'Chemistry', 'Biology', 'BGS'].map(sub => {
                const count = mcqCounts[sub] || 0;
                const progress = Math.min((count / 200) * 100, 100);
                return (
                  <div key={sub} className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="opacity-70">{sub}</span>
                      <span className="text-teal-accent">{count} / 200</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${progress >= 100 ? 'bg-teal-accent' : progress >= 50 ? 'bg-amber-warning' : 'bg-danger-red'}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      {[10, 25, 50].map(val => (
                        <button 
                          key={val}
                          onClick={() => updateMcq(sub, val)}
                          className="flex-1 py-1 text-[10px] font-mono border border-white/10 rounded hover:bg-white/5 transition-colors"
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Study Timer */}
          <div className="space-y-6">
            <h2 className="orbitron text-2xl font-bold flex items-center gap-3">
              <Clock className="text-teal-accent" /> STUDY TIMER
            </h2>
            <div className="glass-card p-8 flex flex-col items-center space-y-8">
              <div className="flex gap-2 p-1 bg-black/30 rounded-xl">
                {(['study', 'break', 'deep'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setTimerMode(mode);
                      setTimerActive(false);
                      setTimerSeconds(mode === 'study' ? 25 * 60 : mode === 'break' ? 5 * 60 : 120 * 60);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${timerMode === mode ? 'bg-teal-accent text-navy-900 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="orbitron text-7xl font-bold tracking-tighter text-soft-white">
                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                {(timerSeconds % 60).toString().padStart(2, '0')}
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className={`flex-1 py-4 rounded-xl font-bold orbitron text-sm transition-all ${timerActive ? 'bg-danger-red/20 text-danger-red border border-danger-red/50' : 'bg-teal-accent text-navy-900 shadow-[0_0_20px_rgba(0,212,170,0.3)]'}`}
                >
                  {timerActive ? 'PAUSE MISSION' : 'START SESSION'}
                </button>
                <button 
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(timerMode === 'study' ? 25 * 60 : timerMode === 'break' ? 5 * 60 : 120 * 60);
                  }}
                  className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full pt-6 border-t border-white/10 flex justify-between items-center text-xs font-mono opacity-50">
                <span>TODAY'S PROGRESS</span>
                <span className="text-teal-accent">{(studyTime.today / 60).toFixed(1)}H / 12H</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Motivation & Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 border-l-4 border-l-danger-red">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-danger-red" />
              <h3 className="orbitron font-bold text-sm">CRITICAL STAT</h3>
            </div>
            <p className="text-2xl font-bold mb-2">6 Lakh+</p>
            <p className="text-xs opacity-60 leading-relaxed">Students failed Math in previous years due to poor routine analysis. Don't be a statistic.</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-l-teal-accent">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-teal-accent" />
              <h3 className="orbitron font-bold text-sm">EFFICIENCY TIP</h3>
            </div>
            <p className="text-2xl font-bold mb-2">25/25 MCQ</p>
            <p className="text-xs opacity-60 leading-relaxed">Scoring full in MCQ means you only need 50/75 in CQ for a solid A+.</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center items-center text-center space-y-4">
            <Heart className="text-danger-red animate-pulse" />
            <p className="bengali-text text-xl font-bold italic">"{MOTIVATIONAL_QUOTES[currentQuoteIndex]}"</p>
            <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">Daily Motivation</p>
          </div>
        </section>

        {/* Section 8: Health Reminders */}
        <section className="glass-card p-6 overflow-hidden relative">
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
            {[...HEALTH_REMINDERS, ...HEALTH_REMINDERS].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-mono opacity-60">
                <span className="text-teal-accent">{item.icon}</span>
                <span>{item.text}</span>
                <span className="mx-4 opacity-20">|</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/10 text-center space-y-4">
        <p className="bengali-text text-2xl font-bold text-teal-accent tracking-widest opacity-80">পরিশ্রম + আত্মবিশ্বাস = A+</p>
        <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.3em]">SSC 2026 Mission Control // Built for Excellence</p>
      </footer>

      {/* AI Assistant Chat */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] glass-card flex flex-col shadow-2xl border-teal-accent/30 overflow-hidden"
            >
              <div className="p-4 bg-teal-accent text-navy-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="orbitron font-bold text-xs uppercase tracking-widest">AI Study Assistant</span>
                </div>
                <button onClick={() => setChatOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-navy-900/80">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 space-y-4">
                    <MessageSquare className="w-12 h-12 text-teal-accent/20 mx-auto" />
                    <p className="text-xs opacity-40 font-mono uppercase tracking-widest">No active transmission</p>
                    <p className="text-sm opacity-60 px-6">Ask me anything about SSC 2026 prep, Math solutions, or study routines!</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-teal-accent text-navy-900 rounded-tr-none' : 'bg-white/10 text-soft-white rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-teal-accent rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-teal-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-teal-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-white/10 bg-navy-800">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your question..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-accent transition-colors"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-2 bg-teal-accent text-navy-900 rounded-xl hover:shadow-[0_0_15px_rgba(0,212,170,0.4)] transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${chatOpen ? 'bg-danger-red text-white' : 'bg-teal-accent text-navy-900'}`}
        >
          {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
