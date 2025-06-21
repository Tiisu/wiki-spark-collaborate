
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedCourses from '../components/LearningPaths';
import ImageSection from '../components/ImageSection';
import WikipediaShowcase from '../components/WikipediaShowcase';
import CommunityFeatures from '../components/CommunityFeatures';
import TestimonialsSection from '../components/TestimonialsSection';
import QuickStart from '../components/QuickStart';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main>
        <Hero />
        <FeaturedCourses />
        <ImageSection />
        <WikipediaShowcase />
        <CommunityFeatures />
        <TestimonialsSection />
        <QuickStart />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
