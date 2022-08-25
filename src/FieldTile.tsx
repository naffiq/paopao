import { FieldTile as FieldTileType } from "./types/GameField";

type FieldTileProps = FieldTileType & {
  onClick: () => void;
};

const FieldTile: React.FC<FieldTileProps> = (props) => {
  const spriteX = Math.floor(props.cardType % 6) * 60;
  const spriteY = Math.floor(props.cardType / 6) * 60;

  return (
    <div
      style={{
        width: "60px",
        height: "60px",
        background: `url(/sprites.png) ${spriteX}px ${spriteY}px`,
        backgroundColor: props.isSelected ? "#000" : undefined
      }}
      onClick={props.onClick}
    ></div>
  );
};

export default FieldTile;
