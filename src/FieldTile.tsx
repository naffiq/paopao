import { DIMENSIONS_X, DIMENSIONS_Y } from "./hooks/useGameField";
import { FieldTile as FieldTileType } from "./types/GameField";

type FieldTileProps = FieldTileType & {
  onClick: () => void;
  highlighted: boolean;
};

const FieldTile: React.FC<FieldTileProps> = ({
  cardType,
  isSelected,
  isSolved,
  onClick,
  highlighted,
}) => {
  const tileSize = Math.min(
    Math.floor(
      Math.min(
        (window.innerWidth - DIMENSIONS_X * 4) / DIMENSIONS_X,
        window.innerHeight / DIMENSIONS_Y
      )
    ),
    60
  );
  const spriteX = Math.floor(cardType % 6) * tileSize;
  const spriteY = Math.floor(cardType / 6) * tileSize;

  const getColor = (
    selectedColor: string,
    normalColor: string,
    highlightedColor: string
  ) => {
    if (isSolved) {
      return "transparent";
    }
    if (isSelected) {
      return selectedColor;
    }
    if (highlighted) {
      return highlightedColor;
    }

    return normalColor;
  };

  const backgroundColor = getColor("#B5DDE5", "#FFFFDB", "red");
  const darkBorderColor = getColor("#566F81", "#817C56", "red");
  const lightBorderColor = getColor("#D2F7FF", "#E9E3B9", "red");

  return (
    <div
      style={{
        width: tileSize + "px",
        height: tileSize + "px",
        background: isSolved
          ? undefined
          : `url(${process.env.PUBLIC_URL}/sprites.png) ${spriteX}px ${spriteY}px`,
        backgroundColor,
        backgroundSize: `${360 * (tileSize / 60)}px`,
        borderTop: "2px solid " + darkBorderColor,
        borderRight: "2px solid " + darkBorderColor,
        borderBottom: "2px solid " + lightBorderColor,
        borderLeft: "2px solid " + lightBorderColor,
        cursor: isSolved ? "default" : "pointer",
      }}
      onClick={() => onClick()}
    ></div>
  );
};

export default FieldTile;
