import { useEffect, useState } from "react";
import { FieldTile, GameField } from "../types/GameField";

const DIMENSIONS_Y = 9;
const DIMENSIONS_X = 16;
const POKEMON_COUNT = 36;

type Coords = {
  x: number;
  y: number;
};

const generateMap: () => GameField = () => {
  const cardTypes = new Array(DIMENSIONS_X * DIMENSIONS_Y)
    .fill(null)
    .map((_, i) => Math.floor(i / 4));

  return new Array(DIMENSIONS_Y).fill(null).map(() =>
    new Array(DIMENSIONS_X).fill(null).map(() => ({
      cardType: cardTypes.splice(
        Math.floor(Math.random() * cardTypes.length),
        1
      )[0],
      isSolved: false,
      isSelected: false,
    }))
  );
};

export const useGameField = () => {
  const [gameField, setGameField] = useState<GameField>(generateMap());
  const [showHint, setShowHint] = useState(false);

  const [tile1Coords, setTile1Coords] = useState<Coords | undefined>(undefined);
  const [tile2Coords, setTile2Coords] = useState<Coords | undefined>(undefined);
  const [existingSolution, setExistingSolution] = useState<
    Coords[] | undefined
  >();

  const updateFieldTile = (x: number, y: number, newTile: FieldTile) => {
    const updatedRow = gameField[y].map((oldTile, i) =>
      i === x ? newTile : oldTile
    );
    setGameField(gameField.map((oldRow, j) => (j === y ? updatedRow : oldRow)));
  };
  const setFieldSelected = (x: number, y: number, isSelected: boolean) => {
    updateFieldTile(x, y, {
      ...gameField[y][x],
      isSelected,
    });
  };

  const selectFieldTile = (x: number, y: number) => {
    const tile = gameField[y][x];
    if (tile.isSolved || tile.isSelected) {
      return;
    }

    if (tile1Coords === undefined) {
      setFieldSelected(x, y, true);
      setTile1Coords({ x, y });
    } else if (tile2Coords === undefined) {
      setFieldSelected(x, y, true);
      setTile2Coords({ x, y });
    } else {
    }
  };

  const unsetSelectedTiles = (isSolved: boolean) => {
    let updatedField = gameField.map((fieldRow) =>
      fieldRow.map((fieldTile) =>
        fieldTile.isSelected
          ? {
              ...fieldTile,
              isSelected: false,
              isSolved,
            }
          : fieldTile
      )
    );
    if (isSolved) {
      let updatedSolution = getExistingSolutions(updatedField);

      while (updatedSolution === undefined) {
        updatedField = getReshuffledField(updatedField);
        updatedSolution = getExistingSolutions(updatedField);
      }
      setExistingSolution(updatedSolution);
    }

    setGameField(updatedField);
  };

  const canCrossTiles = (
    { x: x1, y: y1 }: Coords,
    { x: x2, y: y2 }: Coords
  ) => {
    const paths = new Array(DIMENSIONS_Y + 1)
      .fill(null)
      .map(() => new Array(DIMENSIONS_X).fill(999));
    paths[-1] = new Array(DIMENSIONS_X).fill(999);

    enum Directions {
      Initial,
      Up,
      Down,
      Left,
      Right,
    }
    const drawPath = (
      direction: Directions,
      x: number,
      y: number,
      turns: number
    ) => {
      if (turns > 2 || paths[y][x] < turns) {
        return;
      }
      paths[y][x] = turns;
      if (x == x2 && y == y2) {
        return;
      }

      if (
        gameField[y] &&
        gameField[y][x] &&
        !gameField[y][x].isSolved &&
        direction !== Directions.Initial
      ) {
        return;
      }

      if (paths[y2][x2] <= 2) {
        return;
      }

      const getDirectionIncrement = (newDirection: Directions) =>
        direction !== newDirection && direction !== Directions.Initial ? 1 : 0;

      if (x > -1) {
        drawPath(
          Directions.Left,
          x - 1,
          y,
          turns + getDirectionIncrement(Directions.Left)
        );
      }

      if (x < DIMENSIONS_X) {
        drawPath(
          Directions.Right,
          x + 1,
          y,
          turns + getDirectionIncrement(Directions.Right)
        );
      }

      if (y > -1) {
        drawPath(
          Directions.Up,
          x,
          y - 1,
          turns + getDirectionIncrement(Directions.Up)
        );
      }

      if (y < DIMENSIONS_Y) {
        drawPath(
          Directions.Down,
          x,
          y + 1,
          turns + getDirectionIncrement(Directions.Down)
        );
      }
    };

    drawPath(Directions.Initial, x1, y1, 0);

    return paths[y2][x2] <= 2;
  };

  useEffect(() => {
    if (tile1Coords !== undefined && tile2Coords !== undefined) {
      const tile1 = gameField[tile1Coords.y][tile1Coords.x];
      const tile2 = gameField[tile2Coords.y][tile2Coords.x];

      const isSolved =
        tile1.cardType === tile2.cardType &&
        canCrossTiles(tile1Coords, tile2Coords);

      setTimeout(() => {
        unsetSelectedTiles(isSolved);
        setTile1Coords(undefined);
        setTile2Coords(undefined);
        setShowHint(false);
      }, 500);
    }
  }, [tile1Coords, tile2Coords]);

  useEffect(() => {
    console.log("existingSolution", existingSolution);
    if (existingSolution === undefined) {
      console.log("TODO: REGENERATE THE MAP");
    }
  }, [existingSolution]);

  const getExistingSolutions = (gameField: GameField) => {
    for (let cardType = 0; cardType < POKEMON_COUNT; cardType++) {
      const coords: Coords[] = [];
      gameField.forEach((row, y) => {
        row.forEach((card, x) => {
          if (card.cardType === cardType && !card.isSolved) {
            coords.push({ x, y });
          }
        });
      });
      for (let coordA = 0; coordA < coords.length - 1; coordA++) {
        for (let coordB = coordA + 1; coordB < coords.length; coordB++) {
          if (canCrossTiles(coords[coordA], coords[coordB])) {
            return [coords[coordA], coords[coordB]];
          }
        }
      }
    }

    return undefined;
  };

  const getReshuffledField = (gameField: GameField) => {
    const typesLeft: number[] = [];
    gameField.forEach((row) =>
      row.forEach((card) => {
        if (!card.isSolved) {
          typesLeft.push(card.cardType);
        }
      })
    );

    const newGameField = gameField.map((row) =>
      row.map((card) => ({
        cardType: !card.isSolved
          ? typesLeft.splice(Math.floor(Math.random() * typesLeft.length), 1)[0]
          : card.cardType,
        isSelected: false,
        isSolved: card.isSolved,
      }))
    );

    console.log(newGameField);

    return newGameField;
  };

  const onFieldShuffle = () => {
    let updatedField = undefined;
    let updatedSolution = undefined;
    do {
      updatedField = getReshuffledField(gameField);
      updatedSolution = getExistingSolutions(updatedField);
    } while (updatedSolution === undefined);
    setExistingSolution(updatedSolution);

    setGameField(updatedField);
  };

  useEffect(() => {
    setExistingSolution(getExistingSolutions(gameField));
  }, []);

  const onShowHint = () => {
    setShowHint(true);
  };

  return {
    gameField,
    selectFieldTile,
    existingSolution,
    onShowHint,
    showHint,
    onFieldShuffle,
  };
};
