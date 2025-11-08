'use client';

export default function Header() {
  return (
    <header className="bg-[#2b3e50] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-1">
              <span className="text-[#9bc53d] text-3xl font-bold tracking-tight">CMG</span>
              <span className="text-[#95a5a6] text-lg font-semibold tracking-wide">FINANCIAL</span>
            </div>
            <div className="w-px h-9 bg-white/15"></div>
            <h1 className="text-white text-2xl font-semibold">Vendor Compare</h1>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-[#9bc53d] hover:bg-[#8ab02f] text-[#2b3e50] px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => window.location.reload()}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Comparison
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
