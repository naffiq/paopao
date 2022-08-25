export type CardType = number;

export type FieldTile = {
  cardType: CardType;
  isSolved: boolean;
  isSelected: boolean;
};

export type FieldRow = Array<FieldTile>;

export type GameField = Array<FieldRow>;
