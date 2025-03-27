"use client";
import { useState, useEffect } from "react";
import WinnerModal from "@/components/WinnerModal";

const GameMenu = ({ socket }: { socket: WebSocket | null }) => {
  const [cardInput, setCardInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [minBet, setMinBet] = useState(100);
  const [maxBet, setMaxBet] = useState(10000);
  const [newMinBet, setNewMinBet] = useState(minBet);
  const [newMaxBet, setNewMaxBet] = useState(maxBet);
  const [joker, setJoker] = useState(null);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [mode, setMode] = useState<"manual" | "automatic" | "live">("manual");
  const [auto, setAuto] = useState(false);
  const [winner_section, setWinnerSection] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableNumber, setTableNumber] = useState("1234");  
  const[table,setTable]=useState<string|null>("1234");  
  const [players, setPlayers] = useState<{
    player1: boolean;
    player2: boolean;
    player3: boolean;
    player4: boolean;
    player5: boolean;
    player6: boolean;
  }>({
    player1: false,
    player2: false,
    player3: false,
    player4: false,
    player5: false,
    player6: false,
  });

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.action === "set_joker") {
        setJoker(data.joker);
      } else if (data.action === "update_players") {
        setPlayers(data.players);
        console.log(data, " for players");
      } else if (data.action === "bet_changed") {
        console.log("Bet Changed", data);
        setMinBet(data.minBet);
        setMaxBet(data.maxBet);
      }
      else if (data.action === "table_number_set") {
        console.log("Table Number Updated in player board", data);
        setTable(data.tableNumber);  // ✅ Update the state
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const togglePlayer = (player: "player1" | "player2" | "player3" | "player4" | "player5" | "player6") => {
    if (joker) {
      console.log("cannot add new player");
      return;
    }
    if (socket) {
      socket.send(JSON.stringify({ action: "toggle_player", player }));
    }
    console.log("toggle player", player);
  };

  const sendCard = () => {
    if (selectedFace && selectedSuit && socket) {
      socket.send(JSON.stringify({ action: "add_card", card: `${selectedFace}${selectedSuit}` }));
      setSelectedFace(null);
      setSelectedSuit(null);
    }
  };

  const undoCard = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "undo_card" }));
    }
  };
  const lastwin = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "delete_win" }));
    }
  };
  const allwins = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "delete_all_wins" }));
    }
  };
  const suits = [
    { symbol: "♠", value: "S" },
    { symbol: "♦", value: "D" },
    { symbol: "♣", value: "C" },
    { symbol: "♥", value: "H" },
  ];

  const resetGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "reset_game" }));
      setJoker(null);
    }
  };

  const changeBets = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "bet_changed", minBet: newMinBet, maxBet: newMaxBet }));
      console.log({ action: "bet_changed", minBet: newMinBet, maxBet: newMaxBet });
      setMinBet(newMinBet);
      setMaxBet(newMaxBet);
    }
  };
  const sendTableNumber = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "table_number_set", tableNumber }));
      console.log({ action: "table_number_set", tableNumber });
    }
  };

  const handleWinner = (winner: number) => {
    if (socket) {
      setWinner(winner);
      setMenuOpen(false);
      setShowWinnerModal(true);
      setTimeout(() => {

        setShowWinnerModal(false);
      }, 5000);
      
      
      
        socket.send(JSON.stringify({ action: "game_won", winner: winner , winner_section:winner_section}));
      
      console.log({ action: "game_won", winner: winner });
    }
  };

  const startAutomatic = () => {
    if (socket) {

      socket.send(JSON.stringify({ action: "start_automatic" }));

    }
  };

  return (
    <>
      <WinnerModal show={showWinnerModal} onClose={() => setShowWinnerModal(false)} winner={winner} />

      <div className="flex flex-col md:flex-row justify-between w-full h-30 shadow-lg  bg-wood-pattern">
        {/* Left Section */}
        <div className="font-questrial p-4 rounded-lg shadow-lg text-left md:w-1/4 w-full relative">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-8 h-8" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-8 h-8" />
          <div className="flex-col justify-center items-center">
            <div className="flex justify-center items-center">
              <img src="/assets/logo.png" alt="logo" className="h-14" />
            </div>
            <div className="text-xl text-center text-yellow-300">Table FT{tableNumber }</div>
          </div>
        </div>

        <div className="flex py-5 border border-yellow-600 px-5 gap-3 overflow-x-auto">
          <img
            src={players.player1 ? "/assets/whitehat.png" : "/assets/redhat.png"}
            alt="Player 1"
            className="h-16 cursor-pointer"
            onClick={() => togglePlayer("player1")}
          />
          <img
            src={players.player2 ? "/assets/whitehat.png" : "/assets/redhat.png"}
            alt="Player 2"
            className="h-16 cursor-pointer"
            onClick={() => togglePlayer("player2")}
          />
          <img
            src={players.player3 ? "/assets/whitehat.png" : "/assets/redhat.png"}
            alt="Player 3"
            className="h-16 cursor-pointer"
            onClick={() => togglePlayer("player3")}
          />
          <img
            src={players.player4 ? "/assets/whitehat.png" : "/assets/redhat.png"}
            alt="Player 4"
            className="h-16 cursor-pointer"
            onClick={() => togglePlayer("player4")}
          />
          <img
            src={players.player5 ? "/assets/whitehat.png" : "/assets/redhat.png"}
            alt="Player 5"
            className="h-16 cursor-pointer"
            onClick={() => togglePlayer("player5")}
          />
          <img
            src={players.player6 ? "/assets/whitehat.png" : "/assets/redhat.png"}
            alt="Player 6"
            className="h-16 cursor-pointer"
            onClick={() => togglePlayer("player6")}
          />
        </div>

        {/* Right Section with Menu and Dropdown */}
        <div className="font-questrial p-4 rounded-lg shadow-lg text-left md:w-1/4 w-full relative">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-8 h-8" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-8 h-8" />
          <div className="flex-col justify-center items-center relative">
            <div className="flex justify-center items-center cursor-pointer">
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="">
                  <img src="/assets/menu.png" alt="menu" className="h-20 bg-wood-pattern" />
                </button>
                {menuOpen && (


                  <div className="fixed inset-0 left-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 w-full">

                    <div className="bg-gray-200 w-full max-w-4xl rounded-lg p-6 grid grid-cols-3 gap-4">
                      {/* Close Button */}
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-4 right-4 text-black text-2xl font-bold"
                      >
                        &times;
                      </button>

                      {/* Mode Selection */}
                      <div className="col-span-3 flex justify-center mb-4">
                      <button
                          onClick={() => setMode("live")}
                          className={`px-4 py-2 rounded-l-lg ${mode === "live" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                        >
                          Live
                        </button>
                        <button
                          onClick={() => setMode("manual")}
                          className={`px-4 py-2  ${mode === "manual" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                        >
                          Manual
                        </button>
                        <button
                          onClick={() => setMode("automatic")}
                          className={`px-4 py-2 rounded-r-lg ${mode === "automatic" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                        >
                          Automatic
                        </button>
                        
                      </div>

                      {(mode === "automatic"   ) ? (
                       
                        <div className="col-span-3 text-center">
                        <p className="text-xl font-bold">Automatic mode is enabled. Actions will be handled automatically.</p>
                        <div className="grid grid-rows-3 gap-4 mt-4">
                          <button
                            onClick={startAutomatic}
                            className="bg-blue-500 text-white text-2xl font-bold rounded-lg p-6 hover:bg-blue-700 transition"
                          >
                            START AUTOMATIC
                          </button>

                         

                        </div>
                      </div>
                      ) : (
                        <>
                        {/* Left Side: Win Buttons */}
                        <div className="gap-4">
                          <button
                            onClick={() => handleWinner(0)}
                            className="bg-[#C80815] h-1/3 text-white text-2xl font-bold rounded-lg p-6 hover:bg-red-700 transition mb-1"
                          >
                            ANDAR WINS
                          </button>
                          <button
                            onClick={() => handleWinner(1)}
                            className="bg-[#1C2841] h-1/3 text-white text-2xl font-bold rounded-lg p-6 hover:bg-blue-900 transition"
                          >
                            BAHAR WINS
                          </button>
                        </div>

                        {/* Middle: Delete and Bet Controls */}
                        <div className="grid grid-rows-3 gap-4 ">
                        <div className="grid grid-cols-1 gap-2 ">
                            <div className="flex items-center justify-between bg-black text-white rounded-lg p-3">
                              <span>MAX</span>

                              <input
                                type="number"
                                value={newMaxBet}
                                onChange={(e) => setNewMaxBet(Number(e.target.value))}
                                className="bg-transparent text-right w-20  focus:outline-none"
                                placeholder="100"
                                inputMode="numeric"  // Ensures mobile devices show only a numeric keypad
                                pattern="[0-9]*"  // Restricts input to numbers only
                              />

                            </div>
                            <div className="flex items-center justify-between bg-black text-white rounded-lg p-3">
                              <span>MIN</span>
                              <input
                                type="number"
                                value={newMinBet}
                                onChange={(e) => setNewMinBet(Number(e.target.value))}
                                className="bg-transparent text-right w-20 focus:outline-none"
                                placeholder="100"
                                inputMode="numeric"  // Ensures mobile devices show only a numeric keypad
                                pattern="[0-9]*"  // Restricts input to numbers only
                              />

                            </div>
                            <button onClick={changeBets} className="bg-black text-white rounded-lg p-3 hover:bg-gray-800 transition">
                              CHANGE BETS
                            </button>
                            <button
                                onClick={() => setShowTableModal(true)}
                                className="bg-black text-white rounded-lg p-3 hover:bg-gray-800 transition"
                              >
                                ENTER TABLE NUMBER
                              </button>

                              {/* Table Number Input Modal */}
                              {showTableModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                                    <h2 className="text-xl font-bold mb-4 text-black">Enter Table Number</h2>
                                    <input
                                      type="number"
                                      value={tableNumber}
                                      onChange={(e) => setTableNumber(e.target.value)}
                                      className="border p-2 w-full rounded-md text-center text-black"
                                      placeholder="Enter Table Number"
                                    />
                                    <div className="flex justify-between mt-4">
                                      <button
                                        onClick={() => setShowTableModal(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          console.log("Table Number:", tableNumber);
                                          setShowTableModal(false);
                                          sendTableNumber();
                                        }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            <button onClick={resetGame} className="bg-red-500 text-white p-2 w-full mb-2">
                              Reset Game
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 ">
                            {/* <button onClick={undoCard} className="bg-black text-white rounded-lg p-3 hover:bg-gray-800 transition">
                              DELETE LAST CARD
                            </button> */}
                            <button onClick={lastwin} className="bg-black text-white rounded-lg p-3 hover:bg-gray-800 transition">
                              DELETE LAST WIN
                            </button>
                            <button onClick={allwins} className="bg-black text-white rounded-lg p-3 hover:bg-gray-800 transition">
                              DELETE ALL WINS
                            </button>
                          </div>

                          
                        </div>

                        {/* Right Side: Card Grid and Controls */}
                        <div>
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            {["A", "2", "3", "J", "4", "5", "6", "Q", "7", "8", "9", "K", "T"].map((face) => (
                              <button
                                key={face}
                                className={`rounded-lg aspect-square flex items-center justify-center text-2xl font-bold transition p-2 ${selectedFace === face ? "bg-green-500 text-white" : "bg-black text-white"
                                  }`}
                                onClick={() => setSelectedFace(face)}
                              >
                                {face}
                              </button>
                            ))}
                          </div>

                          {/* Suits */}
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            {suits.map((suit) => (
                              <button
                                key={suit.value}
                                className={`rounded-lg aspect-square flex items-center justify-center text-3xl font-bold transition p-2 ${selectedSuit === suit.value ? "bg-yellow-500 text-black " : "bg-white-800 text-white"
                                  }`}
                                onClick={() => setSelectedSuit(suit.value)}
                              >
                                {suit.symbol}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={sendCard}
                              className="bg-green-600 text-white rounded-lg p-3 text-xl hover:bg-green-700 transition"
                            >
                              SEND CARD
                            </button>
                            <button onClick={undoCard} className="bg-red-600 text-white rounded-lg p-3 text-xl hover:bg-red-700 transition">
                              UNDO CARD
                            </button>
                          </div>
                        </div>
                      </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameMenu;