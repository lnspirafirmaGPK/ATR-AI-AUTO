import React from 'react';
import { Card, CardContent } from '../components/common/Card';

export default function DTCScanner() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">DTC Scanner</h1>
      <Card>
        <CardContent className="h-64 flex items-center justify-center text-gray-400">
          No Trouble Codes Found
        </CardContent>
      </Card>
    </div>
  );
}
