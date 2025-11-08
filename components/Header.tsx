'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-1.5 group cursor-pointer">
              <span className="text-[#9bc53d] text-3xl font-bold tracking-tight group-hover:text-[#b8d96a] transition-colors">
                CMG
              </span>
              <span className="text-gray-400 text-base font-semibold tracking-wider uppercase">
                FINANCIAL
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

            {/* App Title */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#9bc53d] animate-pulse shadow-lg shadow-[#9bc53d]/50"></div>
              <h1 className="text-white text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Vendor Compare
              </h1>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => window.location.reload()}
            className="group relative px-6 py-2.5 rounded-xl font-semibold overflow-hidden
                       bg-gradient-to-r from-[#9bc53d] to-[#8ab02f]
                       hover:shadow-xl hover:shadow-[#9bc53d]/30
                       hover:scale-105 active:scale-95
                       transition-all duration-300"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                            translate-x-[-200%] group-hover:translate-x-[200%]
                            transition-transform duration-700"></div>

            {/* Button Content */}
            <span className="relative flex items-center gap-2 text-[#0a0f1e]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Comparison</span>
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#9bc53d]/50 to-transparent"></div>
    </header>
  );
}
