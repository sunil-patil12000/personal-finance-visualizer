'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Personal Finance Visualizer
        </Link>
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className={`${isActive('/') ? 'text-blue-300' : 'text-white'} hover:text-blue-300`}
          >
            Dashboard
          </Link>
          <Link 
            href="/transactions" 
            className={`${isActive('/transactions') ? 'text-blue-300' : 'text-white'} hover:text-blue-300`}
          >
            Transactions
          </Link>
          <Link 
            href="/budgets" 
            className={`${isActive('/budgets') ? 'text-blue-300' : 'text-white'} hover:text-blue-300`}
          >
            Budgets
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 