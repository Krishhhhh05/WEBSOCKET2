import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

const WinnerModal = ({ show, onClose, winner }: { show: boolean; onClose: () => void; winner: number | null }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      console.log("Winner:", winner);

      // Play the audio when modal opens
      const audio = new Audio("/assets/winner-sound.mp3");
      // audio.play();

      // Hide the modal after 7 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed h-screen w-full z-50 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          {showConfetti && <Confetti />}
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md flex flex-col items-center text-black"
          >
           
            <div className="text-4xl font-bold text-gray-800 text-center mb-4">
              
              
            </div>
            <div className="flex items-center justify-center">
              {winner === 0 && (
                <>
                <img src="/assets/blue_a.svg" alt="Andar Wins" className="w-24 h-24 mr-4" />
                <div className="text-4xl font-bold text-gray-800 text-center mb-4 w-full">
              ANDAR WINS!!
              </div>
              </>
              )}
              {winner === 1 && (
                <>
                <img src="/assets/red_b.svg" alt="Bahar Wins" className="w-24 h-24 mr-4" />
                <div className="text-4xl font-bold text-gray-800 text-center mb-4 w-full">
              BAHAR WINS!!
              </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WinnerModal;