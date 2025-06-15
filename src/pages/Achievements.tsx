import React from 'react';
import { AchievementGallery } from '@/components/achievements/AchievementGallery';

const Achievements: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Achievements
        </h1>
        <p className="text-gray-600">
          Track your Wikipedia learning progress and unlock badges as you master new skills.
        </p>
      </div>
      
      <AchievementGallery />
    </div>
  );
};

export default Achievements;
