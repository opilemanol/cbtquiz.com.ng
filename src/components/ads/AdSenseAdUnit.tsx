import React from 'react';

interface AdSenseAdUnitProps {
  slotId?: string;
  format?: 'leaderboard' | 'rectangle' | 'in-article' | 'responsive';
  className?: string;
}

// AdSense Auto Ads handles ad injection automatically into clean semantic HTML.
// Manual placeholder boxes are disabled per user request.
export const AdSenseAdUnit: React.FC<AdSenseAdUnitProps> = () => {
  return null;
};
