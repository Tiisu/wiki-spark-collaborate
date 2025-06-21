import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentImage } from '@/components/ui/OptimizedImage';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Edit, 
  Users, 
  Globe, 
  BookOpen, 
  CheckCircle, 
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

const WikipediaShowcase = () => {
  const achievements = [
    {
      icon: Edit,
      title: "Master Wikipedia Editing",
      description: "Learn the fundamentals of Wikipedia markup, formatting, and style guidelines",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: BookOpen,
      title: "Source & Citation Skills",
      description: "Discover how to find, evaluate, and properly cite reliable sources",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Users,
      title: "Community Collaboration",
      description: "Engage with the global Wikipedia community and contribute to discussions",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Make contributions that reach millions of readers worldwide",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10"
    }
  ];

  const stats = [
    { value: "6M+", label: "Articles", icon: BookOpen },
    { value: "300+", label: "Languages", icon: Globe },
    { value: "100K+", label: "Active Editors", icon: Users },
    { value: "15B+", label: "Monthly Views", icon: TrendingUp }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-primary/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary px-4 py-2 mb-4 border border-primary/20">
            <Award className="h-4 w-4 mr-2" />
            Wikipedia Impact
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Join the World's Largest
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Knowledge Project</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wikipedia is more than an encyclopedia—it's a global movement for free knowledge. 
            Learn how to be part of this incredible collaborative effort.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ContentImage
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Person editing Wikipedia on a laptop, showing the collaborative nature of knowledge creation"
                className="w-full h-[400px] object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              />
              
              {/* Overlay with Wikipedia stats */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">6M+</div>
                  <div className="text-xs text-card-foreground/70">Articles</div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">300+</div>
                  <div className="text-xs text-card-foreground/70">Languages</div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full shadow-xl">
              <Edit className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-xl">
              <Globe className="h-8 w-8" />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Learn Skills That Make a Real Difference
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every Wikipedia edit you make has the potential to educate millions of people. 
                Our courses teach you not just how to edit, but how to contribute meaningfully 
                to the world's knowledge base.
              </p>
            </div>

            {/* Achievement grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${achievement.bgColor} group-hover:scale-110 transition-transform`}>
                          <IconComponent className={`h-5 w-5 ${achievement.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 text-sm">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                Start Your Wikipedia Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Wikipedia stats section */}
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-2">Wikipedia by the Numbers</h3>
            <p className="text-muted-foreground">The scale and impact of the world's largest encyclopedia</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-card-foreground mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Updated in real-time • Free for everyone • Powered by volunteers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WikipediaShowcase;
