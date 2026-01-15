import React from 'react';
import { ACNEAE_ORDER } from '../constants';

interface AcneaeTagProps {
  tags: string[];
}

// Helper to get the highest priority tag
const getPriorityTag = (tags: string[]): string | null => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return tags.slice().sort((a, b) => {
    const aBase = a.split(' ')[0];
    const bBase = b.split(' ')[0];
    const aPriority = ACNEAE_ORDER[aBase as keyof typeof ACNEAE_ORDER] || 99;
    const bPriority = ACNEAE_ORDER[bBase as keyof typeof ACNEAE_ORDER] || 99;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return a.localeCompare(b);
  })[0];
};

const getTagStyle = (tag: string | null): { bg: string, text: string } => {
    if (!tag) return { bg: 'bg-transparent', text: '' };
    const base = tag.split(' ')[0];
    switch (base) {
        case 'PAC':
        case 'PRE':
            return { bg: 'bg-red-500', text: 'text-white' };
        case 'RE':
             return { bg: 'bg-blue-500', text: 'text-white' };
        case 'ACS':
            return { bg: 'bg-green-500', text: 'text-white' };
        default:
            return { bg: 'bg-yellow-500', text: 'text-white' };
    }
}

const AcneaeTag: React.FC<AcneaeTagProps> = ({ tags }) => {
  const priorityTag = getPriorityTag(tags);

  if (!priorityTag) {
    return null;
  }
  
  const style = getTagStyle(priorityTag);

  return (
    <div 
        className={`w-4 h-4 rounded-full flex-shrink-0 ${style.bg}`}
        title={`ACNEAE: ${tags.join(', ')} (Prioritario: ${priorityTag})`}
    >
    </div>
  );
};

export default AcneaeTag;
