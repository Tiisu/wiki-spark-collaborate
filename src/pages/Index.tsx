
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import LearningPaths from '../components/LearningPaths';
import CommunityFeatures from '../components/CommunityFeatures';
import QuickStart from '../components/QuickStart';
import UpcomingEvents from '../components/UpcomingEvents';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main>
        <Hero />
        <LearningPaths />
        <CommunityFeatures />
        <QuickStart />
        <UpcomingEvents />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
