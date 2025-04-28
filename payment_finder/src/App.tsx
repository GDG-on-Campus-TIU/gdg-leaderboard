import { ArrowDown, LucideSearch } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { useState, FormEvent } from "react";
import axios from "axios";

const QUERY_TYPES = [
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Upi Id", value: "upiId" },
  { label: "Order Id", value: "orderId" },
  { label: "Phone", value: "phone" },
];

type PaymentResult = {
  id: string;
  orderId: string;
  name: string;
  email: string;
  upiId: string;
  phone: string;
  confirmationSS: string;
  items: string[];
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  specialName: string;
};

function App() {
  const apiUrl =
    "https://gdg-leaderboard-server-1019775793519.us-central1.run.app/api/v1";
  // const apiUrl = "http://localhost:8998/api/v1";

  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState("");
  const [type, setType] = useState("name");
  const [error, setError] = useState("");
  const [results, setResults] = useState<PaymentResult[]>([]);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedLabel =
    QUERY_TYPES.find((t) => t.value === type)?.label ?? "Type";

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setSuccess(false);

    try {
      const res = await axios.get(`${apiUrl}/payment/find`, {
        params: {
          [type]: formValue,
        },
      });
      setResults(res.data.data || []);
      setSuccess(true);
    } catch (err) {
      let msg = "Error fetching payment";
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

  return (
    <main className="flex flex-col justify-start items-center gap-6 bg-gray-50 sm:p-8 md:p-16 px-2 py-6 min-h-screen">
      <h1 className="mb-2 w-full font-semibold text-3xl sm:text-4xl text-center">
        Payment Finder
      </h1>
      <form
        onSubmit={submitHandler}
        className="flex sm:flex-row flex-col items-stretch sm:items-center gap-2 bg-white shadow p-4 rounded-lg w-full max-w-lg"
      >
        <Input
          type="text"
          placeholder={`Enter ${selectedLabel.toLowerCase()}`}
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          className="flex-1 min-w-0"
        />
        <DropdownMenu onOpenChange={setOpen} open={open}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full sm:w-auto min-w-[110px] select-none"
            >
              <ArrowDown
                className={
                  open ? "rotate-180 transition-all" : "transition-all"
                }
              />
              {selectedLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {QUERY_TYPES.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onSelect={() => setType(item.value)}
                className={
                  type === item.value ? "font-semibold bg-gray-100" : ""
                }
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="submit"
          variant={"default"}
          disabled={loading || !formValue.trim()}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <span className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
          ) : (
            <LucideSearch className="mr-2" />
          )}
          Search
        </Button>
      </form>
      <div className="flex flex-col justify-center items-center mt-8 px-1 w-full max-w-lg">
        <h2 className="mb-2 w-full font-semibold text-xl sm:text-2xl text-center">
          Results
        </h2>
        {error && (
          <div className="bg-red-100 mb-2 px-4 py-2 rounded w-full text-red-700 text-sm text-center">
            {error}
          </div>
        )}
        {success && results.length === 0 && !loading && (
          <div className="bg-yellow-100 mb-2 px-4 py-2 rounded w-full text-yellow-700 text-sm text-center">
            No results found.
          </div>
        )}
        <div className="flex flex-col space-y-2 w-full">
          {results.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md p-4 border border-gray-200 rounded-md w-full"
            >
              <div className="flex sm:flex-row flex-col flex-wrap gap-x-4 gap-y-1">
                <div>
                  <span className="font-semibold">Name:</span> {item.name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {item.email}
                </div>
                <div>
                  <span className="font-semibold">UPI ID:</span> {item.upiId}
                </div>
                <div>
                  <span className="font-semibold">Order ID:</span>{" "}
                  {item.orderId}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {item.phone}
                </div>
                <div>
                  <span className="font-semibold">Amount:</span> ₹{item.amount}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> {item.status}
                </div>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Confirmation SS:</span>{" "}
                <a
                  href={item.confirmationSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  View
                </a>
              </div>
              <div className="mt-1">
                <span className="font-semibold">Items:</span>{" "}
                {item.items.join(", ")}
              </div>
              <div className="mt-1 text-gray-400 text-xs">
                Created: {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
