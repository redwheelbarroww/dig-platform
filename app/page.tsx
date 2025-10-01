'use client';
import { useState } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function calculateYield() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/calculate-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      
      setResult(data);
    } catch (err) {
      setError('Failed to calculate yield');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          D!G Yield Calculator
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-sm font-medium mb-2">
            Property Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Main St, San Francisco"
            className="w-full border border-gray-300 rounded-md p-3 mb-4"
            onKeyPress={(e) => e.key === 'Enter' && calculateYield()}
          />
          
          <button 
            onClick={calculateYield}
            disabled={loading || !address}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Calculating...' : 'Calculate Yield'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h2 className="text-xl font-bold mb-3">Results</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {result.parcel.address}</p>
                <p><span className="font-medium">Lot Size:</span> {result.parcel.lot_size_sf.toLocaleString()} sq ft</p>
                <p><span className="font-medium">Zoning:</span> {result.parcel.zoning_code}</p>
                <p className="text-2xl font-bold text-green-700 mt-4">
                  Maximum Units: {result.maxUnits}
                </p>
                <div className="text-sm text-gray-600 mt-2">
                  <p>Base units: {result.calculation.baseUnits}</p>
                  <p>SB9 bonus: +{result.calculation.sb9Bonus}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Try searching for:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>123 Main St, San Francisco</li>
            <li>456 Oak Ave</li>
            <li>789 Pine St, Austin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
