import { FieldTile as FieldTileType } from "./types/GameField";

type FieldTileProps = FieldTileType & {
  onClick: () => void;
  highlighted: boolean;
};

const FieldTile: React.FC<FieldTileProps> = (props) => {
  const spriteX = Math.floor(props.cardType % 6) * 60;
  const spriteY = Math.floor(props.cardType / 6) * 60;

  const getColor = (
    selectedColor: string,
    normalColor: string,
    highlightedColor: string
  ) => {
    console.log(props);
    if (props.isSolved) {
      return "transparent";
    }
    if (props.isSelected) {
      return selectedColor;
    }
    if (props.highlighted) {
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
        width: "60px",
        height: "60px",
        background: props.isSolved
          ? undefined
          : `url(${process.env.PUBLIC_URL}/sprites.png) ${spriteX}px ${spriteY}px`,
        backgroundColor,
        borderTop: "1px solid " + darkBorderColor,
        borderRight: "1px solid " + darkBorderColor,
        borderBottom: "1px solid " + lightBorderColor,
        borderLeft: "1px solid " + lightBorderColor,
      }}
      onClick={() => props.onClick()}
    ></div>
  );
};

export default FieldTile;
