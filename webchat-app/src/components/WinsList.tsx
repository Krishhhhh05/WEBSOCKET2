"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import WinsBoards from "./WinsBoards";
type WinRecord = {
  _id?: string;
  winner: number; // 0 for Andar (A), 1 for Bahar (B)
  timestamp?: string;
};

const WinsList = () => {
  const [wins, setWins] = useState<WinRecord[]>([]);
  const [groupedWins, setGroupedWins] = useState<WinRecord[][]>([]);
  const [loading, setLoading] = useState(true);
  const [joker, setJoker] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);


  useEffect(() => {
    const fetchWins = async () => {
      try {
        const res = await fetch("/api/get-wins");
        const data = await res.json();
        console.log("data from api: ", data);
        setWins(data);
    

      } catch (error) {
        console.error("Error fetching wins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWins();

    // WebSocket Connection
    const ws = new WebSocket("ws://169.254.192.244:6789");
    setSocket(ws);


    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received in grid :", message);

      if (message.action === "game_won") {
        const newWin: WinRecord = {
          winner: message.winner,
          timestamp: new Date().toISOString(),
        };
       

        setWins((prevWins) => {
          const newWins = [newWin, ...prevWins];

          setGroupedWins((prevGrouped) => {
            let updatedGrouped = [...prevGrouped];

            // If last column matches the winner, append it there
            if (
              updatedGrouped.length > 0 &&
              updatedGrouped[updatedGrouped.length - 1][0].winner === newWin.winner
            ) {
              updatedGrouped[updatedGrouped.length - 1].push(newWin);
            } else {
              // Otherwise, create a new column
              updatedGrouped.push([newWin]);
            }

            // Ensure we only keep the latest 10 columns
            if (updatedGrouped.length > 10) {
              updatedGrouped = updatedGrouped.slice(-10);
            }

            return updatedGrouped;
          });


          return newWins;
                

        });
        setTimeout(() => {
          window.location.reload();
       }, 3000);
      }
      else if (message.action === "set_joker") {
       console.log("joker here");
       setJoker(message.joker);
      }
      else if (message.action==="reset_game"){
        setJoker(null);
        window.location.reload();

      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    let newGroupedWins: WinRecord[][] = [];
    let columnIndex = 0;

    wins.forEach((win, index) => {
      if (index === 0 || win.winner === wins[index - 1].winner) {
        if (!newGroupedWins[columnIndex]) newGroupedWins[columnIndex] = [];
        newGroupedWins[columnIndex].push(win);
      } else {
        columnIndex++;
        newGroupedWins[columnIndex] = [win];
      }
    });

    if (newGroupedWins.length > 10) {
      newGroupedWins = newGroupedWins.slice(-10);
    }

    setGroupedWins(newGroupedWins);
  }, [wins]);
  const andarWins = wins.filter((win) => win.winner === 0).length;
  console.log("Andar Wins:", andarWins);
  const baharWins = wins.filter((win) => win.winner === 1).length;
  console.log("Bahar Wins:", baharWins);
  const totalWins = andarWins + baharWins;
  const andarPercentage = totalWins ? Math.round((andarWins / totalWins) * 100 ): 50;
  const baharPercentage = totalWins ? Math.round((baharWins / totalWins) * 100): 50;

  return (
    <div className="relative flex flex-col h-screen border border-gray-300 rounded-lg shadow-md bg-red-900 text-white">
    {joker ? <WinsBoards socket={socket} joker={joker}/> :
    <>
      <Header />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="bg-contain bg-no-repeat bg-center opacity-50 animate-glow w-1/2 h-1/2"
          style={{ backgroundImage: `url(/assets/ocean7.png)` }}
        ></div>
      </div>

      {/* Grid for Wins */}
      <div className="flex-grow grid grid-cols-10 gap-2 p-2 border border-yellow-400 rounded-md bg-red-800">
        {groupedWins.map((group, colIndex) => (
          <div key={colIndex} className="flex flex-col items-center">
            {group.map((win, rowIndex) => (
              <div key={rowIndex} className="h-24 flex items-center justify-center">
                <img
                  src={win.winner === 0 ? "/assets/a.png" : "/assets/b.png"}
                  alt={win.winner === 0 ? "Andar Wins" : "Bahar Wins"}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        ))}
      </div>


     
      <div className="grid grid-cols-4 bg-wood-pattern">
        {/* Bets Section */}
        <div className="font-ramaraja p-4 shadow-lg text-left relative border-2 border-yellow-400">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-8 h-8" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-8 h-8" />
          <div className="text-[#f3be39] text-center font-semibold">
            <p className="text-4xl font-bold font-ramaraja">BETS</p>
            <div className="flex-col items-start justify-start text-3xl">
              <p className="text-3xl font-ramaraja">MAX: 100</p>
              <p className="text-3xl font-ramaraja">MIN: 10000</p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="p-4 col-span-2 shadow-lg text-left relative border-2 border-yellow-400">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-8 h-8" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-8 h-8" />

          {/* Title */}
          <h2 className="text-yellow-400 text-4xl font-ramaraja font-bold text-center mb-4">STATISTICS</h2>

          {/* Progress Bar Container */}
          <div className="flex items-center justify-between gap-2">
            {/* Andar Circle */}
            <div className="w-16 h-16">
              <img src="/assets/a.png" alt="Andar Wins" className="w-full h-full" />
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-8 relative">
              <div className="absolute inset-0 flex">
                <div
                  className="h-full bg-red-600 rounded-l-full"
                  style={{ width: `${andarPercentage}%` }}
                >
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white font-bold">
                    {andarPercentage}%
                  </span>
                </div>
                <div
                  className="h-full bg-blue-600 rounded-r-full"
                  style={{ width: `${baharPercentage}%` }}
                >
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white font-bold">
                    {baharPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Bahar Circle */}
            <div className="w-16 h-16">
              <img src="/assets/b.png" alt="Bahar" className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Andar/Bahar Buttons */}
        <div className="p-4 shadow-lg text-left relative border-2 border-yellow-400">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-8 h-8" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-8 h-8" />
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center">
              <img src="/assets/a.png" alt="Andar Wins" className="w-20 h-20" />
              <span className="text-2xl text-yellow-400 font-bold font-ramaraja">Andar</span>
            </div>

            <div className="flex flex-col items-center">
              <img src="/assets/b.png" alt="Bahar Wins" className="w-20 h-20" />
              <span className="text-2xl text-yellow-400 font-bold font-ramaraja">Bahar</span>
            </div>
          </div>
        </div>
      </div>
      </>
}
    </div>
  );
};

export default WinsList;