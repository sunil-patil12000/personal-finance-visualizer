'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DirectFixPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);
  const [results, setResults] = useState(null);

  const checkDb = async () => {
    setLoading(true);
    setStatus('Checking database...');
    
    try {
      const response = await fetch('/api/fix-database');
      const data = await response.json();
      setDbInfo(data);
      setStatus(`Found ${data.count} transactions that need fixing.`);
      
      if (data.specificTransaction) {
        setStatus(prevStatus => `${prevStatus} Specific transaction "${data.specificTransaction.description}" has category: ${data.specificTransaction.category}.`);
      }
    } catch (error) {
      console.error('Error checking database:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixDb = async () => {
    setLoading(true);
    setStatus('Fixing transactions...');
    
    try {
      const response = await fetch('/api/fix-database', {
        method: 'POST'
      });
      const data = await response.json();
      setResults(data);
      
      if (data.success) {
        setStatus(`Success: ${data.message}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
      
      // Re-check after fixing
      checkDb();
    } catch (error) {
      console.error('Error fixing database:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white mt-10 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Direct Database Fix</h1>
      
      <div className="flex flex-col gap-4">
        <button 
          onClick={checkDb}
          disabled={loading}
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          Check Database
        </button>
        
        <button 
          onClick={fixDb}
          disabled={loading || (dbInfo && dbInfo.count === 0)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Fix All Transactions
        </button>
      </div>
      
      {status && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded">
          <p className="text-blue-800">{status}</p>
        </div>
      )}
      
      {results && results.updates && results.updates.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Fixed Transactions:</h2>
          <ul className="space-y-2">
            {results.updates.map(update => (
              <li key={update.id} className="p-3 bg-green-50 border border-green-100 rounded">
                <p><span className="font-semibold">Description:</span> {update.description}</p>
                <p><span className="font-semibold">New Category:</span> {update.newCategory}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-8 pt-4 border-t">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 