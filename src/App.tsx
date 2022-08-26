import "./styles.css";
import FieldTile from "./FieldTile";
import { useGameField } from "./hooks/useGameField";
import { useState } from "react";
import WinModal from "./components/WinModal";

export default function App() {
  const {
    gameField,
    selectFieldTile,
    existingSolution,
    onShowHint,
    showHint,
    couplesFound,
  } = useGameField(() => {
    setHasWon(true);
  });

  const [hasWon, setHasWon] = useState(false);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: "0 auto",
        maxWidth: "1024px",
        flexDirection: "column",
        caretColor: "transparent",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>PaoPao {couplesFound}/72</h1>
        <button onClick={onShowHint}>Show hint</button>
      </div>
      <div>
        {gameField.map((row, y) => (
          <div
            key={`row-${y}`}
            style={{
              display: "flex",
            }}
          >
            {row.map((card, x) => (
              <FieldTile
                highlighted={
                  showHint && existingSolution
                    ? existingSolution?.some(
                        (coord) => coord.x === x && coord.y === y
                      )
                    : false
                }
                {...card}
                key={`card-${x}-${y}-${card.cardType}`}
                onClick={() => selectFieldTile(x, y)}
              />
            ))}
          </div>
        ))}
      </div>
      <WinModal show={hasWon} onOk={() => setHasWon(false)} />
    </div>
  );
}
