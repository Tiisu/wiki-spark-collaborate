import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentImage } from '@/components/ui/OptimizedImage';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Globe, Edit, Lightbulb } from 'lucide-react';

const ImageSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Learn by Doing with 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Real Wikipedia Projects</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our hands-on approach means you'll be making actual contributions to Wikipedia from day one. 
                Practice with real articles, learn from experienced editors, and see your impact grow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Live Editing Practice</h3>
                  <p className="text-sm text-muted-foreground">Practice editing in a safe sandbox environment before contributing to live articles.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Peer Review</h3>
                  <p className="text-sm text-muted-foreground">Get feedback from experienced editors and improve your contributions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Citation Mastery</h3>
                  <p className="text-sm text-muted-foreground">Learn to find, evaluate, and properly cite reliable sources.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Global Collaboration</h3>
                  <p className="text-sm text-muted-foreground">Work with contributors from around the world on shared projects.</p>
                </div>
              </div>
            </div>

            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Start Contributing Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Right side - Visual representation */}
          <div className="relative">
            {/* Main image with overlay content */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ContentImage
                src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                alt="Students collaborating on laptops in a modern learning environment, representing Wikipedia community collaboration"
                className="w-full h-[500px] object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1970&q=80"
              />

              {/* Overlay content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Bottom overlay with Wikipedia editing info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Card className="bg-card/95 backdrop-blur-sm text-card-foreground p-4 border border-border">
                  <div className="space-y-3">
                    {/* Wikipedia article mockup */}
                    <div className="border-l-4 border-primary pl-3">
                      <h3 className="font-bold text-sm text-card-foreground mb-1">Climate Change</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Climate change refers to long-term shifts in global temperatures...
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Edit className="h-3 w-3 mr-1" />
                          Last edited: 2 hours ago
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          1,247 editors
                        </span>
                      </div>
                    </div>

                    {/* Citation tip */}
                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-primary">Pro Tip</p>
                          <p className="text-xs text-primary/80">Always cite reliable sources for your contributions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Floating achievement badges */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg animate-pulse">
              <Globe className="h-6 w-6" />
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">50K+</div>
                <div className="text-xs text-card-foreground/70">Active Learners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageSection;
