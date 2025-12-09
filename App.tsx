import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { AnalysisResult, Job, Rating } from './types';

// --- CONFIGURATION ---
// -------------------------------------------------------------------------
// Configuration for API Key and Supabase
// -------------------------------------------------------------------------
// Fix: Use process.env instead of import.meta.env as per SDK guidelines and to avoid ImportMeta type errors.
// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// --- Icons ---
const StarIcon: React.FC<{ filled: boolean; onClick?: () => void }> = ({ filled, onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke={filled ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`cursor-pointer transition-transform hover:scale-110 ${filled ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const Icons = {
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>,
  Star: StarIcon,
  Briefcase: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Bulb: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Target: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  UserCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Linkedin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#0077b5]"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
};

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'landing' | 'input' | 'analyzing' | 'results' | 'how-it-works'>('landing');
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Inputs
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobRole, setJobRole] = useState(''); 
  
  // Data
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);
  
  // Feedback
  const [showRating, setShowRating] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // --- Scroll Handler ---
  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      
      if (!isPdf && !isImage) {
        alert("Only PDF, PNG, or JPG files are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setResumeFile({
          data: base64Data,
          mimeType: file.type,
          name: file.name
        });
        setResumeText('');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Analysis ---
  const handleAnalyze = async () => {
    if (!resumeText && !resumeFile) {
      alert("Please upload a resume or paste text.");
      return;
    }

    if (!process.env.API_KEY) {
      // Fix: Update alert to reflect environment variable name change
      alert("API Key is missing! Please configure API_KEY in your environment variables.");
      return;
    }

    setView('analyzing');
    setLoadingMsg('Scanning document structure...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct parts
      const parts: any[] = [];
      if (resumeFile) {
        parts.push({
          inlineData: { mimeType: resumeFile.mimeType, data: resumeFile.data }
        });
        parts.push({ text: "Analyze this resume document." });
      } else {
        parts.push({ text: `Resume Content:\n${resumeText}` });
      }

      const jobContext = `
        Target Role: ${jobRole || "Not specified, infer from resume skills"}
        Target Job Description:
        ${jobDescription || "Not specified, analyze based on general best practices for the role."}
      `;
      
      parts.push({ text: jobContext });

      const prompt = `
        You are an advanced ATS (Applicant Tracking System). Analyze the resume against the target job description and role.
        
        CRITICAL INSTRUCTIONS:
        1. **SCORE**: Provide a GENUINE score (0-100) based strictly on the match between resume skills/experience and the job description/role. Do not inflate the score. If it's a mismatch, give a low score.
        2. **EXPERIENCE CALCULATION**: CAREFULLY calculate the total years of experience by summing the duration of all listed roles in the Work Experience section. Count from the start date of the first relevant role to the current date. Do NOT just look for a number in the summary. If they have a role from 2021 to Present, that is 2+ years. Be accurate.
        3. **EXECUTIVE SUMMARY**: Write a professional executive summary (3-4 sentences) that specifically mentions the calculated years of experience (e.g. "Professional with 2+ years of experience in..."). It must be factually correct based on the work history.
        4. **PROJECTS**: Suggest 3 specific, impressive projects the candidate could build to improve their profile for this specific role.
        5. **ROADMAP**: Create a "Personalized Study Roadmap" with 3 steps (Basics, Intermediate, Advanced) to bridge the skill gap.
        6. **COLD EMAIL**: Generate a professional cold email subject and body to send to a recruiter for this role.
        7. **COVER LETTER**: Write a highly professional, tailored cover letter (250-350 words) for this specific role and company (if known). Use a standard business letter format.
        8. **INTERVIEW**: Provide 5 likely interview questions, 3 weak areas to prep for, and a mock interview focus.
        9. **CANDIDATE INFO**: Extract Name and Email.

        Return JSON matching this schema:
        {
          "score": number,
          "summary": "string",
          "strengths": ["string"],
          "suggestedProjects": ["string"],
          "missingKeywords": ["string"],
          "matchLevel": "Low" | "Medium" | "High",
          "jobTitles": ["string"], 
          "topSkills": ["string"],
          "experienceLevel": "string",
          "coldEmail": { "subject": "string", "body": "string" },
          "coverLetter": "string",
          "roadmap": [{ "title": "string", "description": "string" }],
          "interviewPrep": {
             "questions": ["string"],
             "weakAreas": ["string"],
             "mockFocus": "string"
          },
          "candidateProfile": { "name": "string", "email": "string" }
        }
      `;
      
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          temperature: 0, // Deterministic scoring
        }
      });

      const result = JSON.parse(response.text || '{}') as AnalysisResult;
      setAnalysis(result);

      // --- Job Search ---
      setLoadingMsg('Searching for relevant opportunities...');
      
      const searchRole = jobRole || result.jobTitles[0] || "Software Engineer";
      
      // FIX: Relaxed query. Removed exact experience string which kills matches.
      // Removed "site:glassdoor.com" temporarily to make room for stronger LinkedIn/Naukri results.
      const searchQuery = `(site:linkedin.com/jobs OR site:naukri.com OR site:indeed.com) "${searchRole}" ${result.topSkills.slice(0,2).join(" ")}`;

      const searchResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 20 active job listings for: ${searchQuery}`, 
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const uniqueJobs: Job[] = [];
      const seenLinks = new Set();

      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title && !seenLinks.has(chunk.web.uri)) {
          seenLinks.add(chunk.web.uri);
          
          let company = "Unknown Company";
          const titleParts = chunk.web.title.split(/[-|]/);
          if (titleParts.length > 1) {
             company = titleParts[titleParts.length - 1].trim();
          } else {
             try {
               const urlObj = new URL(chunk.web.uri);
               company = urlObj.hostname.replace('www.', '');
             } catch (e) {}
          }
          
          // FIX: Clean source for better filtering (remove www.)
          const rawSource = new URL(chunk.web.uri).hostname;
          const cleanSource = rawSource.replace('www.', '').replace('in.', '').replace('uk.', '');

          uniqueJobs.push({
            title: chunk.web.title,
            link: chunk.web.uri,
            source: cleanSource,
            company: company
          });
        }
      });

      setJobs(uniqueJobs.slice(0, 20)); // Limit to 20
      setView('results');
      
      // Show rating modal after 15s
      setTimeout(() => setShowRating(true), 15000);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your API Key or try again.");
      setView('input');
    }
  };

  const copyEmail = () => {
    if (analysis?.coldEmail) {
      const text = `Subject: ${analysis.coldEmail.subject}\n\n${analysis.coldEmail.body}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCoverLetter = () => {
    if (analysis?.coverLetter) {
      navigator.clipboard.writeText(analysis.coverLetter);
      setCoverLetterCopied(true);
      setTimeout(() => setCoverLetterCopied(false), 2000);
    }
  };

  const downloadCoverLetter = () => {
    if (!analysis?.coverLetter) return;
    const element = document.createElement("a");
    const file = new Blob([analysis.coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${analysis.candidateProfile?.name || 'Candidate'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const submitRating = async () => {
    if (ratingStars === 0) {
        alert("Please select a star rating.");
        return;
    }

    try {
        if (supabase) {
            const { error } = await supabase.from('ratings').insert([{
              candidate_name: analysis?.candidateProfile?.name || "Anonymous",
              candidate_email: analysis?.candidateProfile?.email || "No Email",
              stars: ratingStars,
              resume_score: analysis?.score || 0
            }]);

            if (error) {
              console.error("Supabase error:", error);
            } else {
              console.log("Rating submitted to Supabase successfully.");
            }
        } else {
             console.log("Supabase not configured. Rating:", ratingStars);
        }
        
        setRatingSubmitted(true);
        setTimeout(() => setShowRating(false), 2000);
    } catch (error) {
        console.error("Submission error:", error);
        // Even if it fails, close the modal so user isn't stuck
        setRatingSubmitted(true);
        setTimeout(() => setShowRating(false), 2000);
    }
  };

  const handleSkipRating = async () => {
      // Save details even if skipped, with 0 stars to indicate skipping
      if (supabase) {
          try {
              const { error } = await supabase.from('ratings').insert([{
                candidate_name: analysis?.candidateProfile?.name || "Anonymous",
                candidate_email: analysis?.candidateProfile?.email || "No Email",
                stars: 0, // 0 indicates skipped
                resume_score: analysis?.score || 0
              }]);
              
              if (error) console.error("Supabase error on skip:", error);
          } catch (error) {
              console.error("Supabase error on skip:", error);
          }
      }
      setShowRating(false);
  };

  // --- Helper for Job Split ---
  const linkedinNaukriJobs = jobs.filter(j => 
    j.source.toLowerCase().includes('linkedin') || j.source.toLowerCase().includes('naukri')
  );
  const otherJobs = jobs.filter(j => 
    !j.source.toLowerCase().includes('linkedin') && !j.source.toLowerCase().includes('naukri')
  );


  // --- Views ---

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans scroll-smooth transition-colors duration-300">
        <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded">AI</span> ResumePro
          </div>
          <nav className="flex items-center gap-6 text-slate-600 dark:text-slate-300 font-medium">
            <button onClick={() => setView('how-it-works')} className="hidden md:block hover:text-blue-600 dark:hover:text-blue-400">How it Works</button>
            <a href="#features" onClick={scrollToFeatures} className="hidden md:block hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </nav>
          <button onClick={() => setView('input')} className="hidden md:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition">
            Scan My Resume
          </button>
        </header>

        {/* Fix: Remove justify-center to allow natural scrolling for long content */}
        <main className="flex-grow flex flex-col items-center text-center px-4 mt-10 md:mt-20">
          <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold mb-6 animate-fade-in border border-blue-200 dark:border-blue-800">
            New: Agentic AI Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight max-w-4xl mb-6">
            Is Your Resume <span className="text-blue-600 dark:text-blue-400">ATS Ready?</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-8">
            Get a genuine 0-100 score, uncover missing skills, and get matched with top jobs on LinkedIn, Naukri, and Indeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button onClick={() => setView('input')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition transform w-full">
              Analyze for Free
            </button>
          </div>

          <div id="features" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl scroll-mt-24 pb-20">
            {[
              { icon: <Icons.Target />, title: "Precision Scoring", desc: "Strict 0-100 rating based on role-specific keywords." },
              { icon: <Icons.Map />, title: "Study Roadmap", desc: "Step-by-step guide to learn missing skills." },
              { icon: <Icons.Briefcase />, title: "Smart Job Match", desc: "Finds jobs that actually fit your experience level." }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>
        
        <footer className="mt-20 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-1">
             Designed by YK 
             <span className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">❤️</span>
          </p>
        </footer>
      </div>
    );
  }

  if (view === 'how-it-works') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 p-8 font-sans transition-colors duration-300">
        <button onClick={() => setView('landing')} className="mb-8 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">← Back</button>
        <h2 className="text-3xl font-bold mb-10 text-center text-slate-900 dark:text-white">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-12">
           <div className="flex gap-6">
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">1</div>
             <div>
               <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Upload & Parse</h3>
               <p className="text-slate-600 dark:text-slate-300">Our AI extracts your text using OCR and identifies your experience level (Entry, Mid, Senior).</p>
             </div>
           </div>
           <div className="flex gap-6">
             <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">2</div>
             <div>
               <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Gap Analysis</h3>
               <p className="text-slate-600 dark:text-slate-300">We compare your skills against thousands of job descriptions for your target role to find missing keywords.</p>
             </div>
           </div>
           <div className="flex gap-6">
             <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">3</div>
             <div>
               <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Match & Roadmap</h3>
               <p className="text-slate-600 dark:text-slate-300">We search LinkedIn & Naukri for matching jobs and generate a study plan to help you get hired.</p>
             </div>
           </div>
        </div>
      </div>
    )
  }

  if (view === 'analyzing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Analyzing Resume...</h2>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">{loadingMsg}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dashboard / Input View */}
      {view === 'input' && (
        <div className="max-w-3xl mx-auto pt-10 px-4 pb-20 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setView('landing')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium">← Back to Home</button>
             <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white">
              <h2 className="text-2xl font-bold">Resume Scanner</h2>
              <p className="text-slate-400 mt-1">Upload your resume and job details below.</p>
            </div>
            
            <div className="p-8 space-y-8">
              
              {/* Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">1. Upload Resume (PDF/Image)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition group cursor-pointer relative">
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,image/*" />
                  <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Icons.Upload />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{resumeFile ? resumeFile.name : "Click to upload or drag & drop"}</p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG</p>
                </div>
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-300 dark:text-slate-500 text-xs uppercase">Or paste text</span>
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
                </div>

                <textarea 
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume text here..." 
                  className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition text-slate-900 dark:text-white"
                />
              </div>

              {/* Job Details Section */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">2. Target Job Details</label>
                
                <div>
                   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Target Role (e.g., "React Developer")</label>
                   <input 
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="Enter the Job Title you are applying for"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white"
                   />
                </div>

                <div>
                   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Job Description (Optional but recommended)</label>
                   <textarea 
                      value={jobDescription} 
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here for better matching accuracy..." 
                      className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 dark:text-white"
                   />
                </div>
              </div>

              <button 
                onClick={handleAnalyze} 
                className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition transform"
              >
                Scan Resume
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {view === 'results' && analysis && (
        <>
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setView('input')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">← Back to Dashboard</button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Score & Summary */}
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden transition-colors">
                 <div className="relative w-40 h-40 mb-4">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="45" fill="none" stroke={darkMode ? "#334155" : "#e2e8f0"} strokeWidth="8" />
                     <circle cx="50" cy="50" r="45" fill="none" stroke={analysis.score > 80 ? "#22c55e" : analysis.score > 50 ? "#f59e0b" : "#ef4444"} strokeWidth="8" strokeDasharray={`${analysis.score * 2.83} 283`} strokeLinecap="round" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${analysis.score > 80 ? 'text-green-600 dark:text-green-500' : analysis.score > 50 ? 'text-amber-500' : 'text-red-500'}`}>{analysis.score}</span>
                      <span className="text-xs uppercase text-slate-400">ATS Score</span>
                   </div>
                 </div>
                 <div className="text-lg font-bold text-slate-800 dark:text-white">{analysis.matchLevel} Match</div>
              </div>

               {/* Profile Card */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-100 dark:border-slate-700 transition-colors">
                  <h3 className="font-bold text-sm text-slate-400 uppercase mb-3">Candidate Profile</h3>
                  <div className="space-y-2 text-sm text-slate-900 dark:text-slate-100">
                     <div className="flex items-center gap-2"><Icons.UserCheck /> <span className="font-medium">{analysis.candidateProfile?.name || "Detected Name"}</span></div>
                     <div className="flex items-center gap-2"><Icons.Mail /> <span className="text-slate-500 dark:text-slate-400">{analysis.candidateProfile?.email || "Detected Email"}</span></div>
                     <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700">
                        <span className="text-xs text-slate-400">Experience Level:</span>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{analysis.experienceLevel}</div>
                     </div>
                  </div>
               </div>

               {/* Interview Prep */}
               <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🎙️ Interview Readiness</h3>
                  <div className="space-y-4 text-sm">
                     <div>
                        <div className="text-slate-400 text-xs uppercase font-bold mb-1">Likely Questions</div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-200">
                           {analysis.interviewPrep?.questions.slice(0,3).map((q,i) => <li key={i}>{q}</li>)}
                        </ul>
                     </div>
                     <div>
                        <div className="text-red-400 text-xs uppercase font-bold mb-1">Weak Areas</div>
                        <p className="text-slate-300">{analysis.interviewPrep?.weakAreas.join(", ")}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Middle Column: Analysis & Roadmap */}
            <div className="md:col-span-2 space-y-8">
               
               {/* Summary */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 transition-colors">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Executive Summary</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{analysis.summary}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <h4 className="font-bold text-green-600 dark:text-green-500 text-sm uppercase mb-3 flex items-center gap-2"><Icons.Check /> Your Strengths</h4>
                        <ul className="space-y-2">
                           {analysis.strengths.map((s, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"><span>•</span> {s}</li>)}
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold text-red-500 text-sm uppercase mb-3 flex items-center gap-2"><Icons.X /> Missing Keywords</h4>
                        <ul className="space-y-2">
                           {analysis.missingKeywords.map((k, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"><span>•</span> {k}</li>)}
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Roadmap */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 transition-colors">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Icons.Bulb /> Personalized Study Roadmap</h3>
                  <div className="space-y-6">
                     {analysis.roadmap?.map((step, i) => (
                        <div key={i} className="flex gap-4">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                              {i+1}
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-800 dark:text-white">{step.title}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{step.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               {/* Suggested Projects */}
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 p-8">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4">🚀 Suggested Projects to Build</h3>
                  <div className="grid grid-cols-1 gap-4">
                     {analysis.suggestedProjects?.map((p, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 text-sm text-blue-800 dark:text-blue-200 font-medium transition-colors">
                           {p}
                        </div>
                     ))}
                  </div>
               </div>

               {/* Cold Email */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 relative group transition-colors">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                     <button onClick={copyEmail} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                        {copied ? "Copied!" : <><Icons.Copy /> Copy Email</>}
                     </button>
                  </div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><Icons.Mail /> Recruiter Cold Email</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-600 dark:text-slate-300">
                     <div className="font-bold text-slate-800 dark:text-slate-200 mb-2">Subject: {analysis.coldEmail?.subject}</div>
                     <div className="whitespace-pre-wrap">{analysis.coldEmail?.body}</div>
                  </div>
               </div>

               {/* Cover Letter */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 relative group transition-colors">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition flex gap-2">
                     <button onClick={downloadCoverLetter} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Icons.Download /> Download
                     </button>
                     <button onClick={copyCoverLetter} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                        {coverLetterCopied ? "Copied!" : <><Icons.Copy /> Copy</>}
                     </button>
                  </div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><Icons.FileText /> Cover Letter</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 font-serif text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                     {analysis.coverLetter}
                  </div>
               </div>

            </div>
          </div>

          {/* Jobs Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recommended Jobs</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Matched using verified skills: <span className="font-medium text-blue-600 dark:text-blue-400">{analysis.topSkills.join(", ")}</span></p>
            
            <div className="space-y-8">
               
               {/* Premium Jobs (LinkedIn & Naukri) */}
               <div>
                 <h4 className="flex items-center gap-2 text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">
                   <Icons.Linkedin /> Top Matches (LinkedIn & Naukri)
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {linkedinNaukriJobs.length > 0 ? linkedinNaukriJobs.map((job, idx) => (
                      <div key={idx} className="bg-blue-50 dark:bg-slate-800/80 p-5 rounded-xl border border-blue-200 dark:border-blue-900 shadow-sm hover:shadow-md transition group">
                        <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{job.title}</h4>
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{job.company}</div>
                              <div className="inline-block bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded font-semibold border border-blue-100 dark:border-slate-600">{job.source}</div>
                            </div>
                            <a href={job.link} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                              Apply Now →
                            </a>
                        </div>
                      </div>
                  )) : (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">No premium LinkedIn/Naukri matches found yet.</p>
                    </div>
                  )}
                 </div>
               </div>

               {/* Other Jobs */}
               <div>
                 <h4 className="flex items-center gap-2 text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">
                   <Icons.Globe /> Other Relevant Opportunities
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {otherJobs.length > 0 ? otherJobs.map((job, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group">
                          <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{job.title}</h4>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{job.company}</div>
                                <div className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs px-2 py-1 rounded">{job.source}</div>
                              </div>
                              <a href={job.link} target="_blank" rel="noreferrer" className="bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition">
                                Apply Now →
                              </a>
                          </div>
                        </div>
                    )) : (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          <p className="text-slate-500 dark:text-slate-400">No other relevant jobs found.</p>
                      </div>
                    )}
                 </div>
               </div>

            </div>
          </div>

        </div>

        <footer className="mt-12 py-8 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 text-sm transition-colors">
          <p className="flex items-center justify-center gap-1">
             Designed by YK 
             <span className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">❤️</span>
          </p>
        </footer>

        {/* Rating Modal */}
        {showRating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-100 dark:border-slate-700 transition-colors">
                    {!ratingSubmitted ? (
                        <>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">How was the analysis?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Feedback helps us improve.</p>
                            
                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Icons.Star 
                                        key={star} 
                                        filled={star <= ratingStars} 
                                        onClick={() => setRatingStars(star)} 
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={submitRating}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                            <button 
                                onClick={handleSkipRating}
                                className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                Skip
                            </button>
                        </>
                    ) : (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thank You!</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your feedback has been recorded.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
      )}

    </div>
  );
};

export default App;