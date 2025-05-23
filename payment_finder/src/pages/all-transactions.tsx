import { useEffect, useState } from "react";
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
import { PaymentResult } from "./search";

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
      setTransactions((prev) => [...prev, ...data]);
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
    setPage((prevPage) => prevPage + 1);
  };

  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

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

      <div className="bg-white shadow-md rounded-lg w-full overflow-hidden">
        <Table>
          <TableCaption className="mb-4">All Transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Special Name</TableHead>
              <TableHead>Items</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.orderId}
                </TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>{transaction.email}</TableCell>
                <TableCell>{transaction.phone}</TableCell>
                <TableCell>{transaction.specialName}</TableCell>
                <TableCell colSpan={10}>
                  {transaction.items.map((item) => {
                    const itemParts = item.split(":");
                    const itemName = itemParts[0];
                    const itemSize = itemParts[1];
                    const itemCount = itemParts[2];

                    // Check if it contains "Custom Name" or similar patterns
                    const hasCustomName =
                      itemName.toLowerCase().includes("custom name") ||
                      (itemName.toLowerCase().includes("with") &&
                        itemName.toLowerCase().includes("name"));

                    return (
                      <p
                        className={`${
                          hasCustomName
                            ? "text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded border-l-2 border-yellow-400"
                            : ""
                        }`}
                        key={item}
                      >
                        {`${itemName} (${itemCount}pcs) - ${itemSize}`}
                      </p>
                    );
                  })}
                </TableCell>
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
                <TableCell className="text-right">
                  ₹{transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={17}>Total Amount</TableCell>
              <TableCell className="text-right">
                ₹{totalAmount.toFixed(2)}
              </TableCell>
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
          {loading
            ? (
              <span className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin">
              </span>
            )
            : null}
          Load More Transactions
        </Button>
      )}
    </main>
  );
}

export default AllTransactions;
