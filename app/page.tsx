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
    setIsAnalyzing(true);
    setError(null);
    setCurrentStep('results');
    try {
      const vendorData = vendors
        .filter((v) => v.status === 'loaded')
        .map((v) => ({
          id: v.id,
          name: v.name,
          url: v.url,
          description: v.description,
        }));
      const categoryLabels = selectedResearch.map(
        (id) => RESEARCH_CATEGORIES.find((c) => c.id === id)?.label || id
      );
      const response = await fetch('/api/analyze-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendors: vendorData,
          researchCategories: categoryLabels,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze vendors');
      setAnalysisResults({
        overallSummary: data.overallSummary,
        recommendations: data.recommendations,
        comparisonData: data.comparisons,
        generatedAt: new Date(),
      });
    } catch (error: any) {
      setError(error.message);
      setCurrentStep('research-selection');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadedVendorsCount = vendors.filter((v) => v.status === 'loaded').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentStep === 'vendor-selection' && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-[#2b3e50]">
                Step 1: Add Vendors to Compare
              </h2>
              <p className="text-lg text-gray-600">
                Enter up to 4 vendor URLs to analyze and compare
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVendor()}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#9bc53d] focus:outline-none text-lg"
                />
                <button
                  onClick={addVendor}
                  disabled={vendors.length >= 4}
                  className="bg-[#9bc53d] hover:bg-[#8ab02f] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-all"
                >
                  Add Vendor
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {vendors.length}/4 vendors added
              </p>
            </div>

            {loadedVendorsCount === 1 && vendors.length < 4 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🤖</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#2b3e50] mb-2">
                      AI-Powered Competitor Discovery
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Let our AI identify top competitors to {vendors.find((v) => v.status === 'loaded')?.name} for you! We'll automatically find and add relevant alternatives for comparison.
                    </p>
                    <button
                      onClick={suggestCompetitors}
                      disabled={isSuggestingCompetitors}
                      className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-lg disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      {isSuggestingCompetitors ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Finding Competitors...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          AI Suggest Competitors
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {vendors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onRemove={() => removeVendor(vendor.id)}
                  />
                ))}
              </div>
            )}

            {loadedVendorsCount >= 2 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep('research-selection')}
                  className="bg-gradient-to-r from-[#9bc53d] to-[#8ab02f] hover:shadow-xl text-white px-12 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1"
                >
                  Continue to Research Selection →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'research-selection' && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-[#2b3e50]">
                Step 2: Select Research Categories
              </h2>
              <p className="text-lg text-gray-600">
                Choose what aspects to compare across vendors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {RESEARCH_CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className="flex items-start gap-4 bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-[#9bc53d] cursor-pointer transition-all hover:shadow-lg"
                >
                  <input
                    type="checkbox"
                    checked={selectedResearch.includes(category.id)}
                    onChange={() => toggleResearchCategory(category.id)}
                    className="w-5 h-5 mt-1 accent-[#9bc53d]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold text-[#2b3e50]">
                        {category.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep('vendor-selection')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all"
              >
                ← Back
              </button>
              <button
                onClick={runAnalysis}
                disabled={selectedResearch.length === 0}
                className="bg-gradient-to-r from-[#9bc53d] to-[#8ab02f] hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-12 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1"
              >
                Run Analysis →
              </button>
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="space-y-8">
            {isAnalyzing ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 border-8 border-[#9bc53d] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-3xl font-bold text-[#2b3e50] mb-3">
                  Analyzing Vendors...
                </h2>
                <p className="text-lg text-gray-600">
                  Our AI is comparing {loadedVendorsCount} vendors across{' '}
                  {selectedResearch.length} categories
                </p>
              </div>
            ) : analysisResults ? (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-bold text-[#2b3e50]">
                    📊 Comparison Results
                  </h2>
                  <p className="text-lg text-gray-600">
                    Generated on {analysisResults.generatedAt.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-[#2b3e50] mb-4">
                    📝 Executive Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {analysisResults.overallSummary}
                  </p>
                </div>

                {analysisResults.comparisonData.map((comparison, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-[#2b3e50] mb-6">
                      {RESEARCH_CATEGORIES.find((c) => c.label === comparison.category)
                        ?.icon || '📌'}{' '}
                      {comparison.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(comparison.vendors).map(([vendorId, data]) => {
                        const vendor = vendors.find((v) => v.id === vendorId);
                        return (
                          <div
                            key={vendorId}
                            className="border-2 border-gray-200 rounded-lg p-6"
                          >
                            <h4 className="font-bold text-lg text-[#2b3e50] mb-3">
                              {vendor?.name}
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {data.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="bg-gradient-to-r from-[#9bc53d] to-[#8ab02f] text-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">💡 Recommendations</h3>
                  <ul className="space-y-3">
                    {analysisResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl">✓</span>
                        <span className="text-lg">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#2b3e50] hover:bg-[#1f2d3d] text-white px-12 py-4 rounded-xl font-bold text-lg transition-all"
                  >
                    Start New Comparison
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="bg-[#2b3e50] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-[#9bc53d] text-2xl font-bold">CMG</span>
            <span className="text-[#95a5a6] font-semibold">FINANCIAL</span>
          </div>
          <p className="text-[#95a5a6] text-sm">
            © {new Date().getFullYear()} CMG Financial. All rights reserved. | NMLS#
            1820
          </p>
          <p className="text-[#95a5a6] text-sm mt-2">
            AI-Powered Vendor Comparison Tool
          </p>
        </div>
      </footer>
    </div>
  );
}
