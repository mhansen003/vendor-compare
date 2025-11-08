'use client';

import { useState } from 'react';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="text-center space-y-8 py-20">
          <h1 className="text-5xl font-bold text-[#2b3e50]">
            🚀 Vendor Compare
          </h1>
          <p className="text-2xl text-gray-600">
            AI-Powered Vendor Comparison Tool
          </p>
          <div className="bg-white rounded-xl shadow-2xl p-12 max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to the CMG Vendor Compare platform! This tool allows you to:
            </p>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Add up to 4 vendors by URL</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Select custom research categories</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Generate AI-powered comparisons</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Get detailed recommendations</span>
              </li>
            </ul>
            <div className="mt-8">
              <button className="bg-gradient-to-r from-[#9bc53d] to-[#8ab02f] hover:shadow-xl text-white px-12 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1">
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-[#2b3e50] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-[#9bc53d] text-2xl font-bold">CMG</span>
            <span className="text-[#95a5a6] font-semibold">FINANCIAL</span>
          </div>
          <p className="text-[#95a5a6] text-sm">
            © 2025 CMG Financial. All rights reserved. | NMLS# 1820
          </p>
        </div>
      </footer>
    </div>
  );
}
