
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, ArrowRight } from 'lucide-react';

const QuickStart = () => {
  const steps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up for WikiWalkthrough and set up your learning profile.",
      time: "2 min"
    },
    {
      step: 2,
      title: "Take the Assessment",
      description: "Complete a quick assessment to find your ideal starting point.",
      time: "5 min"
    },
    {
      step: 3,
      title: "Choose Your Path",
      description: "Select a learning path that matches your goals and experience level.",
      time: "1 min"
    },
    {
      step: 4,
      title: "Start Contributing",
      description: "Begin with your first module and make your first Wikipedia edit!",
      time: "15 min"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Get Started in Minutes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your journey to becoming a confident Wikipedia contributor starts with just four simple steps.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {steps.map((step, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                  {step.step}
                </div>
                <CardHeader className="pt-6">
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{step.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                <Play className="mr-2 h-5 w-5" />
                Start Your Journey Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStart;
