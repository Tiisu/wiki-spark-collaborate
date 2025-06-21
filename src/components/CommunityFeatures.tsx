
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Zap, Globe, ArrowRight, Heart } from 'lucide-react';

const CommunityFeatures = () => {
  const features = [
    {
      title: "Article Improvement Drives",
      description: "Join coordinated efforts to enhance specific Wikipedia articles with fellow contributors.",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      stats: "50+ active drives"
    },
    {
      title: "Mentorship Program",
      description: "Get paired with experienced Wikipedia editors for personalized guidance and support.",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      stats: "200+ mentors"
    },
    {
      title: "Translation Sprints",
      description: "Help bridge language gaps by participating in collaborative translation initiatives.",
      icon: Globe,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      stats: "30+ languages"
    },
    {
      title: "Community Forums",
      description: "Engage in discussions, ask questions, and share knowledge with the global community.",
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      stats: "10k+ members"
    }
  ];

  return (
    <section id="community" className="py-20 px-4 bg-muted/40">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Thrive in Our Community</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect, collaborate, and grow with thousands of passionate Wikipedia contributors from around the world.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-sm font-semibold ${feature.color} flex items-center justify-center space-x-1`}>
                    <Heart className="h-3 w-3" />
                    <span>{feature.stats}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center">
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8">
              Join the Community <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityFeatures;
