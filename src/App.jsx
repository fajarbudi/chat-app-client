import { Routes, Route } from "react-router-dom";
import Chat from "./pages/chat";
import Home from "./pages/home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:id" element={<Chat />} />
    </Routes>
  );
}

export default App;
