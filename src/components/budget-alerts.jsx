'use client';

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetAlerts({ overBudgetCategories }) {
  if (!overBudgetCategories || overBudgetCategories.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-full border-red-100 bg-red-50 text-red-900">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <CardTitle className="text-red-700">Budget Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {overBudgetCategories.map((item) => (
            <li key={item.category} className="flex justify-between">
              <span className="font-medium">{item.category}</span>
              <span>
                Over by ₹{(item.actual - item.budget).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="/budgets" className="w-full">
          <Button variant="outline" className="w-full border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800">
            Adjust Budgets
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 