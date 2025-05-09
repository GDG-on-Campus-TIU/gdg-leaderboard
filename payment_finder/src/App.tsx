import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Search from "./pages/Search";
import AllTransactions from "./pages/AllTransactions";
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
