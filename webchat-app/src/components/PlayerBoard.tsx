"use client";
import { useState, useEffect } from "react";
import WinnerModal from "@/components/WinnerModal";
const GameBoard = ({ socket }: { socket: WebSocket | null }) => {
    const [joker, setJoker] = useState<string | null>(null);
    const [andar, setAndar] = useState<string[]>([]);
    const [bahar, setBahar] = useState<string[]>([]);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [winner, setWinner] = useState<number | null>(null);
    const [andarPercentage, setAndarPercentage] = useState(50);
    const [baharPercentage, setBaharPercentage] = useState(50);
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log("Received:", data);

            if (data.action === "set_joker") {
                setJoker(data.joker);
            } else if (data.action === "update_game") {
                setJoker(data.joker);
                setAndar(data.andar);
                setBahar(data.bahar);
            } else if (data.action === "reset_game") {
                setJoker(null);
                setAndar([]);
                setBahar([]);
                setShowWinnerModal(false); // Hide modal on reset
            } else if (data.action === "update_players") {
                console.log(data.players, "players");
            }
            else if (data.action === "game_won") {
                setWinner(data.winner);
                setShowWinnerModal(true);

                // Auto-hide the modal after 7 seconds
                setTimeout(() => {
                    setShowWinnerModal(false);
                }, 7000);
            }
        };

        socket.addEventListener("message", handleMessage);


        const fetchWins = async () => {
            try {
              const res = await fetch("/api/get-wins");
              const data = await res.json();
              console.log("data from api: ", data);
              if (data.length > 0) {
                const andarWins = data.filter((win: { winner: number }) => win.winner === 0).length;
                const baharWins = data.filter((win: { winner: number }) => win.winner === 1).length;
                const totalWins = andarWins + baharWins;
      
                const andarWinPercentage = ((andarWins / totalWins) * 100).toFixed(2);
                const baharWinPercentage = ((baharWins / totalWins) * 100).toFixed(2);
      
                setAndarPercentage(Number(andarWinPercentage));
                setBaharPercentage(Number(baharWinPercentage));
              }
            } catch (error) {
              console.error("Error fetching wins:", error);
            } 
          };
      
          fetchWins();
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);
    

    return (
        <div className="flex flex-col items-center bg-[#8F1504] h-screen w-full border-8 border-yellow-600">
            
            <WinnerModal show={showWinnerModal} onClose={() => setShowWinnerModal(false)} winner={winner !== null ? winner.toString() : null} />
            
            <div className=" grid grid-cols-1 gap-4 h-full w-full bg-[#8F1504] border-2 border-yellow-600 ">
            <div className=" flex  items-center justify-center   ">
                    <div className="text-white ml-2 font-ramaraja text-2xl font-bold">
                        JOKER
                    </div>
                    <div className="w-60 border-dashed ml-5 border-2 border-yellow-600 bg-[#450A0366] rounded-lg flex justify-center items-center">
                        <div className="flex justify-center items-center h-52">
                            {joker ? (
                                <img src={`/cards/${joker}.png`} alt={joker} className="w-20 my-2" />
                            ) : (
                                <img src="/assets/ocean7.png" alt="ocean7" className="w-24 h-24" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-span-2 row-span-1 flex relative justify-center p-4 ">
                    <div className="text-white font-ramaraja text-3xl mt-10 font-bold mr-4">
                        A
                    </div>
                    <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-[20vh] bg-[#450A0366] flex pl-32 items-center justify-left">
                        {andar.map((card, index) => (
                            <img key={index} src={`/cards/${card}.png`} alt={card} className="w-14" />
                        ))}
                    </div>
                </div>
                
                <div className="col-span-2 row-span-1 flex relative justify-center p-4">
                    <div className="text-white font-ramaraja text-3xl mt-10 font-bold mr-4">
                        B
                    </div>
                    <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-[20vh] bg-[#450A0366] flex items-center justify-left">
                        {bahar.map((card, index) => (
                            <img key={index} src={`/cards/${card}.png`} alt={card} className="w-36 flex justify-center align-middle" />
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 bg-wood-pattern w-full">
        {/* Bets Section */}
        <div className=" font-ramaraja p-4 shadow-lg text-left relative border-2 border-yellow-400">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-6 h-6" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-6 h-6" />
          <div className="text-[#f3be39] text-center font-semibold">
            <p className="text-2xl font-bold font-ramaraja">BETS</p>
            <div className="flex-col items-start justify-start text-2xl">
              <p className="text-xl font-ramaraja">MAX: 100</p>
              <p className="text-xl font-ramaraja">MIN: 10000</p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className=" p-4  col-span-2 shadow-lg text-left relative border-2 border-yellow-400">
        <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-6 h-6" />
        <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-6 h-6" />
          
          
      {/* Title */}
      <h2 className="text-yellow-400 text-2xl font-ramaraja font-bold text-center mb-4">STATISTICS</h2>
      
      {/* Progress Bar Container */}
      <div className="flex items-center justify-between gap-1">
        {/* Andar Circle */}
        <div className="w-8 h-8">
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
        <div className="w-8 h-8">
          <img src="/assets/b.png" alt="Bahar" className="w-full h-full" />
        </div>
      </div>
   
        </div>

        {/* Andar/Bahar Buttons */}
        <div className="p-4 shadow-lg text-left relative border-2 border-yellow-400">
        <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-6 h-6" />
        <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-6 h-6" />
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center">
              <img src="/assets/a.png" alt="Andar Wins" className="w-10 h-10" />
              <span className="text-xl text-yellow-400 font-bold font-ramaraja ">Andar</span>
            </div>
            
            <div className="flex flex-col items-center">
              <img src="/assets/b.png" alt="Bahar Wins" className="w-10 h-10" />
              <span className="text-xl text-yellow-400 font-bold font-ramaraja">Bahar</span>
            </div>
           
          </div>
        </div>
      </div>
        </div>
    );
};

export default GameBoard;