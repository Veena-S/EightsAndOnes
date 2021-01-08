/**
 *
 * Controller helper functions
 */

// Constants representing the traverse paths
// Used while finding inner loop traversing paths
const traversePathDirections = Object.freeze({
  // Anti-clockwise
  TOP_ROW_RIGHT_TO_LEFT: 0,
  LEFT_COL_TOP_TO_BOTTOM: 1,
  BOTTOM_ROW_LEFT_TO_RIGHT: 2,
  RIGHT_COL_BOTTOM_TO_TOP: 3,
  // Clockwise
  RIGHT_COL_TOP_TO_BOTTOM: 4,
  BOTTOM_ROW_RIGHT_TO_LEFT: 5,
  LEFT_COL_BOTTOM_TO_TOP: 6,
  TOP_ROW_LEFT_TO_RIGHT: 7,
  // CentrePosition
  CENTRE_POS: 8,
});

// Function to get a random value in the range of 0 (including) to maxValue(excluding)
const getRandomValue = (maxSize) => Math.floor(Math.random() * maxSize);

const DICE_COUNT = 4;

const calculateTotalDiceValue = (rolledValues) => {
  const sum = rolledValues.reduce((total, current) => total + current, 0);
  // 0 or 1. 0 is considered to be inner side
  switch (sum)
  {
    case 0: { return 4; } // 0000 => rolled value is 4 => sum = 0
    case 1: { return 3; } // 0001 => rolled value is 3 => sum = 1
    case 2: { return 2; } // 0011 => rolled value is 2 => sum = 2
    case 3: { return 1; } // 0111 => rolled value is 1 => sum = 3
    case 4: { return 8; } // 1111 => rolled value is 8 => sum = 4
    default: { return 0; }
  }
};

/**
 * Function that rolls the dice sticks
 */
const rollDiceSticks = () => {
  const maxSize = 2;
  const rolledValues = [];
  for (let index = 0; index < DICE_COUNT; index += 1)
  {
    // 0 or 1. 0 is considered to be inner side
    rolledValues.push((getRandomValue(maxSize)));
  }
  const totalDicedValue = calculateTotalDiceValue(rolledValues);
  return { rolledValues, totalDicedValue };
};

/**
 * Function that maps a player to an entry position in the board
 * @param playersList - list of players
 * @param boardEntryPoints - list of entry points in the
 */
const mapPlayerToEntryPoints = (playerTokenArray, playersList, boardEntryPoints) => {
  const playersEntryPoint = {};
  const playerCount = playerTokenArray.length;
  Object.keys(boardEntryPoints).forEach((key, index) => {
    if (index < (playerCount))
    {
      // player id to {entry point, player email} mapping
      playersEntryPoint[playerTokenArray[index].playerId] = {
        playerEmail: playerTokenArray[index].playerEmail,
        entryPoint: boardEntryPoints[key],
      };
    }
  });
  return playersEntryPoint;
};

/**
 * Function that identifies the 4 entry points and the centre point
 * All points are stored as an array of row and column indices i.e. [row, col]
 * @param boardSize - Size of the board in the current game
 *
 * Example: n x n; n=5
 *
 * --------|---------|---------|----------|-------------|
 * 0,0     | 0,1     | 0,2     | 0,3      | 0,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * 1,0     | 1,1     | 1,2     | 1,3      | 1,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * 2,0     | 2,1     | 2,2     | 2,3      | 2,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * 3,0     | 3,1     | 3,2     | 3,3      | 3,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * (n-1),0 | (n-1),1 | (n-1),2 | (n-1),3  | (n-1),(n-1) |
 * --------|---------|---------|----------|-------------|
 *
 *
 *   (0,0)        -->   (0, (n-1)/2)       -->  (0, n-1)
 *     |                      |                     |
 *   ((n-1)/2, 0) -->  ((n-1)/2, (n-1)/2)  --> (n-1)/2, (n-1)
 *     |                      |                     |
 *   (n-1, 0)     -->  ((n-1), (n-1)/2)    --> (n-1), (n-1)
 */
const findBoardCornersAndEntryPositions = (boardSize) => {
  const topLeftPos = [0, 0];
  const topCentrePos = [0, (boardSize - 1) / 2]; // Entry point
  const topRightPos = [0, boardSize - 1];

  const leftCentrePos = [(boardSize - 1) / 2, 0]; // Entry point
  const centrePos = [(boardSize - 1) / 2, (boardSize - 1) / 2]; // Final Position
  const rightCentrePos = [(boardSize - 1) / 2, (boardSize - 1)]; // Entry point

  const bottomLeftPos = [(boardSize - 1), 0];
  const bottomCentrePos = [(boardSize - 1), (boardSize - 1) / 2]; // Entry Point
  const bottomRightPos = [(boardSize - 1), (boardSize - 1)];

  return {
    Corners: {
      topLeftPos,
      topRightPos,
      bottomLeftPos,
      bottomRightPos,
    },
    EntryPoints: {
      topCentrePos,
      leftCentrePos,
      rightCentrePos,
      bottomCentrePos,
    },
    FinalPos: centrePos,
  };
};

/**
 * Function that checks whether the current cell is a safe sell or not
 * Safe cell => all the entry positions and the final central position
 * @param currentCellPos - cell to be verified. [row, col]
 * @param BoardCornersAndSafePos - Positions calcualted in the function
 *                                findBoardCornersAndEntryPositions
 */
const isSafeCellPos = (currentCellPos, BoardCornersAndSafePos) => {
  const currentCellPosString = currentCellPos.toString();
  if ((currentCellPosString === BoardCornersAndSafePos.EntryPoints.topCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.EntryPoints.leftCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.EntryPoints.bottomCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.EntryPoints.rightCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.FinalPos.toString()))
  {
    return true;
  }
  return false;
};

/**
 * Function return true if the cell specified is at the centre cell. i.e. final position
 * @param currentCellPos - current position of a token
 * @param BoardCornersAndSafePos
 */
const isCentreCell = (currentCellPos, BoardCornersAndSafePos) => {
  const currentCellPosString = currentCellPos.toString();
  if ((currentCellPosString === BoardCornersAndSafePos.FinalPos.toString()))
  {
    return true;
  }
  return false;
};

