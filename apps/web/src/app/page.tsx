'use client';

import { useEffect, useState } from 'react';
import { ParentService } from '../services/ParentService';
import { ChildService } from '../services/ChildService';
import Onboarding from '../components/onboarding/Onboarding';
import Dashboard from '../components/dashboard/Dashboard';

export default function Home() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);

  useEffect(() => {
    checkParentStatus();
  }, []);

  async function checkParentStatus() {
    const firstTime = await ParentService.isFirstTime();
    setIsFirstTime(firstTime);

    if (!firstTime) {
      const name = await ParentService.getParentName();
      setParentName(name);
    }
  }

  const handleOnboardingComplete = async () => {
    await checkParentStatus();
  };

  // Loading state
  if (isFirstTime === null) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // First-time user: show onboarding
  if (isFirstTime) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Returning user: show dashboard
  return <Dashboard parentName={parentName} />;
}
