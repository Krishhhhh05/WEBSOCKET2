"use client";
import { useState, useEffect } from "react";
import WinnerModal from "@/components/WinnerModal";
import { motion, AnimatePresence } from "framer-motion";

const GameBoard = ({ socket }: { socket: WebSocket | null }) => {
  const [joker, setJoker] = useState<string | null>(null);
  const [andar, setAndar] = useState<string[]>([]);
  const [bahar, setBahar] = useState<string[]>([]);
  const [cardInput, setCardInput] = useState("");
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [showResetButton, setShowResetButton] = useState(false);
  const [sectionId, setSectionId] = useState(1);
  const [gameOver, setGameOver] = useState(false); // Track if game has ended

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      if (data.action === "set_joker") {
        setJoker(data.joker);
      } else if (data.action === "update_game") {
        console.log("gameOver:",gameOver)
        if (gameOver) {
          // Prevent further updates and show invalid card pop-up
          console.log("Invalid card, reset first!!") // Display invalid message
          return;
      }
        setJoker(data.joker);
        setAndar(data.andar);
        setBahar(data.bahar);
       

        // Calculate the correct section based on total cards
        const totalCards = data.andar.length + data.bahar.length;
        setSectionId(totalCards % 2 === 0 ? 1 : 0);

      } else if (data.action === "reset_game") {
        setJoker(null);
        setAndar([]);
        setBahar([]);
        setSectionId(1);
        setGameOver(() => false); // Reset game state properly
        // setShowWinnerModal(false); // Hide modal on reset
      } else if (data.action === "update_players") {
        console.log(data.players, "players");
      }
      else if (data.action === "game_won" && !gameOver) {
        setWinner(data.winner);
        setGameOver(() => true);
        console.log("Game Over",gameOver); 
        console.log("Winner:", data.winner);
        setShowWinnerModal(true);

        // Auto-hide the modal after 5 seconds
        setTimeout(() => {
          setShowWinnerModal(false);
          // setShowResetButton(true);
        }, 5000);
      }
      else if (data.action === "game_won") {



        setShowWinnerModal(true);
        setWinner(data.winner);
        setTimeout(() => {

          setShowWinnerModal(false);
          resetGame();
        }, 5000);
        
        console.log({ action: "game_won", winner_section: data.winner });
    }
      
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket,gameOver]);
  const resetGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "reset_game" }));

      // setShowResetButton(false);
      setGameOver(false);
    }
  };

  const handleWinner = (winner: number) => {
    if (socket) {
      setWinner(winner);
      // setMenuOpen(false);
      setShowWinnerModal(true);
      setTimeout(() => {

        setShowWinnerModal(false);
      }, 5000);



      socket.send(JSON.stringify({ action: "game_won", winner: winner }));
      // setGamesCount(prev => prev + 1);

      console.log({ action: "game_won", winner: winner });
    }
  }
  // const noResetGame = () => {

  //   setShowResetButton(false);

  // };

  return (
    <div className="flex flex-col items-center   bg-[#8F1504]  w-full">
      <WinnerModal show={showWinnerModal} onClose={() => setShowWinnerModal(false)} winner={winner} />
      {/* {showResetButton && (
        <div className="flex z-50 items-center justify-center h-full w-full absolute">
          <div className="bg-white p-4 rounded-lg shadow-lg text-2xl font-bold text-black">
            <p>Are you sure you want to reset the game?</p>
            <div className="flex mt-4 justify-evenly">
              <button
                onClick={resetGame}
                className="bg-green-600 text-white px-6 py-3 rounded-lg text-xl font-bold"
              >
                YES
              </button>
              <button
                onClick={noResetGame}
                className="bg-red-600 text-white px-6 py-3 rounded-lg text-xl font-bold"
              >
                NO
              </button>
            </div>
          </div>

        </div>
      )} */}
      <div className=" grid grid-cols-3 grid-rows-2 w-full border-4 border-yellow-600 h-[42rem]">
        <div className="col-span-2 row-span-1 flex relative  justify-between p-4   bg-[#8F1504] h-[18rem] " >
          <div className="text-yellow-600 font-ramaraja text-6xl mt-10 font-bold mr-4">
            A
          </div>
          <div className="border-dashed relative border-2 border-yellow-600 rounded-lg w-full h-full bg-[#450A0366]  flex items-center justify-left">
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
        <div className="col-span-1 row-span-1 flex justify-center  ">
          <div className=" ml-2 font-ramaraja text-4xl font-bold w-full p-4">

            <div className="p-2 w-full ">
              <div
                className={`flex justify-between items-center p-5 w-full h-[7rem]  ${sectionId === 0 ? "bg-[#07740C]" : "bg-[#FFF8D6]"
                  } text-black text-2xl font-bold `}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 overflow-clip">
                    <img src="/assets/a.png" alt="a" className="w-16" />
                  </div>
                  <span className="text-black text-5xl">
                    {andar.length}
                  </span>
                </div>
              </div>
           

              <div
                className={`flex justify-between items-center p-5 h-[7rem] ${sectionId === 1 ? "bg-[#07740C]" : "bg-[#FFF8D6] z-50"
                  } text-black text-2xl font-bold`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-16 pt-1 overflow-clip">
                    <img src="/assets/b.png" alt="b" className="w-16" />
                  </div>
                  <span className="text-black text-5xl">
                    {bahar.length}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-4 px-2">
  <button
    onClick={() => handleWinner(0)}
    className="bg-red-700 text-white px-4 py-2 rounded-md text-lg font-bold hover:bg-green-800"
  >
    Andar Wins
  </button>
  <button
    onClick={() => handleWinner(1)}
    className="bg-blue-700 text-white px-4 py-2 rounded-md text-lg font-bold hover:bg-blue-800"
  >
    Bahar Wins
  </button>
</div>
            </div>
          </div>

        </div>

        <div className="col-span-2 row-span-1 flex relative  justify-between p-4  bg-[#8F1504] h-[18rem]">
          <div className="text-yellow-600 font-ramaraja text-6xl mt-10 font-bold mr-4 ">
            B
          </div>
          <div className="relative border-dashed border-2 border-yellow-600 rounded-lg w-full h-full bg-[#450A0366] flex items-center justify-left">
            {/* {bahar.map((card, index) => (
              <img key={index} src={`/cards/${card}.png`} alt={card} className="w-36 flex justify-center absolute align-middle" style={{ left: `${index * 25}px`, zIndex: index }} />
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
        <div className="col-span-1 row-span-1 flex  flex-col items-center justify-center  bg-[#8F1504] h-full -mb-8 ">
          <div className="text-yellow-600 font-ramaraja text-4xl font-bold mb-2">
            JOKER
          </div>
          <div className="w-60 border-dashed ml-5 border-2 border-yellow-600 bg-[#450A0366] rounded-lg flex justify-center items-center">
            <div className="flex justify-center items-center h-[14rem]">
              {joker ? (
                <img src={`/cards/${joker}.png`} alt={joker} className="w-28" />
              ) : (
                <img src="/assets/ocean7.png" alt="ocean7" className="w-24 h-24" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;