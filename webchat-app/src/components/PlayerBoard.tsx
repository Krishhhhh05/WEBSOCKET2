"use client";
import { useState, useEffect } from "react";
import WinnerModal from "@/components/WinnerModal";
import { motion, AnimatePresence } from "framer-motion";

const GameBoard = ({ socket }: { socket: WebSocket | null }) => {
  const [joker, setJoker] = useState<string | null>(null);
  const [andar, setAndar] = useState<string[]>([]);
  const [bahar, setBahar] = useState<string[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [andarPercentage, setAndarPercentage] = useState(50);
  const [baharPercentage, setBaharPercentage] = useState(50);
  const [minBet, setMinBet] = useState(100);
  const [maxBet, setMaxBet] = useState(10000);
  const [gameOver, setGameOver] = useState(false); // Track if game has ended


  useEffect(() => {
    if (!socket) return;
  
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
  
      // Handle joker setting
      if (data.action === "set_joker") {
        setJoker(data.joker);
      }
  
      // Handle game updates
      else if (data.action === "update_game" && !gameOver) {
        console.log("gameOver:", gameOver);
  
        setJoker(data.joker);
        setAndar(data.andar);
        setBahar(data.bahar);
  
        // Calculate the correct section based on total cards
       
      }
  
      // Handle game won action
      else if (data.action === "game_won" && !gameOver) {
        setWinner(data.winner);
        setGameOver(true); // Mark game as over
        console.log("Game Over, Winner:", data.winner);
  
        setShowWinnerModal(true);
  
        // Auto-hide the modal after 5 seconds
        setTimeout(() => {
          setShowWinnerModal(false);
          
        }, 5000);
      }
  
      // Handle reset game action
      else if (data.action === "reset_game") {
        setJoker(null);
        setAndar([]);
        setBahar([]);
        
        setGameOver(false); // Reset game state
        setShowWinnerModal(false); // Hide winner modal
      
      }
  
      // Handle player updates
      else if (data.action === "update_players") {
        console.log(data.players, "players");
      }
  
      // Handle bets changed event
      else if (data.action === "bets_changed") {
        console.log("Bet Changed in player board", data);
        setMinBet(data.minBet);
        setMaxBet(data.maxBet);
      }
    };
  
    socket.addEventListener("message", handleMessage);
  
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, gameOver]); // Add gameOver to dependencies to properly re-run effect when gameOver changes
  
  // Separate effect to fetch win statistics
  useEffect(() => {
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
  }, []); // Only run once on component mount
  
  

return (
  <div className="flex flex-col items-center bg-[#8F1504] h-screen w-full border-8 border-yellow-600">

    <WinnerModal show={showWinnerModal} onClose={() => setShowWinnerModal(false)} winner={winner} />

    <div className=" grid grid-cols-1 gap-4 h-full w-full bg-[#8F1504] border-2 border-yellow-600 ">
      <div className=" flex  items-center justify-center   ">
        <div className="text-white ml-2 font-ramaraja text-2xl font-bold">
          JOKER
        </div>
        <div className="w-60 border-dashed ml-5 border-2 border-yellow-600 bg-[#450A0366] rounded-lg flex justify-center items-center">
          <div className="flex justify-center items-center h-52">
            {joker ? (
              <img src={`/cards/${joker}.png`} alt={joker} className="w-36 my-2" />
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
        <div className=" relative border-dashed border-2 border-yellow-600 rounded-lg w-full h-[20vh] bg-[#450A0366] flex items-center justify-left">
          {/* {andar.map((card, index) => (
                            <img key={index} src={`/cards/${card}.png`} alt={card} className="w-36 flex justify-center absolute align-middle" style={{ left: `${index * 25}px`, zIndex: index }} />
                        ))} */}
          {andar.map((card, index) => {
            const batchIndex = Math.floor(index / 10);
            const positionInBatch = index % 10;
            const isTenthCard = (index + 1) % 10 === 0;
            const isCurrentBatch = batchIndex === Math.floor((andar.length - 1) / 10);

            // Only render cards from the current batch
            if (!isCurrentBatch) return null;

            // For the 10th card (when it exists)
            if (isTenthCard) {
              return (
                <AnimatePresence key={`card-${index}`}>
                  <motion.img
                    key={`motion-${index}`}
                    src={`/cards/${card}.png`}
                    alt={card}
                    className="w-36 flex justify-center absolute align-middle"
                    style={{
                      zIndex: 10, // Always on top
                    }}
                    initial={{ x: 225 /* Starting position to the right */ }}
                    animate={{ x: 0 /* Final position at left */ }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              );
            }

            // For cards 1-9 that get swept away
            return (
              <AnimatePresence key={`card-${index}`}>
                <motion.img
                  key={`motion-${index}`}
                  src={`/cards/${card}.png`}
                  alt={card}
                  className="w-36 flex justify-center absolute align-middle"
                  style={{
                    left: `${positionInBatch * 25}px`,
                    zIndex: positionInBatch,
                  }}
                  // When the 10th card exists, animate these cards out in sequence
                  animate={
                    andar.length % 10 === 0 && andar.length >= 10 ?
                      {
                        opacity: 0,
                        x: -100 // Move left as they disappear
                      } :
                      { opacity: 1 }
                  }
                  transition={{
                    // Stagger the disappearing effect based on position
                    duration: 0.3,
                    delay: andar.length % 10 === 0 ? (9 - positionInBatch) * 0.05 : 0
                    // Cards closer to the right disappear first (10th card comes from right)
                  }}
                />
              </AnimatePresence>
            );
          })}
        </div>
      </div>

      <div className="col-span-2 row-span-1 flex relative justify-center p-4">
        <div className="text-white font-ramaraja text-3xl mt-10 font-bold mr-4">
          B
        </div>
        <div className="relative border-dashed border-2 border-yellow-600 rounded-lg w-full h-[20vh] bg-[#450A0366] flex items-center justify-left">
          {/* {bahar.map((card, index) => (
                            <img key={index} src={`/cards/${card}.png`} alt={card} className="w-36 flex justify-center absolute align-middle" style={{ left: `${index * 25}px`, zIndex: index }}/>
                        ))} */}
          {bahar.map((card, index) => {
            const batchIndex = Math.floor(index / 10);
            const positionInBatch = index % 10;
            const isTenthCard = (index + 1) % 10 === 0;
            const isCurrentBatch = batchIndex === Math.floor((bahar.length - 1) / 10);

            // Only render cards from the current batch
            if (!isCurrentBatch) return null;

            // For the 10th card (when it exists)
            if (isTenthCard) {
              return (
                <AnimatePresence key={`card-${index}`}>
                  <motion.img
                    key={`motion-${index}`}
                    src={`/cards/${card}.png`}
                    alt={card}
                    className="w-36 flex justify-center absolute align-middle"
                    style={{
                      zIndex: 10, // Always on top
                    }}
                    initial={{ x: 225 /* Starting position to the right */ }}
                    animate={{ x: 0 /* Final position at left */ }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              );
            }

            // For cards 1-9 that get swept away
            return (
              <AnimatePresence key={`card-${index}`}>
                <motion.img
                  key={`motion-${index}`}
                  src={`/cards/${card}.png`}
                  alt={card}
                  className="w-36 flex justify-center absolute align-middle"
                  style={{
                    left: `${positionInBatch * 25}px`,
                    zIndex: positionInBatch,
                  }}
                  // When the 10th card exists, animate these cards out in sequence
                  animate={
                    bahar.length % 10 === 0 && bahar.length >= 10 ?
                      {
                        opacity: 0,
                        x: -100 // Move left as they disappear
                      } :
                      { opacity: 1 }
                  }
                  transition={{
                    // Stagger the disappearing effect based on position
                    duration: 0.3,
                    delay: bahar.length % 10 === 0 ? (9 - positionInBatch) * 0.05 : 0
                    // Cards closer to the right disappear first (10th card comes from right)
                  }}
                />
              </AnimatePresence>
            );
          })}
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
            <p className="text-xl font-ramaraja">MAX: {maxBet}</p>
            <p className="text-xl font-ramaraja">MIN: {minBet}</p>
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
            <img src="/assets/blue_a.svg" alt="Andar Wins" className="w-full h-full" />
          </div>

          {/* Progress Bar */}
          <div className="flex-1 h-8 relative">
            <div className="absolute inset-0 flex">
              <div
                className="h-full bg-blue-600 rounded-l-full"
                style={{ width: `${andarPercentage}%` }}
              >
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white font-bold">
                  {andarPercentage}%

                </span>
              </div>
              <div
                className="h-full bg-red-600 rounded-r-full"
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
            <img src="/assets/red_b.svg" alt="Bahar" className="w-full h-full" />
          </div>
        </div>

      </div>

      {/* Andar/Bahar Buttons */}
      <div className="p-4 shadow-lg text-left relative border-2 border-yellow-400">
        <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-6 h-6" />
        <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-6 h-6" />
        <div className="flex justify-around items-center">
          <div className="flex flex-col items-center">
            <img src="/assets/blue_a.svg" alt="Andar Wins" className="w-10 h-10" />
            <span className="text-xl text-yellow-400 font-bold font-ramaraja ">Andar</span>
          </div>

          <div className="flex flex-col items-center">
            <img src="/assets/red_b.svg" alt="Bahar Wins" className="w-10 h-10" />
            <span className="text-xl text-yellow-400 font-bold font-ramaraja">Bahar</span>
          </div>

        </div>
      </div>
    </div>
  </div>
);
};

export default GameBoard;