/**
 * General function to find the path of each inner loop, for irrespective of entry points
 * Inner loop traversal is always clockwise
 * @param startingIndex - lowest index for the current loop
 * @param endingIndex - highest index for the current loop
 * @param pathPosArray - Holds the positions that the tokens will traverse for the current loop
 * @param traverseDirectionsArray - Array that holds the order of inner loop direction
 */
const findInnerLoopPaths = (startingIndex, endingIndex, pathPosArray, traverseDirectionsArray) => {
  console.log('findInnerLoopPaths');
  console.log(`${pathPosArray}`);
  let rowIndex = startingIndex;
  let colIndex = endingIndex;
  traverseDirectionsArray.forEach((direction) => {
    switch (direction) {
      case traversePathDirections.RIGHT_COL_TOP_TO_BOTTOM:
      {
        rowIndex = startingIndex;
        colIndex = endingIndex;
        // path of movement is in the last column
        // from (start, end) to (end, end)
        for (;rowIndex <= endingIndex; rowIndex += 1)
        {
          pathPosArray.push([rowIndex, colIndex]);
        }
        break;
      }
      case traversePathDirections.BOTTOM_ROW_RIGHT_TO_LEFT:
      {
        // bottom row of the loop
        // from (end, end) to (end, start)
        // Since (end, end) is already added, duplicate can be removed later
        rowIndex = endingIndex;
        for (colIndex = endingIndex; colIndex >= startingIndex; colIndex -= 1)
        {
          pathPosArray.push([rowIndex, colIndex]);
        }
        break;
      }
      case traversePathDirections.LEFT_COL_BOTTOM_TO_TOP:
      {
        //  left column
        // from (end, start) to (start, start)
        // Since (end, start) is already added, update the row index
        colIndex = startingIndex;
        for (rowIndex = endingIndex; rowIndex >= startingIndex; rowIndex -= 1)
        {
          pathPosArray.push([rowIndex, colIndex]);
        }
        break;
      }
      case traversePathDirections.TOP_ROW_LEFT_TO_RIGHT:
      {
        // top row
        // From (start, start) to (start, end)
        // Since, both these values are already added, it will be from
        // (start, start + 1) to (start, end-1)
        rowIndex = startingIndex;
        for (colIndex = startingIndex; colIndex <= endingIndex; colIndex += 1)
        {
          pathPosArray.push([rowIndex, colIndex]);
        }
        break;
      }
      case traversePathDirections.CENTRE_POS:
      {
        if (startingIndex === endingIndex)
        {
          pathPosArray.push([startingIndex, endingIndex]);
        }
        break;
      }
      default:
      {
        break;
      }
    }
  });
  return pathPosArray;
};

/**
 * Function that calculates the whole traverse path for a token which entres at Centre top position
 * @param boardSize - size of the board
 * @param itrLoop - iteration count of the current loop
 * @param topCentrePoint - Entry point which is at top-centre position
 * @param pathPosArray - Holds the positions that the tokens will traverse
 */
const findPathForTopCentrePoint = (boardSize, itrLoop, topCentrePoint, pathPosArray) => {
  console.log('findPathForTopCentrePoint');

  const lastLoopIterationIndex = (boardSize - 1) / 2;

  console.log(`loop iteration: ${itrLoop}`);
  console.log(`topCentrePoint: ${topCentrePoint}`);
  console.log(`topCentrePoint is Array: ${Array.isArray(topCentrePoint)}`);
  console.log(`pathPosArray:${pathPosArray}`);
  console.log(`pathPosArray is Array:${Array.isArray(pathPosArray)}`);

  const startingIndex = itrLoop;
  const endingIndex = boardSize - 1 - startingIndex;
  if (itrLoop === 0)
  {
    pathPosArray.push(topCentrePoint); // Starting Point = (0, (n-1)/2)
    console.log(`pathPosArray-topCentrePoint added:${pathPosArray}`);

    // Move Anti-clockwise ==> Outer Loop
    // Reduce the column index until it reaches the corner pos (0,0)
    let rowIndex = startingIndex;
    let colIndex = 0;
    for (colIndex = topCentrePoint[1] - 1; colIndex >= startingIndex; colIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
      console.log(`pathPosArray:${pathPosArray}`);
    }
    // From (0,0) to (n-1,0) ==> left most column
    rowIndex = startingIndex + 1; // Since (0,0) is already in the array
    colIndex = startingIndex;
    console.log(`${rowIndex}-${colIndex}`);
    for (;rowIndex <= endingIndex; rowIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
      console.log(`pathPosArray:${pathPosArray}`);
    }

    // Bottom row -> from (n-1,0) to (n-1, n-1)
    rowIndex = endingIndex;
    colIndex = startingIndex + 1; // Since (n-1, 0) is already added
    console.log(`${rowIndex}-${colIndex}`);
    for (;colIndex <= endingIndex; colIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
      console.log(`pathPosArray:${pathPosArray}`);
    }

    // Right most column --> From (n-1, n-1) to (0, n-1)
    rowIndex = endingIndex - 1;
    colIndex = endingIndex;
    console.log(`${rowIndex}-${colIndex}`);
    for (; rowIndex >= startingIndex; rowIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
      console.log(`pathPosArray:${pathPosArray}`);
    }

    rowIndex = startingIndex;
    console.log(`${rowIndex}-${colIndex}`);
    // Add one more cell from where the inner loop starts
    pathPosArray.push([rowIndex, colIndex - 1]);
    console.log(`pathPosArray:${pathPosArray}`);
  }
  else if (itrLoop === lastLoopIterationIndex)
  {
    pathPosArray.push([startingIndex, endingIndex]);
    console.log(`pathPosArray:${pathPosArray}`);
  }
  else {
    // If it is not the outer loop and not the final iteration, which will be the board centre
    const traverseDirections = [traversePathDirections.RIGHT_COL_TOP_TO_BOTTOM,
      traversePathDirections.BOTTOM_ROW_RIGHT_TO_LEFT,
      traversePathDirections.LEFT_COL_BOTTOM_TO_TOP,
      traversePathDirections.TOP_ROW_LEFT_TO_RIGHT];
    // eslint-disable-next-line no-param-reassign
    findInnerLoopPaths(startingIndex, endingIndex, pathPosArray, traverseDirections);

    console.log(`Outside findInnerPaths - ${pathPosArray}`);
  }

  return pathPosArray;
};

