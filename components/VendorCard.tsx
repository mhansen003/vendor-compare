'use client';

import { VendorCard as VendorCardType } from '@/types';

interface VendorCardProps {
  vendor: VendorCardType;
  onRemove: () => void;
}

export default function VendorCard({ vendor, onRemove }: VendorCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow relative">
      {/* Status Indicator */}
      {vendor.status === 'loading' && (
        <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#9bc53d] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#2b3e50] font-semibold">Loading vendor info...</p>
          </div>
        </div>
      )}

      {vendor.status === 'error' && (
        <div className="absolute inset-0 bg-red-50/95 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center px-4">
            <p className="text-red-600 font-semibold mb-2">⚠️ Error Loading Vendor</p>
            <p className="text-red-500 text-sm">{vendor.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors"
        title="Remove vendor"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Vendor Logo */}
      {vendor.logo && (
        <div className="mb-4 flex justify-center">
          <img src={vendor.logo} alt={vendor.name} className="h-16 object-contain" />
        </div>
      )}

      {/* Vendor Info */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#2b3e50] truncate">
          {vendor.name || 'Loading...'}
        </h3>
        {vendor.industry && (
          <span className="inline-block bg-[#9bc53d]/10 text-[#9bc53d] px-3 py-1 rounded-full text-sm font-medium">
            {vendor.industry}
          </span>
        )}
        <p className="text-gray-600 text-sm line-clamp-3">
          {vendor.description || 'Fetching vendor information...'}
        </p>
        <a
          href={vendor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1ab4a8] hover:text-[#17a89a] text-sm font-medium flex items-center gap-1 mt-2"
        >
          Visit Website
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
