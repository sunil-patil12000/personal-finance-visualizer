'use client';

import { format } from 'date-fns';
import { ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="col-span-full mt-4">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>You haven't recorded any transactions yet.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              Add Transaction
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="col-span-full mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your most recent 5 transactions</CardDescription>
        </div>
        <Link href="/transactions">
          <Button variant="outline" size="sm" className="gap-1">
            <span>View All</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell className="font-medium">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="max-w-32 truncate">{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 