import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 300
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      // Start fade out
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      // After fade out completes, update display location and start fade in
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location, duration]);

  const getTransitionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
      width: '100%',
    };

    if (transitionStage === 'fadeOut') {
      return {
        ...baseStyles,
        opacity: 0,
        transform: 'translateX(-20px)',
      };
    }

    return {
      ...baseStyles,
      opacity: 1,
      transform: 'translateX(0)',
    };
  };

  return (
    <div style={getTransitionStyles()}>
      {children}
    </div>
  );
};

export default PageTransition;
