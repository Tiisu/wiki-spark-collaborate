import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Star, Users, BookOpen, Globe } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            Join 50,000+ Contributors Worldwide
          </div>

          {/* Main heading */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Make Your Mark on
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Wikipedia?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
            Start your journey today and join a global community of knowledge creators. 
            Your first contribution could reach millions of readers worldwide.
          </p>

          {/* Benefits list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
              <span className="text-lg font-medium">100% Free Forever</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
              <span className="text-lg font-medium">Expert-Led Courses</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
              <span className="text-lg font-medium">Global Community</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register" aria-label="Create your free WikiWalkthrough account">
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all focus:ring-4 focus:ring-white/50"
              >
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login" aria-label="Sign in to your existing account">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-10 py-4 text-lg font-semibold transition-all focus:ring-4 focus:ring-white/50"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-200" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-blue-200">Active Learners</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">150+</div>
              <div className="text-sm text-blue-200">Expert Courses</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-8 w-8 text-blue-200" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">180+</div>
              <div className="text-sm text-blue-200">Countries</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-blue-200" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">95%</div>
              <div className="text-sm text-blue-200">Success Rate</div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-12 text-center">
            <p className="text-blue-200 text-sm">
              No credit card required • Start learning immediately • Join the Wikipedia community
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
