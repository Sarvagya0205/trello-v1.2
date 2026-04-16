import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BoardProvider } from "./context/BoardContext";
import BoardsPage from "./pages/BoardsPage";
import BoardPage from "./pages/BoardPage";

function App() {
  return (
    <BrowserRouter>
      <BoardProvider>
        <Routes>
          <Route path="/" element={<BoardsPage />} />
          <Route path="/board/:id" element={<BoardPage />} />
        </Routes>
      </BoardProvider>
    </BrowserRouter>
  );
}

export default App;
