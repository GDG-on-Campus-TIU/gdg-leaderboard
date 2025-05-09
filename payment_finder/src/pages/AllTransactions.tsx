import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentResult } from "./Search";

function AllTransactions() {
  const apiUrl =
    "https://gdg-leaderboard-1011506502548.asia-south1.run.app/api/v1/payment/all";
  // const apiUrl = "http://localhost:8998/api/v1";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<PaymentResult[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(apiUrl, {
        params: {
          t: pageSize,
          c: page * pageSize,
        },
      });

      const data = res.data.data || [];
      setTransactions(prev => [...prev, ...data]);
      setHasMore(data.length === pageSize);
    } catch (err) {
      let msg = "Error fetching transactions";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === "string") {
          msg = data;
        } else if (typeof data === "object" && data && "message" in data) {
          msg = (data as { message: string }).message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <main className="flex flex-col justify-start items-center gap-6 bg-gray-50 p-4 sm:p-8 min-h-screen">
      <div className="flex justify-between items-center w-full max-w-5xl">
        <h1 className="mb-2 font-semibold text-3xl sm:text-4xl">
          All Transactions
        </h1>
        <Link to="/">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 mb-2 px-4 py-2 rounded w-full max-w-5xl text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg w-full max-w-5xl overflow-hidden">
        <Table>
          <TableCaption>A list of all transactions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Special Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.orderId}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>{transaction.email}</TableCell>
                <TableCell>{transaction.phone}</TableCell>
                <TableCell>{transaction.specialName ?? "NA"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">₹{transaction.amount}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={transaction.confirmationSS}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View SS
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>Total Amount</TableCell>
              <TableCell className="text-right">₹{totalAmount.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {hasMore && (
        <Button
          onClick={loadMore}
          disabled={loading}
          className="mt-4"
        >
          {loading ? (
            <span className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
          ) : null}
          Load More Transactions
        </Button>
      )}
    </main>
  );
}

export default AllTransactions;
