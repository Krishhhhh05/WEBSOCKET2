"use client";
import { useState, useEffect } from "react";

const GameMenu = ({ socket }: { socket: WebSocket | null }) => {
  const [cardInput, setCardInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [minBet, setMinBet] = useState(100);
  const [maxBet, setMaxBet] = useState(10000);
  const [newMinBet, setNewMinBet] = useState(minBet);
  const [newMaxBet, setNewMaxBet] = useState(maxBet);

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
      if (data.action === "update_players") {
        setPlayers(data.players);
        console.log(data, " for players");
      }
      else if (data.action==="bet_changed"){
        console.log("Bet Changed",data );
        setMinBet(data.minBet);
        setMaxBet(data.maxBet);
        
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const togglePlayer = (player: "player1" | "player2" | "player3" | "player4" | "player5" | "player6") => {
    if (socket) {
      socket.send(JSON.stringify({ action: "toggle_player", player }));
    }
    console.log("toggle player", player);
  };

  const sendCard = () => {
    if (cardInput && socket) {
      socket.send(JSON.stringify({ action: "add_card", card: cardInput }));
      setCardInput("");
    }
  };

  const resetGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ action: "reset_game" }));
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

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between w-full h-30 shadow-lg border-2 border-yellow-600 bg-wood-pattern">
        {/* Left Section */}
        <div className="font-questrial p-4 rounded-lg shadow-lg text-left md:w-1/4 w-full relative">
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 left-2 w-8 h-8" />
          <img src="/assets/screw.png" alt="screw" className="absolute top-2 right-2 w-8 h-8" />
          <div className="flex-col justify-center items-center">
            <div className="flex justify-center items-center">
              <img src="/assets/logo.png" alt="logo" className="h-14" />
            </div>
            <div className="text-xl text-center text-yellow-300">Table 1234</div>
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
                  <img src="/assets/menu.png" alt="menu" className="h-20" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#8F1504] border border-gray-300 rounded shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        value={cardInput}
                        onChange={(e) => setCardInput(e.target.value.toUpperCase())}
                        placeholder="Enter card (e.g., AS, KD)"
                        className="border p-2 w-full mb-2 text-black"
                      />
                      <button onClick={sendCard} className="bg-blue-500 text-white p-2 w-full mb-2">
                        Send Card
                      </button>
                      <button onClick={resetGame} className="bg-red-500 text-white p-2 w-full mb-2">
                        Reset Game
                      </button>
                      <div className="flex flex-col gap-2">
                        <input
                          type="number"
                          value={newMinBet}
                          onChange={(e) => setNewMinBet(Number(e.target.value))}
                          placeholder="Min Bet"
                          className="border p-2 w-full mb-2 text-black"
                        />
                        <input
                          type="number"
                          value={newMaxBet}
                          onChange={(e) => setNewMaxBet(Number(e.target.value))}
                          placeholder="Max Bet"
                          className="border p-2 w-full mb-2 text-black"
                        />
                        <button onClick={changeBets} className="bg-green-500 text-white p-2 w-full">
                          Change Bets
                        </button>
                      </div>
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