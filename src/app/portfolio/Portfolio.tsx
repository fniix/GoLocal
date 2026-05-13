import React, { useState } from 'react';
import PortfolioHome from './PortfolioHome';
import Instructions from './Instructions';
import Solutions from './Solutions';
import Careers from './Careers';
import Terms from './Terms';

const Portfolio = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'instructions' | 'solutions' | 'careers' | 'terms'>('home');

  const handleNavigate = (page: string) => {
    if (page === 'instructions') {
      setCurrentPage('instructions');
    } else if (page === 'solutions') {
      setCurrentPage('solutions');
    } else if (page === 'careers') {
      setCurrentPage('careers');
    } else if (page === 'terms') {
      setCurrentPage('terms');
    } else {
      setCurrentPage('home');
    }
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  return (
    <div className="portfolio-root">
      {currentPage === 'home' && (
        <PortfolioHome onNavigate={handleNavigate} />
      )}
      {currentPage === 'instructions' && (
        <Instructions onBack={handleBack} />
      )}
      {currentPage === 'solutions' && (
        <Solutions onBack={handleBack} />
      )}
      {currentPage === 'careers' && (
        <Careers onBack={handleBack} />
      )}
      {currentPage === 'terms' && (
        <Terms onBack={handleBack} />
      )}
    </div>
  );
};

export default Portfolio;
