import React from 'react';
import { MathRenderer } from './MathRenderer';

interface MathScientificTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

/**
 * Backward compatibility wrapper delegating directly to MathRenderer.
 */
export const MathScientificText: React.FC<MathScientificTextProps> = ({
  text,
  className = '',
  inline = true,
}) => {
  return <MathRenderer content={text} className={className} displayMode={!inline} />;
};
