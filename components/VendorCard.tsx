'use client';

import { VendorCard as VendorCardType } from '@/types';

interface VendorCardProps {
  vendor: VendorCardType;
  onRemove: () => void;
}

export default function VendorCard({ vendor, onRemove }: VendorCardProps) {
  return (
    <div className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6
                    hover:bg-white/8 hover:border-white/20 hover:scale-[1.02]
                    transition-all duration-300 shadow-xl hover:shadow-2xl">

      {/* Gradient Border Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9bc53d]/20 via-transparent to-[#8b5cf6]/20
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

      {/* Loading Overlay */}
      {vendor.status === 'loading' && (
        <div className="absolute inset-0 backdrop-blur-md bg-black/40 rounded-2xl flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Outer Ring */}
              <div className="w-16 h-16 border-4 border-[#9bc53d]/30 rounded-full"></div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#9bc53d] rounded-full animate-spin"></div>
              {/* Inner Glow */}
              <div className="absolute inset-2 bg-[#9bc53d]/20 rounded-full blur-md"></div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Analyzing Vendor</p>
              <p className="text-gray-400 text-sm mt-1">Extracting company data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {vendor.status === 'error' && (
        <div className="absolute inset-0 backdrop-blur-md bg-red-500/10 border-2 border-red-500/50 rounded-2xl
                        flex items-center justify-center z-20">
          <div className="text-center px-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-300 font-bold mb-2">Unable to Load Vendor</p>
            <p className="text-red-400/80 text-sm">{vendor.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 w-9 h-9 backdrop-blur-md bg-red-500/10 hover:bg-red-500/30
                   border border-red-500/30 hover:border-red-500/50
                   text-red-400 hover:text-red-300 rounded-xl
                   flex items-center justify-center transition-all duration-200
                   hover:scale-110 active:scale-95 z-10"
        title="Remove vendor"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Vendor Logo */}
      {vendor.logo && (
        <div className="mb-5 flex justify-center p-4 bg-white/5 rounded-xl border border-white/10">
          <img
            src={vendor.logo}
            alt={vendor.name}
            className="h-16 object-contain filter brightness-110"
          />
        </div>
      )}

      {/* Vendor Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white truncate group-hover:text-[#9bc53d] transition-colors">
          {vendor.name || 'Loading...'}
        </h3>

        {vendor.industry && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#9bc53d] shadow-lg shadow-[#9bc53d]/50"></div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                           bg-gradient-to-r from-[#9bc53d]/20 to-[#1ab4a8]/20
                           border border-[#9bc53d]/30 text-[#9bc53d]">
              {vendor.industry}
            </span>
          </div>
        )}

        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
          {vendor.description || 'Fetching vendor information...'}
        </p>

        {vendor.url && (
          <a
            href={vendor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#1ab4a8] hover:text-[#9bc53d]
                     text-sm font-semibold mt-3 group/link transition-colors"
          >
            <span>Visit Website</span>
            <svg className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#9bc53d]/50 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"></div>
    </div>
  );
}
