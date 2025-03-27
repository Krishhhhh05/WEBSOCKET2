"use client";
import { useState, useEffect } from "react";
import PlayerBoard from  "@/components/PlayerBoard";

const Player4Page = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [player4Active, setPlayer4Active] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://169.254.192.244:6789");
    console.log(" Connected for Player 4");

    ws.onopen = () => {
      console.log(" ✅ WebSocket opened for Player 4");
    };

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);

      if (data.action === "update_players") {
        setPlayer4Active(data.players.player4);
        console.log("Updated player4 state");
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
        Player 4 {player4Active ? "✅ Active" : "❌ Inactive"}
      </div> */}
      {player4Active ? (
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

export default Player4Page;
