import "./styles.css";
import { GameField } from "./types/GameField";
import FieldTile from "./FieldTile";

export default function App() {
  let increment = 0;
  const gameField: GameField = new Array(9).fill(null).map((row) =>
    new Array(14).fill(null).map((card) => ({
      cardType: increment++,
      isSolved: false,
      isSelected: false
    }))
  );

  return (
    <div className="App">
      {gameField.map((row) => (
        <div
          style={{
            display: "flex"
          }}
        >
          {row.map((card) => (
            <FieldTile {...card} />
          ))}
        </div>
      ))}
    </div>
  );
}
