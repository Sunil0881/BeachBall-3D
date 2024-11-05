import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";
import useGame from "../stores/useGame.js";
import useAudio from "../stores/useAudio.js";
import Logo from "../assets/logo_white.svg";

export default function Interface() {
  const time = useRef();
  const { mode, setMode, restart, phase, setIsInGame, score } = useGame();
  const { audio, toggleAudio } = useAudio();
  
  const [modeName, setModeName] = useState(mode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    { id: "0", text: "Random", name: "random" },
    { id: "1", text: "Tour", name: "tour" },
    { id: "2", text: "Adventure", name: "adventure" },
  ];

  useEffect(() => {
    console.log("Phase changed:", phase); // Log the phase whenever it changes
    handlePhaseChange(phase);
  }, [phase]); // Add phase to the dependency array

  // Function to update mode name based on current mode
  const updateModeName = (mode) => {
    switch (mode) {
      case "random":
        return "Random";
      case "tour":
        return "Tour";
      case "adventure":
        return "Adventure";
      default:
        return mode;
    }
  };

  const clearData = () => {
    window.localStorage.clear();
  };

  const handleRestart = () => {
    restart();
  };

  const sendScoreToBackend = async (points) => {
    const userId = "Sunil"; // Replace with actual user ID
    const scoreType = "game2"; // Replace with the relevant score type if needed
  
    const payload = {
      user_id: userId,
      score: points,
      type: scoreType,
    };
  
    console.log("Payload:", payload); // Log the payload to confirm its structure
  
    try {
      const response = await fetch("https://virtual-gf-py.vercel.app/score/add_score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        console.log("Score submitted successfully.");
      } else if (response.status === 400) {
        console.warn("Score entry exists. Attempting to update instead.");
  
        const updatePayload = {
          user_id: userId,
          new_score: points,
          type: scoreType,
        };
  
        const updateResponse = await fetch("https://virtual-gf-py.vercel.app/score/update_score", {
          method: "PUT", // Change to the correct method if needed
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        });
  
        if (updateResponse.ok) {
          console.log("Score updated successfully.");
        } else {
          const updateError = await updateResponse.json();
          console.error("Error updating score:", updateError);
        }
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };
  

  const handlePhaseChange = (currentPhase) => {
    if (currentPhase === "ended") {
      sendScoreToBackend(score);
    }
  };

  const modeOptions = modes.map((mode) => (
    <div
      key={mode.id}
      className={`mode-selection ${selectedMode && selectedMode.name === mode.name ? "selected-mode" : ""}`}
      onClick={() => {
        setMode(mode.name);
        setSelectedMode(mode);
        window.localStorage.setItem("mode", mode.name);
        handleRestart();
      }}
    >
      {mode.text}
    </div>
  ));

  return (
    <div className="interface">
      {/* Logo */}
      <img className="logo" src={Logo} alt="Beachy Beachy Ball Logo" />

      {/* Restart */}
      {phase === "ended" && (
        <div className="restart">
          <div className="finished">Finished!</div>
          <img src="./icons/replay.png" className="restart-button" onClick={handleRestart} />
          <div>Play Again</div>
        </div>
      )}

      {/* Control Buttons (top-right) */}
      <div className="control-buttons">
        <div className="control-button" id="sound" onClick={toggleAudio}>
          <img src={audio ? "./icons/sound_on.svg" : "./icons/sound_off.svg"} />
        </div>
        <div className="control-button" id="menu" onClick={() => setIsModalOpen(!isModalOpen)}>
          <img src="./icons/menu.svg" />
        </div>
      </div>

      {/* Bottom */}
      <div className="bottom">
        <div className="controls">
          {/* Mode */}
          <div className="bottom-label">Mode</div>
          <div className="mode">{mode}</div>
        </div>
        {/* Time */}
        <div className="bottom-right">
          <div className="time-container">
            <div className="bottom-label">Time</div>
            <div className="time" ref={time}></div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Menu</div>
            <div className="modal-main">
              <div className="section-title">Mode</div>
              <div className="mode-area">{modeOptions}</div>
              <div
                className="modal-button disabled"
                onClick={() => {
                  console.log("High Scores");
                }}
              >
                High Scores
              </div>
              <div
                className="modal-button"
                onClick={clearData}
              >
                Clear Data
              </div>
              <div
                className="modal-button"
                onClick={() => setIsInGame(false)}
              >
                Main Menu
              </div>
              <div
                className="modal-button"
                onClick={() => setIsModalOpen(false)}
              >
                Back
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
