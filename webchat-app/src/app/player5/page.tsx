"use client";
import { useState, useEffect } from "react";
import PlayerBoard from  "@/components/PlayerBoard";

const Player5Page = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [player5Active, setPlayer5Active] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:6789");
    console.log(" Connected for Player 5");

    ws.onopen = () => {
      console.log(" ✅ WebSocket opened for Player 5");
    };

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);

      if (data.action === "update_players") {
        setPlayer5Active(data.players.player5);
        console.log("Updated player5 state");
      }
    };

    ws.addEventListener("message", handleMessage); // Use addEventListener instead of overriding `onmessage`
    
    setSocket(ws);

    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    };
  }, []);

  return (
    <div>
      {/* <div className="flex font-bold items-center text-3xl justify-center w-full shadow-lg border-2 border-yellow-600">
        Player 5 {player5Active ? "✅ Active" : "❌ Inactive"}
      </div> */}
      {player5Active ? (
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

export default Player5Page;
