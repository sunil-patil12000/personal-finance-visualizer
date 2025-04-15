'use client';

import { useState } from 'react';

export default function FixTransaction() {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId) {
      setError('Please enter a transaction ID');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Fixing transaction...');

    try {
      const response = await fetch('/api/transactions/fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: transactionId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix transaction');
      }

      setResult(data);
      setStatus(data.message);
    } catch (error) {
      console.error('Error fixing transaction:', error);
      setError(error.message || 'An error occurred while fixing the transaction');
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAll = async () => {
    setLoading(true);
    setError('');
    setStatus('Checking for transactions to fix...');

    try {
      const response = await fetch('/api/transactions/fix');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check transactions');
      }

      setStatus(data.message);
    } catch (error) {
      console.error('Error checking transactions:', error);
      setError(error.message || 'An error occurred while checking transactions');
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFixAll = async () => {
    setLoading(true);
    setError('');
    setStatus('Fixing all transactions with missing categories...');

    try {
      const response = await fetch('/api/transactions/fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix transactions');
      }

      setResult(data);
      setStatus(data.message);
    } catch (error) {
      console.error('Error fixing transactions:', error);
      setError(error.message || 'An error occurred while fixing transactions');
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Fix Transaction Categories</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Fix Specific Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transactionId" className="block text-gray-700 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter transaction ID"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Fix Transaction'}
          </button>
        </form>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Fix All Transactions</h2>
        <div className="flex gap-4">
          <button
            onClick={handleCheckAll}
            disabled={loading}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Check Missing Categories
          </button>
          <button
            onClick={handleFixAll}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Fix All Transactions
          </button>
        </div>
      </div>
      
      {status && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">{status}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {result && result.updates && result.updates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Update Results:</h3>
          <div className="border rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Old Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.updates.map((update) => (
                  <tr key={update.id}>
                    <td className="px-4 py-2 text-sm text-gray-500">{update.id}</td>
                    <td className="px-4 py-2">{update.description}</td>
                    <td className="px-4 py-2">{update.oldCategory}</td>
                    <td className="px-4 py-2 font-medium text-green-600">{update.newCategory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 