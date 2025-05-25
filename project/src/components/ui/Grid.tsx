import React from 'react';
import { twMerge } from 'tailwind-merge';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  rowGap?: number | string;
  colGap?: number | string;
}

const Grid: React.FC<GridProps> = ({
  children,
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap,
  rowGap,
  colGap,
}) => {
  const getColsClass = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`;
    }

    return [
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const getGapClass = () => {
    const classes = [];
    
    if (gap) {
      classes.push(typeof gap === 'number' ? `gap-${gap}` : gap);
    }
    
    if (rowGap) {
      classes.push(typeof rowGap === 'number' ? `row-gap-${rowGap}` : rowGap);
    }
    
    if (colGap) {
      classes.push(typeof colGap === 'number' ? `col-gap-${colGap}` : colGap);
    }
    
    return classes.join(' ');
  };

  return (
    <div
      className={twMerge('grid grid-cols-1', getColsClass(), getGapClass(), className)}
    >
      {children}
    </div>
  );
};

export default Grid;
