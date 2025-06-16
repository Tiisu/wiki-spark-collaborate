
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Globe } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Empower Your Journey to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Wikipedia Mastery</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            Join a vibrant global community of knowledge creators. Learn to contribute effectively to Wikipedia
            through structured learning paths, collaborative projects, and expert mentorship.
          </p>

          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-lg font-medium mb-8">
            <span className="text-green-600">✓</span>
            Completely Free & Open Source Education
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Learning <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              Explore Community
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Structured Learning</h3>
              <p className="text-muted-foreground">Progressive curricula from basics to advanced Wikipedia editing and policy understanding.</p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Global Community</h3>
              <p className="text-muted-foreground">Connect with mentors and fellow contributors in organized improvement drives and events.</p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Impact at Scale</h3>
              <p className="text-muted-foreground">Contribute to free knowledge that reaches millions of people worldwide every day.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
