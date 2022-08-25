import "./styles.css";
import {useState} from "react";
import { GameField } from "./types/GameField";
import FieldTile from "./FieldTile";

type Coords = {
  x?: number;
  y?: number;
}

export default function App() {
  let increment = 0;
  const gameField: GameField = new Array(9).fill(null).map((row) =>
    new Array(14).fill(null).map((card) => ({
      cardType: increment++ % 36,
      isSolved: false,
      isSelected: false
    }))
  );
  
  const [tile1Coords, setTile1Coords] = useState<Coords>({x: undefined, y: undefined});
  
  const handleTileClick = (x: number, y: number) => {
    setTile1Coords({x, y});
  };

  return (
    <div className="App">
      {gameField.map((row, y) => (
        <div
          style={{
            display: "flex"
          }}
        >
          {row.map((card, x) => (
            <FieldTile 
              {...card}
              onClick={() => handleTileClick(x, y)}
              isSelected={tile1Coords.x === x && tile1Coords.y === y}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
