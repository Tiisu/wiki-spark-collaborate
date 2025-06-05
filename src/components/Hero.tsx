
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Globe } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Empower Your Journey to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Wikipedia Mastery</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Join a vibrant global community of knowledge creators. Learn to contribute effectively to Wikipedia 
            through structured learning paths, collaborative projects, and expert mentorship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              Start Learning <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-slate-300">
              Explore Community
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Structured Learning</h3>
              <p className="text-slate-600">Progressive curricula from basics to advanced Wikipedia editing and policy understanding.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Global Community</h3>
              <p className="text-slate-600">Connect with mentors and fellow contributors in organized improvement drives and events.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Impact at Scale</h3>
              <p className="text-slate-600">Contribute to free knowledge that reaches millions of people worldwide every day.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
