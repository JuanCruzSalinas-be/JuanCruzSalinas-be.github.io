import React from 'react';
import { Brain } from 'lucide-react';

interface BrainIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const BrainIcon: React.FC<BrainIconProps> = ({ 
  size = 32, 
  className = "text-blue-600", 
  color 
}) => {
  return (
    <Brain 
      size={size} 
      className={className}
      color={color}
    />
  );
};

export default BrainIcon;