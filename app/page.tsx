'use client';

import { useState } from 'react';
import { VendorCard as VendorCardType, WizardStep, FinalReport } from '@/types';
import { RESEARCH_CATEGORIES } from '@/lib/researchCategories';
import Header from '@/components/Header';
import VendorCard from '@/components/VendorCard';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('vendor-selection');
  const [vendors, setVendors] = useState<VendorCardType[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [selectedResearch, setSelectedResearch] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggestingCompetitors, setIsSuggestingCompetitors] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addVendor = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    if (vendors.length >= 4) {
      setError('Maximum 4 vendors allowed');
      return;
    }
    setError(null);
    const newVendor: VendorCardType = {
      id: Date.now().toString(),
      url: urlInput.trim(),
      name: '',
      description: '',
      status: 'loading',
    };
    setVendors([...vendors, newVendor]);
    setUrlInput('');
    try {
      const response = await fetch('/api/search-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newVendor.url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load vendor');
      setVendors((prev) =>
        prev.map((v) =>
          v.id === newVendor.id
            ? {
                ...v,
                name: data.name,
                description: data.description,
                industry: data.industry,
                logo: data.logo,
                status: 'loaded',
              }
            : v
        )
      );
    } catch (error: any) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === newVendor.id
            ? { ...v, status: 'error', errorMessage: error.message }
            : v
        )
      );
    }
  };

  const suggestCompetitors = async () => {
    const loadedVendors = vendors.filter((v) => v.status === 'loaded');
    if (loadedVendors.length === 0) return;
    setIsSuggestingCompetitors(true);
    setError(null);
    try {
      const firstVendor = loadedVendors[0];
      const response = await fetch('/api/suggest-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor: firstVendor }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to suggest competitors');
      const newCompetitors: VendorCardType[] = data.competitors.map((comp: any) => ({
        id: Date.now().toString() + Math.random(),
        url: comp.url,
        name: comp.name,
        description: comp.description,
        industry: comp.industry,
        status: 'loaded' as const,
      }));
      const availableSlots = 4 - vendors.length;
      const competitorsToAdd = newCompetitors.slice(0, availableSlots);
      setVendors((prev) => [...prev, ...competitorsToAdd]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSuggestingCompetitors(false);
    }
  };

  const removeVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleResearchCategory = (categoryId: string) => {
    setSelectedResearch((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const runAnalysis = async () => {
    setCurrentStep('results');
    setIsAnalyzing(true);
    setError(null);
    try {
      const loadedVendors = vendors.filter((v) => v.status === 'loaded');

      // Only send necessary vendor fields to API
      const vendorsForAnalysis = loadedVendors.map((v) => ({
        id: v.id,
        name: v.name,
        url: v.url,
        description: v.description,
      }));

      const categoriesForAnalysis = selectedResearch.map(
        (id) => RESEARCH_CATEGORIES.find((c) => c.id === id)!.label
      );

      console.log('Sending to API:', {
        vendorCount: vendorsForAnalysis.length,
        categoryCount: categoriesForAnalysis.length,
      });

      const response = await fetch('/api/analyze-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendors: vendorsForAnalysis,
          researchCategories: categoriesForAnalysis,
        }),
      });

      const data = await response.json();
      console.log('API Response:', { success: response.ok, data });

      if (!response.ok) throw new Error(data.error || 'Failed to analyze vendors');

      setAnalysisResults({
        overallSummary: data.overallSummary,
        recommendations: data.recommendations,
        comparisonData: data.comparisons,
        generatedAt: new Date(),
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message);
      setCurrentStep('research-selection');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadedVendorsCount = vendors.filter((v) => v.status === 'loaded').length;

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 relative z-10">
        {/* Error Alert */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl mb-8
                          shadow-xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Vendor Selection */}
        {currentStep === 'vendor-selection' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Step Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 mb-4">
                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9bc53d] to-[#1ab4a8] flex items-center justify-center text-white font-bold text-sm">1</span>
                <span className="text-gray-300 font-semibold">Vendor Selection</span>
              </div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Add Vendors to Compare
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Enter up to 4 vendor URLs and let our AI analyze their offerings
              </p>
            </div>

            {/* URL Input Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl hover:bg-white/8 transition-all duration-300">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVendor()}
                  placeholder="https://company-website.com"
                  className="flex-1 px-6 py-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl
                           focus:border-[#9bc53d]/50 focus:bg-white/10 focus:outline-none text-white text-lg
                           placeholder-gray-500 transition-all duration-300"
                />
                <button
                  onClick={addVendor}
                  disabled={vendors.length >= 4}
                  className="group relative px-8 py-4 rounded-2xl font-bold overflow-hidden
                           bg-gradient-to-r from-[#9bc53d] to-[#1ab4a8]
                           hover:shadow-xl hover:shadow-[#9bc53d]/30
                           hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                                translate-x-[-200%] group-hover:translate-x-[200%]
                                transition-transform duration-700"></div>
                  <span className="relative text-[#0a0f1e]">Add Vendor</span>
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-400">
                  {vendors.length}/4 vendors added
                </p>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < vendors.length ? 'bg-[#9bc53d] shadow-lg shadow-[#9bc53d]/50' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Competitor Discovery Card */}
            {loadedVendorsCount === 1 && vendors.length < 4 && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                      AI-Powered Competitor Discovery
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-500/50">
                        BETA
                      </span>
                    </h3>
                    <p className="text-gray-300 mb-5 leading-relaxed">
                      Let our AI identify top competitors to <span className="text-[#9bc53d] font-semibold">{vendors.find((v) => v.status === 'loaded')?.name}</span> for you! We'll automatically find and add relevant alternatives for comparison.
                    </p>
                    <button
                      onClick={suggestCompetitors}
                      disabled={isSuggestingCompetitors}
                      className="group relative px-6 py-3 rounded-xl font-semibold overflow-hidden
                               bg-gradient-to-r from-purple-500 to-blue-500
                               hover:shadow-xl hover:shadow-purple-500/30
                               hover:scale-105 active:scale-95
                               disabled:opacity-50
                               transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                                    translate-x-[-200%] group-hover:translate-x-[200%]
                                    transition-transform duration-700"></div>
                      {isSuggestingCompetitors ? (
                        <span className="relative flex items-center gap-2 text-white">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Finding Competitors...
                        </span>
                      ) : (
                        <span className="relative flex items-center gap-2 text-white">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          AI Suggest Competitors
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Cards Grid */}
            {vendors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onRemove={() => removeVendor(vendor.id)}
                  />
                ))}
              </div>
            )}

            {/* Continue Button */}
            {loadedVendorsCount >= 2 && (
              <div className="flex justify-center pt-4 animate-in slide-in-from-bottom duration-500">
                <button
                  onClick={() => setCurrentStep('research-selection')}
                  className="group relative px-12 py-5 rounded-2xl font-bold text-lg overflow-hidden
                           bg-gradient-to-r from-[#9bc53d] to-[#1ab4a8]
                           hover:shadow-2xl hover:shadow-[#9bc53d]/40
                           hover:scale-105 active:scale-95
                           transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0
                                translate-x-[-200%] group-hover:translate-x-[200%]
                                transition-transform duration-700"></div>
                  <span className="relative flex items-center gap-3 text-[#0a0f1e]">
                    Continue to Research Selection
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Research Selection */}
        {currentStep === 'research-selection' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Step Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 mb-4">
                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9bc53d] to-[#1ab4a8] flex items-center justify-center text-white font-bold text-sm">2</span>
                <span className="text-gray-300 font-semibold">Research Categories</span>
              </div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Select Research Categories
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Choose what aspects to compare across your selected vendors
              </p>
            </div>

            {/* Category Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {RESEARCH_CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className={`group relative backdrop-blur-xl rounded-2xl p-6 cursor-pointer
                           transition-all duration-300 hover:scale-[1.02]
                           ${
                             selectedResearch.includes(category.id)
                               ? 'bg-[#9bc53d]/15 border-2 border-[#9bc53d] shadow-xl shadow-[#9bc53d]/20'
                               : 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20'
                           }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedResearch.includes(category.id)}
                      onChange={() => toggleResearchCategory(category.id)}
                      className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-white/5
                               checked:bg-[#9bc53d] checked:border-[#9bc53d]
                               focus:ring-2 focus:ring-[#9bc53d]/50 transition-all"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-bold text-white group-hover:text-[#9bc53d] transition-colors">
                          {category.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedResearch.includes(category.id) && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#9bc53d] flex items-center justify-center shadow-lg shadow-[#9bc53d]/50">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>

            {/* Selected Count */}
            <div className="text-center">
              <p className="text-gray-400">
                <span className="text-[#9bc53d] font-bold text-2xl">{selectedResearch.length}</span> {selectedResearch.length === 1 ? 'category' : 'categories'} selected
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentStep('vendor-selection')}
                className="group px-8 py-4 rounded-2xl font-semibold backdrop-blur-xl
                         bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                         text-white hover:scale-105 active:scale-95
                         transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Back
                </span>
              </button>
              <button
                onClick={runAnalysis}
                disabled={selectedResearch.length === 0}
                className="group relative px-12 py-4 rounded-2xl font-bold text-lg overflow-hidden
                         bg-gradient-to-r from-[#9bc53d] to-[#1ab4a8]
                         hover:shadow-2xl hover:shadow-[#9bc53d]/40
                         hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0
                              translate-x-[-200%] group-hover:translate-x-[200%]
                              transition-transform duration-700"></div>
                <span className="relative flex items-center gap-3 text-[#0a0f1e]">
                  Run Analysis
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Results */}
        {currentStep === 'results' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {isAnalyzing ? (
              <div className="text-center py-32">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 border-8 border-[#9bc53d]/30 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-transparent border-t-[#9bc53d] rounded-full animate-spin"></div>
                  <div className="absolute inset-3 bg-[#9bc53d]/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Analyzing Vendors...
                </h2>
                <p className="text-xl text-gray-400">
                  Our AI is comparing <span className="text-[#9bc53d] font-bold">{loadedVendorsCount}</span> vendors across{' '}
                  <span className="text-[#1ab4a8] font-bold">{selectedResearch.length}</span> categories
                </p>
              </div>
            ) : analysisResults ? (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 mb-4">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9bc53d] to-[#1ab4a8] flex items-center justify-center text-white font-bold text-sm">✓</span>
                    <span className="text-gray-300 font-semibold">Analysis Complete</span>
                  </div>
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    📊 Comparison Results
                  </h2>
                  <p className="text-gray-400">
                    Generated on {analysisResults.generatedAt.toLocaleString()}
                  </p>
                </div>

                {/* Executive Summary */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-[#9bc53d]/15 to-[#1ab4a8]/15 border border-[#9bc53d]/30 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#9bc53d]/20 border border-[#9bc53d]/40 flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                      Executive Summary
                    </h3>
                  </div>
                  <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                    {analysisResults.overallSummary}
                  </p>
                </div>

                {/* Category Comparisons */}
                {analysisResults.comparisonData.map((comparison, idx) => (
                  <div key={idx} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl hover:bg-white/8 hover:border-white/15 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-2xl">
                          {RESEARCH_CATEGORIES.find((c) => c.label === comparison.category)?.icon || '📌'}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white">
                        {comparison.category}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(comparison.vendors).map(([vendorId, data]) => {
                        const vendor = vendors.find((v) => v.id === vendorId);
                        return (
                          <div
                            key={vendorId}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-3 h-3 rounded-full bg-[#9bc53d] shadow-lg shadow-[#9bc53d]/50"></div>
                              <h4 className="font-bold text-xl text-white">
                                {vendor?.name}
                              </h4>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {data.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Recommendations */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                      Recommendations
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {analysisResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="w-8 h-8 rounded-lg bg-[#9bc53d]/20 border border-[#9bc53d]/40 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#9bc53d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-200 text-lg leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* New Comparison Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="group relative px-12 py-5 rounded-2xl font-bold text-lg overflow-hidden
                             backdrop-blur-xl bg-white/10 border border-white/20
                             hover:bg-white/15 hover:border-white/30
                             hover:scale-105 active:scale-95
                             transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0
                                  translate-x-[-200%] group-hover:translate-x-[200%]
                                  transition-transform duration-700"></div>
                    <span className="relative flex items-center gap-3 text-white">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Start New Comparison
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-baseline justify-center gap-2 mb-3">
            <span className="text-[#9bc53d] text-2xl font-bold">CMG</span>
            <span className="text-gray-400 font-semibold tracking-wider">FINANCIAL</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CMG Financial. All rights reserved. | NMLS# 1820
          </p>
          <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-[#9bc53d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Vendor Comparison Tool
          </p>
        </div>
      </footer>
    </div>
  );
}
