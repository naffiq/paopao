import { useEffect, useState } from "react";
import { FieldTile, GameField, Directions } from "../types/GameField";

const DIMENSIONS_Y = window.outerWidth > window.outerHeight ? 9 : 16;
const DIMENSIONS_X = window.outerWidth > window.outerHeight ? 16 : 9;
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

export const useGameField = (onWin: () => void) => {
  const [gameField, setGameField] = useState<GameField>(generateMap());
  const [showHint, setShowHint] = useState(false);
  const [couplesFound, setCouplesFound] = useState(0);

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

  /**
   *
   * @param x
   * @param y
   * @param isSelected
   */
  const setFieldSelected = (x: number, y: number, isSelected: boolean) => {
    updateFieldTile(x, y, {
      ...gameField[y][x],
      isSelected,
    });
  };

  /**
   * Checks if the tile can be selected and updates the state of the board
   *
   * @param x coordinates of the field
   * @param y coordinates of the field
   * @returns
   */
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
    }
  };

  /**
   * Updates the field and removes selection of tiles. If `isSolved === true` then hides the tiles.
   * If the resulted field does not have any solutions it will be reshuffled until one was found.
   *
   * @param isSolved
   */
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
      setCouplesFound(couplesFound + 1);

      if (couplesFound === (DIMENSIONS_X * DIMENSIONS_Y) / 2 - 1) {
        updatedField = generateMap();
        onWin();
      }
      let updatedSolution = getExistingSolutions(updatedField);

      while (updatedSolution === undefined) {
        updatedField = getReshuffledField(updatedField);
        updatedSolution = getExistingSolutions(updatedField);
      }
      setExistingSolution(updatedSolution);
    }

    setGameField(updatedField);
  };

  /**
   * Check if tiles can be solved by finding the shortest path between them in terms of turns to be made.
   * @param tile1Coords Coordinates of the first tile on the field in the state
   * @param tile2Coords Coordinates of the second tile on the field in the state
   * @returns
   */
  const canCrossTiles = (
    { x: x1, y: y1 }: Coords,
    { x: x2, y: y2 }: Coords
  ) => {
    // Initialize paths from first tiles as infinity (or close) with extra space for path finding
    const paths = new Array(DIMENSIONS_Y + 1)
      .fill(null)
      .map(() => new Array(DIMENSIONS_X).fill(999));
    // Add outer dimension to the paths as the paths can go outside of the field
    paths[-1] = new Array(DIMENSIONS_X).fill(999);

    /**
     * Crawls through adjacent tiles recursively and updates closest paths if possible
     *
     * @param direction   Initial direction of the movement. Each change of the direction increases
     * @param x           coordinates of the tile in current iteration
     * @param y           coordinates of the tile in current iteration
     * @param turns       number of turns made to reach the tile
     * @void           the function updates `paths` array and does not return anything
     */
    const drawPath = (
      direction: Directions,
      x: number,
      y: number,
      turns: number
    ) => {
      // break the function execution
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

  /**
   * Check solution after both tiles have been selected by player
   */
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

  /**
   * Finds all tile couples on given fields and returns first solution as an array of coordinates of two tiles.
   *
   * @param gameField
   * @returns
   */
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

  /**
   * Returns new version of the given field by reshuffling existing tiles. Used when player has no solutions available.
   *
   * @param gameField GameField object composed of rows and tiles inside them
   * @returns
   */
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

    return newGameField;
  };

  /**
   * Initial hint preparation
   */
  useEffect(() => {
    setExistingSolution(getExistingSolutions(gameField));
  }, []);

  /**
   * Show two tiles that could be solved. Untoggles once player selects both of them.
   */
  const onShowHint = () => {
    setShowHint(true);
  };

  return {
    gameField,
    selectFieldTile,
    existingSolution,
    onShowHint,
    showHint,
    couplesFound,
  };
};
