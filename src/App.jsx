import { Routes, Route } from "react-router-dom";
import Chat from "./pages/chat";
import Home from "./pages/home";
import UserList from "./pages/UserList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:id" element={<Chat />} />
      <Route path="/userList" element={<UserList />} />
    </Routes>
  );
}

export default App;
