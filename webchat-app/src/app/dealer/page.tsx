"use client";
import { useState, useEffect } from "react";
import GameMenu from "@/components/GameMenu";
import GameBoard from "@/components/GameBoard";

const DealerPage = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // const ws = new WebSocket("ws://localhost:6789");
    const ws = new WebSocket("ws://localhost:6789");
    setSocket(ws);

    return () => ws.close();
  }, []);

  return (
    <div className="h-screen">
      <GameMenu socket={socket} />
      <GameBoard socket={socket} />
    </div>
  );
};

export default DealerPage;