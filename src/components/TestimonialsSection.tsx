import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, BookOpen, Award, Globe, TrendingUp } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Wikipedia Editor",
      location: "San Francisco, CA",
      content: "WikiWalkthrough transformed my understanding of Wikipedia editing. The structured courses helped me go from a complete beginner to confidently contributing to complex articles.",
      rating: 5,
      achievement: "Created 15+ articles"
    },
    {
      name: "Marcus Rodriguez",
      role: "Graduate Student",
      location: "Madrid, Spain",
      content: "The citation and sourcing courses were invaluable for my research. I now contribute regularly to Wikipedia while maintaining academic standards.",
      rating: 5,
      achievement: "500+ edits made"
    },
    {
      name: "Dr. Amara Okafor",
      role: "University Professor",
      location: "Lagos, Nigeria",
      content: "I use WikiWalkthrough to teach my students about digital literacy and collaborative knowledge creation. The platform is exceptional.",
      rating: 5,
      achievement: "Trained 200+ students"
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Learners",
      description: "Contributors worldwide"
    },
    {
      icon: BookOpen,
      value: "150+",
      label: "Expert Courses",
      description: "Comprehensive curriculum"
    },
    {
      icon: Award,
      value: "25,000+",
      label: "Certificates Earned",
      description: "Skills validated"
    },
    {
      icon: Globe,
      value: "180+",
      label: "Countries Reached",
      description: "Global community"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Success Rate",
      description: "Course completion"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/40">
      <div className="container mx-auto">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Join a Thriving Community</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Thousands of learners worldwide are mastering Wikipedia contribution skills through our platform
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
                    <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-card-foreground mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-card-foreground mb-1">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">What Our Learners Say</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from Wikipedia contributors who started their journey with WikiWalkthrough
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card hover:shadow-lg transition-all duration-300 border border-border">
              <CardContent className="p-6">
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.achievement}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-card-foreground">Wikimedia Foundation Endorsed</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-card-foreground">Open Source & Free Forever</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-card-foreground">Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
