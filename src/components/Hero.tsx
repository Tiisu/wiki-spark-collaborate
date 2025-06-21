
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroImage } from '@/components/ui/OptimizedImage';
import { ArrowRight, BookOpen, Users, Globe, Play, CheckCircle, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <HeroImage
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
          alt="Diverse group of students collaborating on laptops, representing the global Wikipedia learning community"
          className="w-full h-full object-cover"
          fallbackSrc="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-green-800/80" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-6" role="banner" aria-label="Trust indicator">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Trusted by 50,000+ Wikipedia Contributors Worldwide
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Wikipedia
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300"> Contribution Skills</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed max-w-4xl mx-auto">
            Transform from a Wikipedia reader to a confident contributor. Learn editing, sourcing, and community guidelines
            through expert-designed courses that have helped thousands master the world's largest encyclopedia.
          </p>

          {/* Value Propositions */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white px-4 py-2 text-sm">
              <Star className="h-4 w-4 mr-2" />
              100% Free Forever
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white px-4 py-2 text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              150+ Expert Courses
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Global Community
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" aria-label="Start learning Wikipedia contribution skills for free">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg shadow-lg hover:shadow-xl transition-all focus:ring-4 focus:ring-blue-300">
                Start Learning Free <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/register" aria-label="Watch demo video of the platform">
              <Button size="lg" variant="outline" className="px-10 py-4 text-lg border-2 border-white/50 text-white hover:bg-white/20 hover:text-white focus:ring-4 focus:ring-white/30 backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" aria-hidden="true" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Structured Learning Paths</h3>
              <p className="text-card-foreground/80 leading-relaxed">
                Follow carefully designed curricula that take you from Wikipedia basics to advanced editing techniques,
                with hands-on practice and real-world examples.
              </p>
            </div>

            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-green-300" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Expert Mentorship</h3>
              <p className="text-card-foreground/80 leading-relaxed">
                Learn from experienced Wikipedia editors and administrators who provide guidance,
                feedback, and support throughout your contribution journey.
              </p>
            </div>

            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Global Impact</h3>
              <p className="text-card-foreground/80 leading-relaxed">
                Join a mission to democratize knowledge. Your contributions reach millions of readers
                worldwide and help build the sum of human knowledge.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
                <div className="text-sm text-card-foreground/70">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">25K+</div>
                <div className="text-sm text-card-foreground/70">Certificates Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">180+</div>
                <div className="text-sm text-card-foreground/70">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400 mb-2">95%</div>
                <div className="text-sm text-card-foreground/70">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
