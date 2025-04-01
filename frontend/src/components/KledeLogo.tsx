import { FC } from 'react';

interface KledeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Klede Logo component - SVG logo that can be rendered in different sizes
 */
const KledeLogo: FC<KledeLogoProps> = ({ size = 'md', className = '' }) => {
  // Determine dimensions based on size
  const dimensions = {
    sm: { width: 80, height: 24 },
    md: { width: 120, height: 36 },
    lg: { width: 160, height: 48 },
    xl: { width: 200, height: 60 }
  }[size];

  return (
    <div className={className}>
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox="0 0 240 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* K letter */}
        <path 
          d="M25 10H10V62H25V40L45 62H65L40 36L65 10H45L25 32V10Z" 
          fill="currentColor" 
        />
        {/* L letter */}
        <path 
          d="M70 10H85V48H120V62H70V10Z" 
          fill="currentColor" 
        />
        {/* E letter */}
        <path 
          d="M125 10H175V24H140V29H170V43H140V48H175V62H125V10Z" 
          fill="currentColor" 
        />
        {/* D letter */}
        <path 
          d="M180 10H215C225 10 235 20 235 36C235 52 225 62 215 62H180V10ZM195 24V48H210C215 48 220 42 220 36C220 30 215 24 210 24H195Z" 
          fill="currentColor" 
        />
        {/* E letter */}
        <path 
          d="M240 10H290V24H255V29H285V43H255V48H290V62H240V10Z" 
          fill="currentColor" 
        />
      </svg>
    </div>
  );
};

export default KledeLogo;