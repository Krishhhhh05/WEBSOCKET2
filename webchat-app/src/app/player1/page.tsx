"use client";
import { useState, useEffect } from "react";
import PlayerBoard from  "@/components/PlayerBoard";

const Player1Page = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [player1Active, setPlayer1Active] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://169.254.192.244:6789");
    
  
    ws.onopen = () => {
      console.log(" ✅ WebSocket opened for Player 1");
    };
  
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
  
      if (data.action === "update_players") {
        setPlayer1Active(data.players.player1);
      }
    };
  
    ws.addEventListener("message", handleMessage);
  
    // Set WebSocket after setting up listeners
    setSocket(ws);
  
    return () => {
      ws.removeEventListener("message", handleMessage);
      // ws.close();
    };
  }, []);
  

  return (
    <div>
      {/* <div className="flex font-bold items-center text-3xl justify-center w-full shadow-lg border-2  bg-black  text-white border-yellow-600">
        Player 1 {player1Active ? "✅ Active" : "❌ Inactive"}
      </div> */}
      {player1Active ? (
        <PlayerBoard socket={socket} />
      ) : (
        <div className="flex justify-center items-center h-screen">
          <video autoPlay loop muted className="w-full h-full object-cover">
            <source src="/assets/ocean7vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default Player1Page;
