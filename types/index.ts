export interface VendorCard {
  id: string;
  url: string;
  name: string;
  description: string;
  logo?: string;
  industry?: string;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  errorMessage?: string;
}

export interface ResearchCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface ComparisonResult {
  category: string;
  vendors: {
    [vendorId: string]: {
      content: string;
      summary: string;
    };
  };
}

export interface FinalReport {
  overallSummary: string;
  recommendations: string[];
  comparisonData: ComparisonResult[];
  generatedAt: Date;
}

export type WizardStep = 'vendor-selection' | 'research-selection' | 'results';
