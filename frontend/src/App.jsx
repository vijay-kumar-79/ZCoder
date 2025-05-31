import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import RoomSelection from "./pages/RoomSelection";
import RoomPage from "./pages/RoomPage";
import AskAIPage from "./pages/AskAIPage";
import Problem from "./pages/Problem";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/rooms" element={<RoomSelection/>} />
        <Route path="/rooms/:roomId" element={<RoomPage/>} />
        <Route path="/askAI" element={<AskAIPage/>} />
        <Route path="/problem/:id" element={<Problem/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;