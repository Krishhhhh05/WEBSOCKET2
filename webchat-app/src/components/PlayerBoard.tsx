"use client";
import { useState, useEffect } from "react";
import WinnerModal from "@/components/WinnerModal";
const GameBoard = ({ socket }: { socket: WebSocket | null }) => {
    const [joker, setJoker] = useState<string | null>(null);
    const [andar, setAndar] = useState<string[]>([]);
    const [bahar, setBahar] = useState<string[]>([]);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [winner, setWinner] = useState<number | null>(null);

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

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);
    

    return (
        <div className="flex flex-col items-center bg-[#8F1504] h-screen w-full border-8 border-yellow-600">
            PLAYER BOARD
            <WinnerModal show={showWinnerModal} onClose={() => setShowWinnerModal(false)} winner={winner} />
            
            <div className="bg-[#8F1504] grid grid-cols-3 grid-rows-2 gap-4 h-full w-full border-8 border-yellow-600 mt-4">
                <div className="col-span-2 row-span-1 flex relative justify-between p-4 border-b-4 border-yellow-600">
                    <div className="text-white font-ramaraja text-6xl mt-10 font-bold mr-4">
                        A
                    </div>
                    <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-[20vh] bg-[#450A0366] flex pl-32 items-center justify-left">
                        {andar.map((card, index) => (
                            <img key={index} src={`/cards/${card}.png`} alt={card} className="w-14" />
                        ))}
                    </div>
                </div>
                <div className="col-span-1 row-span-2 flex justify-center border-b-4 h-52 ">
                    <div className="text-white ml-2 font-ramaraja text-4xl font-bold">
                        JOKER
                    </div>
                    <div className="w-52 h-s border-dashed ml-5 border-2 border-yellow-600 bg-[#450A0366] rounded-lg flex justify-center items-center">
                        <div className="flex justify-center items-center h-52">
                            {joker ? (
                                <img src={`/cards/${joker}.png`} alt={joker} className="w-20 my-2" />
                            ) : (
                                <img src="/assets/ocean7.png" alt="ocean7" className="w-24 h-24" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-span-2 row-span-1 flex justify-center p-4">
                    <div className="text-white font-ramaraja text-6xl mt-10 font-bold mr-4">
                        B
                    </div>
                    <div className="border-dashed border-2 border-yellow-600 rounded-lg w-full h-[20vh] bg-[#450A0366] flex items-center justify-left">
                        {bahar.map((card, index) => (
                            <img key={index} src={`/cards/${card}.png`} alt={card} className="w-36 flex justify-center align-middle" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;