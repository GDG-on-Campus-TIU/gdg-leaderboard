import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Search from "./pages/search";
import AllTransactions from "./pages/all-transactions";
import { ThemeProvider } from "./components/theme";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/all" element={<AllTransactions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
