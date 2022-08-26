import "./styles.css";
import FieldTile from "./FieldTile";
import { useGameField } from "./hooks/useGameField";

export default function App() {
  const {
    gameField,
    selectFieldTile,
    existingSolution,
    onShowHint,
    showHint,
    onFieldShuffle,
  } = useGameField();

  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        maxWidth: "1024",
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
        <h1>
          PaoPao - {existingSolution ? "Solution exists" : "Nah man, give up"}
        </h1>
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
    </div>
  );
}