/**
 * Function that calculates the whole traverse path for a token which entres at Centre Left position
 * @param boardSize - size of the board
 * @param itrLoop - iteration count of the current loop
 * @param leftCentrePoint - Entry point which is at left-centre position
 * @param pathPosArray - Holds the positions that the tokens will traverse
 */
const findPathForLeftCentrePoint = (boardSize, itrLoop, leftCentrePoint, pathPosArray) => {
  console.log('findPathForLeftCentrePoint');

  const lastLoopIteration = (boardSize - 1) / 2;

  const startingIndex = itrLoop;
  const endingIndex = boardSize - 1 - startingIndex;
  if (itrLoop === 0)
  {
    pathPosArray.push(leftCentrePoint); // ((n-1)/2, 0)
    // Move Anti-clockwise ==> Outer Loop
    let rowIndex = 0;
    let colIndex = 0;
    // first move down
    // from ((n-1)/2, start) to (end, start)
    // since ((n-1)/2, start) is already added, start from next
    for (rowIndex = leftCentrePoint[0] + 1; rowIndex <= endingIndex; rowIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // second move right along bottom row
    // from (end, start) to (end, end)
    // Since (end, start) is already added above, starting point is (end, start + 1)
    rowIndex = endingIndex;
    for (colIndex = startingIndex + 1; colIndex <= endingIndex; colIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // third move up along right column
    // from (end, end) to (start, end)
    // Since (end, end) is already added above, starting point is (end-1, end)
    colIndex = endingIndex;
    for (rowIndex = endingIndex - 1; rowIndex >= startingIndex; rowIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // fourth move left along top row
    // from (start, end) to (start, start)
    // Since (start, end) is already added above, starting point is (start, end-1)
    rowIndex = startingIndex;
    for (colIndex = endingIndex - 1; colIndex >= startingIndex; colIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // Add one more cell from where the inner loop starts
    // (start + 1, start)
    colIndex = startingIndex;
    pathPosArray.push([rowIndex + 1, colIndex]);
  }
  else if (itrLoop === lastLoopIteration)
  {
    pathPosArray.push([startingIndex, endingIndex]);
  }
  else {
    // If it is not the outer loop and not the final iteration, which will be the board centre
    const traverseDirections = [
      traversePathDirections.TOP_ROW_LEFT_TO_RIGHT,
      traversePathDirections.RIGHT_COL_TOP_TO_BOTTOM,
      traversePathDirections.BOTTOM_ROW_RIGHT_TO_LEFT,
      traversePathDirections.LEFT_COL_BOTTOM_TO_TOP,
    ];
    findInnerLoopPaths(startingIndex, endingIndex, pathPosArray, traverseDirections);
  }

  return pathPosArray;
};

/**
 * Function that calculates the whole traverse path for a token which entres at
 * Centre Bottom position
 * @param boardSize - size of the board
 * @param itrLoop - iteration count of the current loop
 * @param bottomCentrePoint - Entry point which is at bottom-centre position
 * @param pathPosArray - Holds the positions that the tokens will traverse
 */
const findPathForBottomCentrePoint = (boardSize, itrLoop, bottomCentrePoint, pathPosArray) => {
  console.log('findPathForBottomCentrePoint');

  const lastLoopIteration = (boardSize - 1) / 2;

  const startingIndex = itrLoop;
  const endingIndex = boardSize - 1 - startingIndex;
  if (itrLoop === 0)
  {
    pathPosArray.push(bottomCentrePoint);
    // Move Anti-clockwise ==> Outer Loop
    let rowIndex = endingIndex;
    let colIndex = 0;
    // first move right along bottom row
    // from ((n-1)/2, (n-1)/2) to (end, end)
    // since ((n-1)/2, (n-1)/2) is already added, start from next
    for (colIndex = bottomCentrePoint[1] + 1; colIndex <= endingIndex; colIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // second move up along right column
    // from (end, end) to (start, end)
    // Since (end, end) is already added above, starting point is (end-1, end)
    colIndex = endingIndex;
    for (rowIndex = endingIndex - 1; rowIndex >= startingIndex; rowIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // third move left along top row
    // from (start, end) to (start, start)
    // Since (start, end) is already added above, starting point is (start, end-1)
    rowIndex = startingIndex;
    for (colIndex = endingIndex - 1; colIndex >= startingIndex; colIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // fourth move down along left column
    // from (start, start) to (end, start)
    // Since (start, start) is already added above, starting point is (start + 1, start)
    colIndex = startingIndex;
    for (rowIndex = startingIndex + 1; rowIndex <= endingIndex; rowIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // Add one more cell from where the inner loop starts
    // (end, start+1)
    rowIndex = endingIndex;
    pathPosArray.push([rowIndex, colIndex + 1]);
  }
  else if (itrLoop === lastLoopIteration)
  {
    pathPosArray.push([startingIndex, endingIndex]);
  }
  else {
    // If it is not the outer loop and not the final iteration, which will be the board centre
    const traverseDirections = [
      traversePathDirections.LEFT_COL_BOTTOM_TO_TOP,
      traversePathDirections.TOP_ROW_LEFT_TO_RIGHT,
      traversePathDirections.RIGHT_COL_TOP_TO_BOTTOM,
      traversePathDirections.BOTTOM_ROW_RIGHT_TO_LEFT,
    ];
    findInnerLoopPaths(startingIndex, endingIndex, pathPosArray, traverseDirections);
  }

  return pathPosArray;
};

/**
 * Function that calculates the whole traverse path for a token which entres at
 * Centre Right position
 * @param boardSize - size of the board
 * @param itrLoop - iteration count of the current loop
 * @param rightCentrePoint - Entry point which is at right-centre position
 * @param pathPosArray - Holds the positions that the tokens will traverse
 */
const findPathForRightCentrePoint = (boardSize, itrLoop, rightCentrePoint, pathPosArray) => {
  console.log('findPathForRightCentrePoint');

  const lastLoopIteration = (boardSize - 1) / 2;

  const startingIndex = itrLoop;
  const endingIndex = boardSize - 1 - startingIndex;
  if (itrLoop === 0)
  {
    pathPosArray.push(rightCentrePoint);

    // Move Anti-clockwise ==> Outer Loop
    let rowIndex = 0;
    let colIndex = endingIndex;
    // first move up along right column
    // from ((n-1)/2, (n-1)) to (start, end)
    // since ((n-1)/2, (n-1)) is already added, start from next
    for (rowIndex = rightCentrePoint[0] - 1; rowIndex >= startingIndex; rowIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // second move left along top row
    // from (start, end) to (start, start)
    // Since (start, end) is already added above, starting point is (start, end-1)
    rowIndex = startingIndex;
    for (colIndex = endingIndex - 1; colIndex >= startingIndex; colIndex -= 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // third move down along left column
    // from (start, start) to (end, start)
    // Since (start, start) is already added above, starting point is (start + 1, start)
    colIndex = startingIndex;
    for (rowIndex = startingIndex + 1; rowIndex <= endingIndex; rowIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // fourth move right along bottom row
    // from (end, start) to (end, end)
    // Since (end, start) is already added above, starting point is (end, start + 1)
    rowIndex = endingIndex;
    for (colIndex = startingIndex + 1; colIndex <= endingIndex; colIndex += 1)
    {
      pathPosArray.push([rowIndex, colIndex]);
    }

    // Add one more cell from where the inner loop starts
    // (end-1, end)
    colIndex = endingIndex;
    pathPosArray.push([rowIndex - 1, colIndex]);
  }
  else if (itrLoop === lastLoopIteration)
  {
    pathPosArray.push([startingIndex, endingIndex]);
  }
  else {
    // If it is not the outer loop and not the final iteration, which will be the board centre
    const traverseDirections = [
      traversePathDirections.BOTTOM_ROW_RIGHT_TO_LEFT,
      traversePathDirections.LEFT_COL_BOTTOM_TO_TOP,
      traversePathDirections.TOP_ROW_LEFT_TO_RIGHT,
      traversePathDirections.RIGHT_COL_TOP_TO_BOTTOM,
    ];
    findInnerLoopPaths(startingIndex, endingIndex, pathPosArray, traverseDirections);
  }

  return pathPosArray;
};

/**
 * Function to find the cells at which the loops are changed
 * @param boardSize - size of the board
 * @param boardCornersAndSafePos - Major points in the board
 */
const findTraversePaths = (boardSize, boardCornersAndSafePos) => {
  // If the board size = N, there will be (N-1)/2 loops including the outer loop
  // and excluding the final position
  // ((N-1)/2) + 1) th iteration takes the token into the final position
  const totalNumOfLoops = (boardSize - 1) / 2;
  /**
   * Sample traversePaths for a 5x5
   * For a 5x5
   {
     // For the topCentre
     0-3 : {
       <Loop0>: [EntryPoint , next cell...last cell in the loop]
       <Loop1>: []
       <Loop2>: []
       <Loop3>: [[row-col]]
     }
     // For the leftCentre
     3-0 : {} // similar to above
   }
   */
  const traversePaths = {};

  // Starting index = 0, Ending index = ((N-1)-<starting_index>)
  // For each inner loop, starting index increases by 1 and ending index decreases by 1
  Object.keys(boardCornersAndSafePos.EntryPoints).forEach((entryPoint) => {
    const entryPointString = boardCornersAndSafePos.EntryPoints[entryPoint].toString();
    let entryPointName = '';
    if (entryPointString === boardCornersAndSafePos.EntryPoints.topCentrePos.toString())
    {
      // Join the entrypoint in the format "row-column".
      entryPointName = boardCornersAndSafePos.EntryPoints.topCentrePos.join('-');
      // traversePaths[entryPointName] = {};
      traversePaths[entryPointName] = [];
      console.log(`traversePaths: ${traversePaths}`);
      console.log(`entryPointName:${entryPointName}`);
      console.log(`traversePaths[entryPointName].isArray: ${Array.isArray(traversePaths[entryPointName])}`);
      console.log(`boardCornersAndSafePos.EntryPoints.topCentrePos: ${boardCornersAndSafePos.EntryPoints.topCentrePos}`);
      for (let itrLoop = 0; itrLoop <= totalNumOfLoops; itrLoop += 1)
      {
        // const loopKey = `${itrLoop}`;
        // traversePaths.entryPointName[itrLoop] = findPathForTopCentrePoint(boardSize,
        //   itrLoop, BoardCornersAndSafePos.EntryPoints.topCentrePos,
        //   traversePaths.entryPointName[itrLoop]);

        traversePaths[entryPointName] = findPathForTopCentrePoint(boardSize,
          itrLoop, boardCornersAndSafePos.EntryPoints.topCentrePos,
          traversePaths[entryPointName]);
      }
    }
    else if (entryPointString === boardCornersAndSafePos.EntryPoints.leftCentrePos.toString())
    {
      entryPointName = boardCornersAndSafePos.EntryPoints.leftCentrePos.join('-');
      traversePaths[entryPointName] = [];
      for (let itrLoop = 0; itrLoop <= totalNumOfLoops; itrLoop += 1)
      {
        // const loopKey = `${itrLoop}`;
        traversePaths[entryPointName] = findPathForLeftCentrePoint(boardSize,
          itrLoop, boardCornersAndSafePos.EntryPoints.leftCentrePos,
          traversePaths[entryPointName]);
      }
    }
    else if (entryPointString === boardCornersAndSafePos.EntryPoints.bottomCentrePos.toString())
    {
      entryPointName = boardCornersAndSafePos.EntryPoints.bottomCentrePos.join('-');
      traversePaths[entryPointName] = [];
      for (let itrLoop = 0; itrLoop <= totalNumOfLoops; itrLoop += 1)
      {
        // const loopKey = `${itrLoop}`;
        traversePaths[entryPointName] = findPathForBottomCentrePoint(boardSize,
          itrLoop, boardCornersAndSafePos.EntryPoints.bottomCentrePos,
          traversePaths[entryPointName]);
      }
    }
    else if (entryPointString === boardCornersAndSafePos.EntryPoints.rightCentrePos.toString())
    {
      entryPointName = boardCornersAndSafePos.EntryPoints.rightCentrePos.join('-');
      traversePaths[entryPointName] = [];
      for (let itrLoop = 0; itrLoop <= totalNumOfLoops; itrLoop += 1)
      {
        // const loopKey = `${itrLoop}`;
        traversePaths[entryPointName] = findPathForRightCentrePoint(boardSize,
          itrLoop, boardCornersAndSafePos.EntryPoints.rightCentrePos,
          traversePaths[entryPointName]);
      }
    }

    console.log(traversePaths[entryPointName].length);
    console.log(`pathPosArray - with duplicates: ${Array(traversePaths[entryPointName])}`);
    // Remove the duplicates from the array
    // As this is an array of arrays, following procedure is applied
    // First map the initial paths array to a string array
    const stringArray = traversePaths[entryPointName].map(JSON.stringify);
    // Create a set that removes the duplicate values
    const uniqueStringArray = new Set(stringArray);
    // Convert the unique string value array back to array of arrays
    traversePaths[entryPointName] = Array.from(uniqueStringArray);
    console.log(`pathPosArray - removing duplicates: ${traversePaths[entryPointName]}`);
  });
  return traversePaths;
};

/**
 * Function to check whether a position given is inside or outside the game board
 * @param posToCompare - [row,col] to be compared
 * @param boardSize - size of the board
 */
const isPosOutsideBoard = (posToCompare, boardSize) => {
  let bOutside = false;
  posToCompare.forEach((pos) => {
    if (!bOutside)
    {
      bOutside = ((pos < 0) || (pos >= boardSize));
    }
  });
  return bOutside;
};

/**
 * Function to check whether 2 cell positions are equal
 * @param firstCellPos - first cell
 * @param secondCellPos - second cell
 */
const areCellsEqual = (firstCellPos, secondCellPos) => {
  if (firstCellPos.length !== secondCellPos.length)
  {
    return false;
  }
  const { length } = firstCellPos;
  let bEqual = true;
  for (let counter = 0; counter < length; counter += 1)
  {
    if (firstCellPos[counter] !== secondCellPos[counter])
    {
      bEqual = false;
      break;
    }
  }
  return bEqual;
};

/**
 * Function to find the number of cells present between Source Cell and Target Cell.
 * Excludes the source cell and includes the target cell
 * @param sourceCell - cell after which the counting should start
 * @param targetCell - cell until which the counting should end
 * @param currentPlayerId - current player
 * @param currentBoardState - current board state of the game
 */
const countCellFromSourceToTargetInPath = (sourceCell, targetCell,
  currentPlayerId, currentBoardState) => {
  // Get the traverse path corresponding to the player's entry point
  const { entryPoint } = currentBoardState.playersEntryPoint[currentPlayerId];
  const traversePath = currentBoardState.traversePaths[entryPoint.join('-')];
  // Find the index of the source and target cells in the traverse path
  const sourceCellIndex = traversePath.findIndex(
    (pathCell) => (areCellsEqual(sourceCell, pathCell)),
  );
  if (sourceCellIndex === -1)
  {
    return 0;
  }
  // Find the index of target cell
  const targetCellIndex = traversePath.findIndex(
    (pathCell) => (areCellsEqual(targetCell, pathCell)),
  );
  if (targetCellIndex === -1)
  {
    return 0;
  }
  const cellCount = targetCellIndex - sourceCellIndex;
  if (cellCount <= 0)
  {
    return 0;
  }
  return cellCount;
};

/**
 *
 * Controller Section
 *
 */
/**
 *
 * @param db - instance of the db models
 */
export default function games(db) {
  /**
   * Function that handles the request to create a new game
   * @param request - HTTP request
   * @param response - HTTP response
   */
  const handleCreateGameRequest = async (request, response) => {
    console.log('handleCreateGameRequest');

    /**
     * boardSize = size of the board to be created
     * playerTokenArray = An array of objects that holds info on players and their selected tokens
     */
    console.log(request.body);
    const { boardSize, playerTokenArray, playersList } = request.body;
    console.log(`boardSize: ${boardSize}`);
    console.log(`playerTokenArray: ${playerTokenArray}`);
    console.log(`playersList: ${playersList}`);

    const boardCornersAndSafePos = findBoardCornersAndEntryPositions(boardSize);
    console.log(`boardCornersAndSafePos: ${boardCornersAndSafePos}`);

    const playersEntryPoint = mapPlayerToEntryPoints(playerTokenArray, playersList,
      boardCornersAndSafePos.EntryPoints);

    /*
      Create a new Game entry
      At the start of the game, no player tokens will be present inside the board
      It will hold the following data:
    */
    const newGameData = {
      boardState: {
        // size of the board selected for this game
        boardSize,
        // last played dice values
        lastDiceSet: [],
        // player who has thrown the dice last time
        lastPlayerId: -1,
        // player who will throw next after earlier players token movement
        nextPlayerId: playersList[0].id,
        // to hold the corners, entry points and central positions in the board
        // boardCornersAndSafePos{ Corners, EntryPoints,FinalPos}
        boardCornersAndSafePos,
        // To map the player and respective entry points.
        // For the time being, entry point is randomly chosen
        playersEntryPoint,
        // Represents the cell data through which a token will be travelling
        // through the game course
        // traversePaths{entry1:[], entry2:[], entry3:[], entry4:[]
        // entry key format: "row-col", which holds an array of cells
        traversePaths: findTraversePaths(boardSize, boardCornersAndSafePos),
        // Object that holds details of the cell in which atleast one token is present
        //  - tokens present in a cell and owner of those tokens
        // Cells that doesn't have any tokens will not be present in this object
        // From the token id, player information can be obtained from GamesUsers table
        tokenPositions: {},
      },
    };
    try {
      const newGame = await db.Game.create(newGameData);

      console.log(`newGame: ${newGame}`);

      // /**
      //  * To do: Delete
      //  */
      // let winID = newGame.winnerId;
      // winID = await newGame.getWinner();
      // winID = await newGame.setWinner(playersList[1].id);
      // console.log(winID);

      // Also create entries for the GamesUsers table
      const gameUsersTokenList = [];
      playerTokenArray.forEach((playerTokenInfo) => {
        const data = {
          GameId: newGame.id,
          UserId: playerTokenInfo.playerId,
          GameTokenId: playerTokenInfo.tokenId,
        };
        gameUsersTokenList.push(data);
      });
      const newGameUsers = await db.GamesUser.bulkCreate(gameUsersTokenList);
      console.log(newGameUsers);

      // Send the new Game Id and game data to the client
      response.status(200).send({
        gameStatus: 'success',
        msg: 'New game creation success!!',
        gameId: newGame.id,
        currentBoardState: newGame.boardState,
        gameUsersTokensList: newGameUsers,
      });
    }
    catch (error)
    {
      console.log(error);
      response.status(500).send({ gameStatus: 'error', msg: 'New game creation failed.' });
    }
  };

  /**
   * Function to validate the current player is same as the tokens player.
   * Also, verify the this player has the right to use that token in this game
   * @param gameId
   * @param currentPlayerId
   * @param tokenId
   * @param tokensPlayerId
   */
  const verifyPlayerAndTokensPlayer = async (gameId, currentPlayerId, tokenId, tokensPlayerId) => {
    console.log('verifyPlayerAndTokensPlayer');
    // Get the player info from the GameUsersTable
    const gameUserData = await db.GamesUser.findAll({
      where: { GameId: gameId, UserId: currentPlayerId, GameTokenId: tokenId },
    });
    if (undefined === gameUserData)
    {
      return ({ valid: false, msg: 'Validation failed. Player is not autorized to make this move.' });
    }
    // Validate the player - check whether the token belongs to the player whose turn it is
    if ((currentPlayerId !== tokensPlayerId))
    {
      return ({ isValid: false, msg: 'Validation failed. Token doesn\'t belong to the player.' });
    }
    return ({ isValid: true, msg: 'Player and token validation successfull.' });
  };

  /**
 * Function to identify the next player
 * @param gameId - Game id
 * @param currentPlayerId - The player currently rolled dice
 */
  const getNextPlayerId = async (gameId, currentPlayerId) => {
    console.log('getNextPlayerId');
    // Get the player info from the GameUsersTable
    const gameUserData = await db.GamesUser.findAll({ where: { GameId: gameId } });
    if (undefined === gameUserData)
    {
      return -1;
    }
    /**
     * From the returned data get the GameUsers Table id of the currentPlayerId
     * Then the player for the next id is considered to be the next player.
     * If the current player is the last of the list, first in the list will be the next player
     */
    const currentPlayerIndex = gameUserData.findIndex((data) => (data.UserId === currentPlayerId));
    if (currentPlayerIndex === -1)
    {
      return -1;
    }
    const nextPlayerIndex = (currentPlayerIndex === (gameUserData.length - 1))
      ? 0 : (currentPlayerIndex + 1);
    return gameUserData[nextPlayerIndex].UserId;
  };

  /**
   * Function that handing the request to roll dice by a player
   * @param request - request
   * @param response - response
   */
  const handlePlayRollingDiceSticks = async (request, response) => {
    console.log('handlePlayRollingDiceSticks');
    if (request.body === undefined)
    {
      response.status(400).send({ gameStatus: 'error', msg: 'Not enough data to proceed' });
      return;
    }
    const { gameId, currentPlayerId } = request.body;
    try
    {
      // get the game corresponding to the id given
      const currentGame = await db.Game.findByPk(gameId);
      if (currentGame === null || currentGame === undefined)
      {
        response.status(400).send({ gameStatus: 'error', msg: 'This game doesn\'t exists. Please Start the game' });
        return;
      }
      // Validate the current player is the one who is expected to be playing
      const expectedPlayerId = currentGame.boardState.nextPlayerId;
      if (currentPlayerId !== expectedPlayerId)
      {
        // Validation failed. Send error response.
        response.status(400).send({ gameStatus: 'error', msg: `Wrong Player. Expected player: ${currentGame.playersEntryPoint[expectedPlayerId].playerEmail}` });
        return;
      }
      // Player is valid
      // Throw the Dice and store that value in the database
      // Last and next players will also be updated, once the dice is thrown.
      // It will be updated only in 2 cases: when dice is thrown or when a player is won
      const rollingData = rollDiceSticks();
      const nextPlayerId = await getNextPlayerId(gameId, currentPlayerId);
      // const { boardState } = currentGame;
      // await currentGame.update({ boardState });
      await currentGame.update({
        boardState: {
          boardSize: currentGame.boardState.boardSize,
          lastDiceSet: rollingData.rolledValues, // updated value
          lastPlayerId: currentPlayerId, // updated Value
          nextPlayerId, // updated value
          boardCornersAndSafePos: currentGame.boardState.boardCornersAndSafePos,
          playersEntryPoint: currentGame.boardState.playersEntryPoint,
          traversePaths: currentGame.boardState.traversePaths,
          tokenPositions: currentGame.boardState.tokenPositions,
        },
      });

      response.status(200).send({
        gameStatus: 'success',
        msg: 'Dice played successfully!!',
        gameId: currentGame.id,
        currentBoardState: currentGame.boardState,
        totalDicedValue: rollingData.totalDicedValue,
      });
    }
    catch (err)
    {
      console.log(err);
      response.status(500).send({ gameStatus: 'error', msg: 'Failed to throw Rolling Dice Sticks' });
    }
  };

  /**
   * Function that performs the movement of token to the specified cell
   * and update the data in database
   * @param currentGame - Current Game model object
   * @param requestTokenData - Input token details
   * @param countOfCellsToMove - number of cell moving or the value
   *                    which is decreased from the remaining value
   *                    Useful in the case where the rolledValue is 4,
   *                    and moved cell count is 1, 2 or 3
   */
  const moveAndUpdateTokenData = async (currentGame, requestTokenData, countOfCellsToMove) => {
    try
    {
      /**
     * Values to be updated are
     * In requestTokenData,  remainingDiceValue, tokenCell position
     * In the game data -> tokenPositions
     */
      if (requestTokenData.remainingDiceValue < countOfCellsToMove)
      {
        // This checking is done to ensure that token is not moved when
        // it cannot find a matching position
        console.log('Remaining value to be moved is less than the actual value to be moved.');
        return undefined;
      }
      requestTokenData.remainingDiceValue -= countOfCellsToMove;
      requestTokenData.movedTokenData.currentPos = [...requestTokenData.targetCellPos];
      const tokenPos = requestTokenData.targetCellPos.join('-');

      // Check whether the target cell is a safe cell or not
      const bIsSafeCell = isSafeCellPos(requestTokenData.targetCellPos,
        currentGame.boardState.boardCornersAndSafePos);

      let bAddNewToken = false;
      let winnerId = null;
      let tokenExistingIndex = -1;
      // check for already exisiting tokens in the target cell
      const existingTokensList = currentGame.boardState.tokenPositions[tokenPos];
      if (undefined !== existingTokensList || existingTokensList.length === 0)
      {
        // Tokens are already present in it

        // Check whether same token is already stored in the cell
        tokenExistingIndex = existingTokensList.findIndex(
          (tokenPosInfo) => (tokenPosInfo.tokenId
            === requestTokenData.movedTokenData.tokenId),
        );
        // token is already present && a safe cell
        // Count the number of tokens present in the target cell for the same player.
        // Increment the count by 1
        if (bIsSafeCell && (tokenExistingIndex !== -1)) {
          currentGame.boardState.tokenPositions[tokenPos].tokenCount += 1;
          // check for winner
          // check whether the target cell is at the final centre position
          if (isCentreCell(requestTokenData.targetCellPos,
            currentGame.boardState.boardCornersAndSafePos))
          {
            // check how many of the same tokens are present in the central position.
          // if all 4 are there, current player is the winner. update the database with winnerId
            winnerId = (currentGame.boardState.tokenPositions[tokenPos].tokenCount === 4)
              ? requestTokenData.currentPlayerId : null;
          }
        }
        // Can be safe cell, but token not present. Add new token
        else if (bIsSafeCell && (tokenExistingIndex === -1)) {
          bAddNewToken = true;
        }
        // Not a safe cell, no token also
        else if (!bIsSafeCell && (tokenExistingIndex === -1)) {
          bAddNewToken = true;
        }
        else {
          // Not safe cell. Here, remove the old tokens from the tokenPos of game data
          // Same as adding new data
          // Send all the removing tokens to the client after updating the current Pos to -1,-1
          requestTokenData.removedTokens = [...existingTokensList];
          // Update the positions
          requestTokenData.removedTokens.forEach((tokenInfo) => {
            tokenInfo.oldPos = tokenInfo.currentPos;
            tokenInfo.currentPos = [-1, -1];
          });
          bAddNewToken = true;
        }
      }
      else {
        // this is the first token going to be in the cell
        bAddNewToken = true;
      }
      if (bAddNewToken)
      {
        // updated value
        // For each pos, it will be an array of tokens.
        // An array is kept considering the case of centre point and safe cells
        // A cell can have same players multiple tokens
        currentGame.boardState.tokenPositions[tokenPos] = [{
          playerdId: requestTokenData.currentPlayerId,
          tokenId: requestTokenData.movedTokenData.tokenId,
          tokenCount: 1,
        }];
      }

      // Update the game table

      const updatedGame = await currentGame.update({
        boardState: {
          ...currentGame.boardState,
          // // // tokenPositions: {
          // // //   [tokenPos]: [{
          // // //     playerdId: requestTokenData.currentPlayerId,
          // // //     tokenId: requestTokenData.movedTokenData.tokenId,
          // // //     tokenCount, // number of same token present in a cell
          // // //   }],
          // // // },
        },
        winnerId,
      });
      return updatedGame;
    }
    catch (error)
    {
      console.log(error);
      return undefined;
    }
  };

  // Function to remove the specified token from the source to outside the board
  const removeTokenFromBoard = async (currentGame, requestTokenData) => {
    try
    {
      const tokenPos = requestTokenData.movedTokenData.currentPos.join('-');
      // Exisiting list of tokens at that position
      const existingTokensList = currentGame.boardState.tokenPositions[tokenPos];
      // Check whether same token is already stored in the cell
      const tokenExistingIndex = existingTokensList.findIndex(
        (tokenPosInfo) => (tokenPosInfo.tokenId
            === requestTokenData.movedTokenData.tokenId),
      );
      if (tokenExistingIndex !== -1)
      {
        // If token has to be moved outside, remove the entry of this token from it's source cell
        // Remove this specific item from the array
        const removedItem = currentGame.boardState.tokenPositions[tokenPos]
          .splice(tokenExistingIndex, 1);
          // Update the current position of cell in both the items
        removedItem.oldPos = removedItem.currentPos;
        removedItem.currentPos = [-1, -1];
        requestTokenData.movedTokenData.currentPos = [-1, -1];
        if (undefined === requestTokenData.removedTokens)
        {
          requestTokenData.removedTokens = [removedItem];
        }
        else {
          requestTokenData.removedTokens.push(removedItem);
        }
      }
      const updatedGame = await currentGame.update({
        boardState: {
          ...currentGame.boardState,
        },
      });
      return updatedGame;
    }
    catch (error)
    {
      console.log(error);
      return undefined;
    }
  };

  /**
   * Function that validates the token movement requested and if success, update the db too
   * @param request
   * @param response
   */
  const handleValidateTokenMoveRequest = async (request, response) => {
    console.log('handleValidateTokenMoveRequest');
    try
    {
      const requestData = { ...request.body };
      requestData.removedTokens = [];
      // Get the game details
      const currentGame = await db.Game.findByPk(requestData.gameId);
      if (currentGame === null || currentGame === undefined)
      {
        response.status(400).send({ isValid: false, gameStatus: 'error', msg: 'This game doesn\'t exist. Please Start the game' });
        return;
      }
      // Validate the player - and tokens
      const validResult = await verifyPlayerAndTokensPlayer(requestData.gameId,
        requestData.currentPlayerId, requestData.movedTokenData.tokenId,
        requestData.movedTokenData.tokenBelongsTo);

      console.log(validResult.msg);
      if (!validResult.isValid)
      {
        response.status(400).send({ isValid: false, gameStatus: 'error', msg: validResult.msg });
        return;
      }
      // Is the source position is inside or outside the board?
      const isSrcOutsideBoard = isPosOutsideBoard(requestData.sourceCellPos);
      const isTargetOutsideBoard = isPosOutsideBoard(requestData.targetCellPos);
      // 1. outside to outside => Not Valid
      if (isSrcOutsideBoard && isTargetOutsideBoard)
      {
        response.status(200).send({ isValid: false, gameStatus: 'success', msg: 'Movement is not needed here' });
        return;
      }
      // 2. Outside to inside
      if (isSrcOutsideBoard && !isTargetOutsideBoard)
      {
        // Token can be moved from outside to inside, only if the rolled value is 1 or 4
        if (requestData.totalDicedValue !== 4 && requestData.totalDicedValue !== 1)
        {
          response.status(200).send({
            isValid: false,
            gameStatus: 'success',
            msg: 'Movement is not allowed. Roll value mosut be either 1 or 4',
          });
          return;
        }
        // if the roll value is 1
        if (requestData.totalDicedValue === 1)
        {
          // check and move the token to the target cell specified
          // As it's the entry and dice value is 1, target cell is entrypoint
          // Find the entry point for the player
          // eslint-disable-next-line max-len
          const expectedTargetCell = currentGame.boardState.playersEntryPoint[requestData.currentPlayerId].entryPoint;
          // check whether the expected and specified targets are same
          if (!areCellsEqual(expectedTargetCell, requestData.targetCellPos))
          {
            response.status(400).send({
              isValid: false,
              gameStatus: 'error',
              msg: `Token can't be moved to that cell. Rolled dice value is: ${requestData.totalDicedValue}. Place token in the entry cell.`,
            });
            return;
          }
          // Yes. Expected == Specified. Carry on with token movement
          const updatedGameData = await moveAndUpdateTokenData(currentGame,
            requestData, requestData.totalDicedValue);

          response.status(200).send({
            isValid: true,
            gameStatus: 'success',
            msg: 'Updated the token position.',
            gameId: updatedGameData.id,
            currentBoardState: updatedGameData.boardState,
            totalDicedValue: requestData.totalDicedValue,
            remainingDiceValue: requestData.remainingDiceValue,
            movedTokenData: requestData.movedTokenData,
            removedTokens: requestData.removedTokens,
            winnerId: updatedGameData.winnerId,
          });
          return;
        }
        // if (requestData.totalDicedValue === 4)
        // Is this as part of a new roll dice or continuation of a previous throw?
        // const isFirstMovementAfterRoll = (requestData.totalDicedValue
        //                                 === requestData.remainingDiceValue);
        // Mainly applicable for value = 4
        // Player can choose any value between 1 and 4, both values including
        // Validate the specified target cell comes under the remainingDiceValue
        const numOfCellsToTarget = countCellFromSourceToTargetInPath(requestData.sourceCellPos,
          requestData.targetCellPos, requestData.currentPlayerId, currentGame.boardState);
        if ((numOfCellsToTarget === 0) || (numOfCellsToTarget > requestData.remainingDiceValue))
        {
          // Number of cells between source and target is greater than
          // the maximum allowed cell count.
          // Send failure response
          response.status(400).send({
            isValid: false,
            gameStatus: 'error',
            msg: 'Target position exceeds the rolled dice value.',
          });
          return;
        }

        // The target position specified is correct.
        // Move the token to the target cell and update db
        const updatedGameData = await moveAndUpdateTokenData(currentGame,
          requestData, numOfCellsToTarget);
        response.status(200).send({
          isValid: true,
          gameStatus: 'success',
          msg: 'Updated the token position.',
          gameId: updatedGameData.id,
          currentBoardState: updatedGameData.boardState,
          totalDicedValue: requestData.totalDicedValue,
          remainingDiceValue: requestData.remainingDiceValue,
          movedTokenData: requestData.movedTokenData,
          removedTokens: requestData.removedTokens,
          winnerId: updatedGameData.winnerId,
        });
        return;
      }
      // 3. If both are inside
      if (!isSrcOutsideBoard && !isTargetOutsideBoard)
      {
        // If source and target are inside, just move the token from the source by the dice value
        // Check whether (source cell + dice value ) = target cell
        const numOfCellsToTarget = countCellFromSourceToTargetInPath(requestData.sourceCellPos,
          requestData.targetCellPos, requestData.currentPlayerId, currentGame.boardState);
        if ((numOfCellsToTarget === 0) || (numOfCellsToTarget > requestData.totalDicedValue))
        {
          // Number of cells between source and target is greater than
          // the maximum allowed cell count.
          // Send failure response
          response.status(400).send({
            isValid: false,
            gameStatus: 'error',
            msg: 'Target position exceeds the rolled dice value.',
          });
          return;
        }
        // The target position specified is correct.
        // Move the token to the target cell and update db
        const updatedGameData = await moveAndUpdateTokenData(currentGame,
          requestData, requestData.totalDicedValue);
        response.status(200).send({
          isValid: true,
          gameStatus: 'success',
          msg: 'Updated the token position.',
          gameId: updatedGameData.id,
          currentBoardState: updatedGameData.boardState,
          totalDicedValue: requestData.totalDicedValue,
          remainingDiceValue: requestData.remainingDiceValue,
          movedTokenData: requestData.movedTokenData,
          removedTokens: requestData.removedTokens,
          winnerId: updatedGameData.winnerId,
        });
        return;
      }
      // 4. From inside to outside
      if (!isSrcOutsideBoard && isTargetOutsideBoard)
      {
        // This movement of token is not as per the dice value
        // If the current player is same as that of the tokens player,
        // this movement is allowed. At this point of time, currentPlayer to tokenOwner
        // verification is done and it will be valid
        const updatedGameData = await removeTokenFromBoard(currentGame, requestData);
        response.status(200).send({
          isValid: true,
          gameStatus: 'success',
          msg: 'Updated the token position.',
          gameId: updatedGameData.id,
          currentBoardState: updatedGameData.boardState,
          totalDicedValue: requestData.totalDicedValue,
          remainingDiceValue: requestData.remainingDiceValue,
          movedTokenData: requestData.movedTokenData,
          removedTokens: requestData.removedTokens,
          winnerId: updatedGameData.winnerId,
        });
        return;
      }
    }
    catch (error)
    {
      console.log(error);
      response.status(500).send({ gameStatus: 'error', msg: 'Validation failed' });
    }
  };

  return {
    handleCreateGameRequest,
    handlePlayRollingDiceSticks,
    // handleMoveTokensRequest,
    handleValidateTokenMoveRequest,
  };
}
