// src/pages/Subscription.jsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/common/Card';
import { useUser, USER_TIERS } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Subscription() {
  const { userTier, upgradeToPro, downgradeToFree } = useUser();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // In real app, trigger RevenueCat purchase flow here
    upgradeToPro();
    alert('Upgrade Successful! Welcome to Pro.');
    navigate('/');
  };

  const handleRestore = () => {
      // Mock restore
      alert('Purchases Restored.');
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-500">Unlock the full potential of your diagnostic tool.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={userTier === USER_TIERS.FREE ? 'border-blue-500 ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <CardTitle className="text-2xl">Free Tier</CardTitle>
            <CardDescription>Basic OBD2 Functionality</CardDescription>
            <div className="text-3xl font-bold mt-4">$0 <span className="text-sm font-normal text-gray-500">/ forever</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Standard OBD2 Data (RPM, Speed)</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Basic DTC Reader</li>
              <li className="flex items-center gap-2 text-gray-400"><X className="w-5 h-5" /> Toyota Mode 21 (Injectors)</li>
              <li className="flex items-center gap-2 text-gray-400"><X className="w-5 h-5" /> SCV Sticking Detection</li>
              <li className="flex items-center gap-2 text-gray-400"><X className="w-5 h-5" /> Piston Failure Alerts</li>
            </ul>
            {userTier === USER_TIERS.FREE ? (
              <Button disabled className="w-full">Current Plan</Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={downgradeToFree}>Downgrade</Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={userTier === USER_TIERS.PRO ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Pro Tier</CardTitle>
            <CardDescription>Deep Engineering Diagnostics</CardDescription>
            <div className="text-3xl font-bold mt-4">$19.99 <span className="text-sm font-normal text-gray-500">/ year</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Standard OBD2 Data</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Advanced DTC Scanner</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Toyota Mode 21 Deep Scan</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Real-time Injector Feedback</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Critical Engineering Alerts</li>
            </ul>
            {userTier === USER_TIERS.PRO ? (
              <Button disabled className="w-full">Active Plan</Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={handleSubscribe}>Upgrade Now</Button>
            )}
            <div className="mt-4 text-center">
                <button onClick={handleRestore} className="text-xs text-gray-500 underline">Restore Purchases</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
