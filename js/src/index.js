import axios from 'axios';
import { image } from 'faker';
import './styles.scss';

const PLAYER_COUNT_COMBO_ID = 'player-count';
const BOARD_SIZE_COMBO_ID = 'board-size';
let gameTokensList = null;
let playersList = null; // id, email
let currentBoardState = null; // Current State of the board
let gameUsersTokensList = null; // Array[Mapping of gameId - PlayerId - TokenID]
let gameId = -1; // Current game's id
let totalDicedValue = 0; // recently played dice value

const setGameIdAndBoardState = (data) => {
  gameId = data.gameId;
  currentBoardState = data.currentBoardState;
  if (data.gameUsersTokensList !== undefined || data.gameUsersTokensList !== null)
  {
    gameUsersTokensList = data.gameUsersTokensList;
  }
};

// Comparing 2 arrays having [row, col]
const comparePositionArrays = (firstPosArray, secondPosArray) => {
  if (!Array.isArray(firstPosArray) || !Array.isArray(secondPosArray))
  {
    return false;
  }
  // length should be equal
  if (firstPosArray.length !== secondPosArray.length)
  {
    return false;
  }
  let bFound = true;
  firstPosArray.forEach((first, index) => {
    console.log(`first:${first}`);
    console.log(`secondPosArray[index]:${secondPosArray[index]}`);
    if (secondPosArray[index] !== first)
    {
      bFound = false;
    }
  });
  return bFound;
};

/**
 * Function to find the token id and image path for a player
 * @param {Numeric} playerId - Player id
 */
const findTokenDetailsForPlayer = (playerId) => {
  // console.log(`gameUsersTokensList: ${gameUsersTokensList}, playerId: ${playerId}`);
  // gameUsersTokensList.forEach((item, index) => {
  //   console.log(`gameUsersTokensList-${index}, value: ${item}`);
  //   console.log(`gameUsersTokensList-${index}-Keys, value: ${Object.keys(item)}`);
  // });

  // eslint-disable-next-line max-len
  const gameUserTokenData = gameUsersTokensList.find((element) => (Number(element.UserId) === Number(playerId)));

  // console.log(`gameUserTokenData: ${gameUserTokenData}`);

  if (undefined === gameUserTokenData)
  {
    return undefined;
  }
  // Check for the token id in gameTokensList
  const gameToken = gameTokensList.find((token) => (token.id === gameUserTokenData.GameTokenId));
  return gameToken;
};

/**
 * Function that creates the select element with the options specified
 * @param {Array} tokensList - Array of object that holds the specification for options
 *                            - Option object is supposed to contain:
 *                            - {id, imageFilePath}
 * @param {Number} playerIndex - Specifies the index of the player to whom the combo list made
 */
const createTokenSelectionList = (tokensList, playerIndex) => {
  const divComboGameToken = document.createElement('div');
  divComboGameToken.classList.add('div-combo-game-token');

  const idValue = `game-token-${playerIndex}`;

  // create label element also
  const labelGameTokens = document.createElement('label');
  const labelValue = document.createTextNode(`Game Tokens for player - ${playerIndex + 1}`);
  labelGameTokens.setAttribute('for', idValue);
  labelGameTokens.appendChild(labelValue);
  divComboGameToken.appendChild(labelGameTokens);

  const selectElement = document.createElement('select');
  selectElement.setAttribute('id', idValue);
  selectElement.classList.add('game-token');

  // Create options
  tokensList.forEach((singleToken, index) => {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', singleToken.id);
    // optionElement.setAttribute('value', `option-${index}`);

    optionElement.style.background = `url(${singleToken.imageFilePath}) center contain no-repeat`;

    const imgEl = document.createElement('img');
    imgEl.setAttribute('src', singleToken.imageFilePath);
    optionElement.appendChild(imgEl);
    // optionElement.innerHTML = imgEl;
    selectElement.appendChild(optionElement);
  });
  divComboGameToken.appendChild(selectElement);

  return divComboGameToken;
};

/**
 * Function that displays the select list of tokens for each player
 */
const displayTokenList = () => {
  const playerCountSelected = document.getElementById(PLAYER_COUNT_COMBO_ID).value;
  for (let counter = 0; counter < playerCountSelected; counter += 1)
  {
    // For each player create a combo list of tokens
    const divTokens = createTokenSelectionList(gameTokensList, counter);
    document.body.appendChild(divTokens);
  }
};

/**
 * Function that gets a set of random users from the server
 */
const selectRandomPlayers = () => {
  axios.get('/all-users')
    .then((response) => {
      console.log(response);
      // handle success
      console.log(response.data);
      playersList = response.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Function to create the select list for Player count
 */
const createPlayerCountCombo = () => {
  const divComboPlayerCount = document.getElementById('div-combo-player-count');

  // create label element also
  const labelPlayerCount = document.createElement('label');
  const labelValue = document.createTextNode('Player Count');
  labelPlayerCount.setAttribute('for', PLAYER_COUNT_COMBO_ID);
  labelPlayerCount.appendChild(labelValue);
  divComboPlayerCount.appendChild(labelPlayerCount);

  const selectElement = document.createElement('select');
  selectElement.setAttribute('id', PLAYER_COUNT_COMBO_ID);
  // Depending on the player count selected, show the game pieces selection for each player
  // To Do:
  // selectElement.addEventListener('change', displayTokenList);
  // To DO: Chnage the random selection of users
  selectElement.addEventListener('change', selectRandomPlayers);

  const optionsList = [0, 1, 2, 3, 4];

  // Create options
  optionsList.forEach((optionValue) => {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', optionValue);
    const nodeValue = document.createTextNode(`${optionValue}`);
    optionElement.appendChild(nodeValue);
    selectElement.appendChild(optionElement);
  });
  divComboPlayerCount.appendChild(selectElement);
};

/**
 * Function to create the combo for board
 * As of now, max board size is limited between 5 and 13.
 * And only odd count is supported as board size
 */
const createBoardSelectCombo = () => {
  const divComboBoardSize = document.getElementById('div-combo-board-size');

  const idValue = BOARD_SIZE_COMBO_ID;

  // create label element also
  const labelBoardSize = document.createElement('label');
  const labelValue = document.createTextNode('Board Size');
  labelBoardSize.setAttribute('for', idValue);
  labelBoardSize.appendChild(labelValue);
  divComboBoardSize.appendChild(labelBoardSize);

  const maxBoardSize = 11;
  const minBoardSize = 5;
  const selectElement = document.createElement('select');
  selectElement.setAttribute('id', idValue);
  // Only odd value board size is allowed
  for (let size = minBoardSize; size <= maxBoardSize; size += 2)
  {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', size);
    const nodeValue = document.createTextNode(`${size}`);
    optionElement.appendChild(nodeValue);
    selectElement.appendChild(optionElement);
  }
  divComboBoardSize.appendChild(selectElement);
};

/**
 * Function that handles dice throw
 */
const throwRollingSticksDice = () => {
  const currentPlayerId = currentBoardState.nextPlayerId;
  axios.post('/throwDice', { gameId, currentPlayerId })
    .then((response) => {
      console.log(response.data);
      totalDicedValue = response.data.totalDicedValue;
      setGameIdAndBoardState(response.data);

      const divRolledDiceValues = document.getElementById('div-rolled-values');
      const pTotalValueEl = document.createElement('p');
      pTotalValueEl.innerText = `Player: ${currentPlayerId} - Rolled Value: ${totalDicedValue}`;
      divRolledDiceValues.appendChild(pTotalValueEl);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Function that handles the dragging event
// This event is fired when the user starts dragging an element or text selection.
function onDragStartToken(ev) {
  // Add the target element's id to the data transfer object
  // ev.dataTransfer.setData('application/x-moz-node', ev.target.id);
  ev.dataTransfer.setData('text/plain', ev.target.id);
  console.log('onDragToken: ev.target.id-', ev.target.id, 'typeOf:', typeof (ev.target));
}

// Function to handle "ondragover" event
// This event is fired continuously when an element or text selection
// is being dragged and the mouse pointer is over a valid drop target
function onDragOver(ev) {
  ev.preventDefault();
}

// Function to handle "ondrop" event
// This event is fired when an element or text selection is dropped on a valid drop target.
function onDrop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData('text');
  // const data = ev.dataTransfer.getData('application/x-moz-node');
  console.log('onDrop: ev.target-', ev.target, 'getData-', data);
  const addedNode = document.getElementById(data);
  console.log('addedNode:', addedNode);
  ev.target.appendChild(addedNode);

  // Clear the drag data cache (for all formats/types)
  ev.dataTransfer.clearData();
}

/**
 * Function that draws the board as per the size selected
 * @param {*} boardSize - board Size
 *
    -------------------------------------------
    |                   P1                    |
    |     |-----|-----|------|-----|-----|    |
    |     |-----|-----|------|-----|-----|    |
    |     |-----|-----|------|-----|-----|    |
    |  P2 |-----|-----|------|-----|-----| P4 |
    |     |-----|-----|------|-----|-----|    |
    |     |_____|_____|______|_____|_____|    |
    |                   P3                    |
    -------------------------------------------
 */
const drawBoard = (boardSize) => {
  const divPlayingBoard = document.getElementById('div-playing-board');
  divPlayingBoard.classList.add('container', 'board-container');

  // Adding an outer container before the board originally starts.
  // This is to add the player and tokens information
  // 3 Main rows, 2nd row has 3 columns in which 2 nd column has the game board

  const divOuterGameBoard = document.getElementById('div-outer-game-board');
  const divTopRow = document.createElement('div');
  divTopRow.setAttribute('id', 'top-player');
  divTopRow.classList.add('row', 'border');
  divOuterGameBoard.appendChild(divTopRow);

  const divMiddleRow = document.createElement('div');
  divMiddleRow.classList.add('row', 'border');
  divOuterGameBoard.appendChild(divMiddleRow);

  const divBottomRow = document.createElement('div');
  divBottomRow.setAttribute('id', 'bottom-player');
  divBottomRow.classList.add('row', 'border');
  divOuterGameBoard.appendChild(divBottomRow);

  // Add 3 columns to the middle row
  const divLeftCol = document.createElement('div');
  divLeftCol.classList.add('col-1');
  divLeftCol.setAttribute('id', 'left-player');
  divMiddleRow.appendChild(divLeftCol);

  const divMiddleCol = document.createElement('div');
  divMiddleCol.classList.add('col');
  divMiddleRow.appendChild(divMiddleCol);

  const divRightCol = document.createElement('div');
  divRightCol.classList.add('col-1');
  divRightCol.setAttribute('id', 'right-player');
  divMiddleRow.appendChild(divRightCol);

  // Board of size n x n
  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1)
  {
    const divRow = document.createElement('div');
    divRow.setAttribute('id', `r-${rowIndex}`);
    divRow.classList.add('row', 'board-row');
    divMiddleCol.appendChild(divRow);
    for (let colIndex = 0; colIndex < boardSize; colIndex += 1)
    {
      const divCol = document.createElement('div');
      divCol.innerHTML = `<sup>(${rowIndex},${colIndex})</sup>`;
      divCol.setAttribute('id', `r-c-${rowIndex}-${colIndex}`);
      divCol.classList.add('col', 'board-cell', 'border');
      divCol.addEventListener('drop', onDrop);
      divCol.addEventListener('dragover', onDragOver);

      divRow.appendChild(divCol);
    }
  }
};

/**
 * Function that marks the position of players and respective tokens in the board
 */
const markPlayersInitialPosition = () => {
  console.log('markPlayersInitialPosition');
  let tokenImageElementCounter = 0;
  Object.keys(currentBoardState.playersEntryPoint).forEach((playerId) => {
    console.log(playerId);

    const { entryPoint } = currentBoardState.playersEntryPoint[playerId];

    console.log(entryPoint);

    // Check for this entry point in the boardCornersAndSafePos
    // Depending on that, place the players tokens in the board
    const {
      topCentrePos, leftCentrePos, rightCentrePos, bottomCentrePos,
    } = currentBoardState.boardCornersAndSafePos.EntryPoints;
    const playerEmailShort = currentBoardState.playersEntryPoint[playerId].playerEmail.split('@', 1);
    const pElPlayer = document.createElement('p');
    pElPlayer.innerText = playerEmailShort;

    console.log(`playerEmailShort:${playerEmailShort}`);

    const gameTokenInfo = findTokenDetailsForPlayer(playerId);

    // console.log(`gameTokenInfo:${gameTokenInfo}`);

    let divIdValue = '';
    if (comparePositionArrays(entryPoint, topCentrePos))
    {
      // Place it as the top-player element
      divIdValue = 'top-player';
    }
    else if (comparePositionArrays(entryPoint, leftCentrePos))
    {
      // left-player
      divIdValue = 'left-player';
    }
    else if (comparePositionArrays(entryPoint, rightCentrePos))
    {
      // right-player
      divIdValue = 'right-player';
    }
    else if (comparePositionArrays(entryPoint, bottomCentrePos))
    {
      // bottom-player
      divIdValue = 'bottom-player';
    }
    console.log(divIdValue);
    const divEl = document.getElementById(divIdValue);
    console.log(divEl);
    if (divEl !== null || divEl !== undefined)
    {
      console.log('Appending player name element');

      pElPlayer.classList.add('player-name');
      divEl.appendChild(pElPlayer);
      // handle drop events
      divEl.addEventListener('drop', onDrop);
      divEl.addEventListener('dragover', onDragOver);
      // create the token element and append
      for (let indexToken = 0; indexToken < 4; indexToken += 1)
      {
        // const tokenImgEl = document.createElement('img');
        // tokenImgEl.setAttribute('src', gameTokenInfo.imageFilePath);
        // tokenImgEl.classList.add('token-image');
        // tokenImgEl.draggable = true;
        // // Add the ondragstart event listener
        // tokenImgEl.addEventListener('dragstart', onDragToken);

        // to do: resize css property
        // try with img element inside a p element.
        // check the border is only aroung the img

        const imageContainerEl = document.createElement('p');
        // imageContainerEl.classList.add('col');
        // imageCol.appendChild(tokenImgEl);
        imageContainerEl.style.backgroundImage = `url(${gameTokenInfo.imageFilePath})`;
        const className = 'token-image';
        // id format: playerid-tokenid-tokenindexcounter
        imageContainerEl.setAttribute('id', `${playerId}-${gameTokenInfo.id}-${tokenImageElementCounter}`);
        tokenImageElementCounter += 1;
        imageContainerEl.classList.add(className);
        imageContainerEl.draggable = true;
        imageContainerEl.addEventListener('dragstart', onDragStartToken);
        divEl.appendChild(imageContainerEl);
      }
    }
  });
};

/**
 * Function that displays the board of requested Size
 * @param {Numeric} boardSize - Size of board selected by the players
 */
const createBoard = (boardSize) => {
  drawBoard(boardSize);

  // Mark the players and the tokens near the respective entry positions
  markPlayersInitialPosition();

  // Add buttons necessary for playing
  const divPlayGroupButtons = document.getElementById('div-play-group-buttons');
  const btnThrowDice = document.createElement('button');
  btnThrowDice.setAttribute('id', 'btn-throw-dice');
  btnThrowDice.innerText = 'Roll Stick Dice';
  btnThrowDice.addEventListener('click', throwRollingSticksDice);
  divPlayGroupButtons.appendChild(btnThrowDice);
};

/**
 * Function to array of objects that holds info on players and their selected tokens
 */
const createPlayerTokenArray = () => {
  const playerCountSelected = document.getElementById(PLAYER_COUNT_COMBO_ID).value;
  if (playerCountSelected > playersList.length)
  {
    console.log('Not enough players registered. Register one more player.');
    return null;
  }
  const playerTokenArray = [];
  let tokenIndex = 0;
  for (let playerIndex = 0; playerIndex < playerCountSelected; playerIndex += 1)
  {
    const playerTokenInfo = {
      playerId: playersList[playerIndex].id,
      playerEmail: playersList[playerIndex].email,
      tokenId: gameTokensList[tokenIndex].id,
    };
    playerTokenArray.push(playerTokenInfo);
    tokenIndex += 1;
  }
  return playerTokenArray;
};

/**
 * Function that starts the game by sending request to server
 * Also, this function initiates the board drawing
 */
const startGame = () => {
  const boardSize = document.getElementById(BOARD_SIZE_COMBO_ID).value;
  // An array of objects that holds info on players and their selected tokens
  const playerTokenArray = createPlayerTokenArray();
  console.log(`${boardSize}, ${playerTokenArray}, ${playersList}`);
  axios.post('/createGame', { boardSize, playerTokenArray, playersList })
    .then((response) => {
      console.log(response.data);
      setGameIdAndBoardState(response.data);
      createBoard(boardSize);
    })
    .catch((err) => {
      console.log(err);
    });

  // const { boardSize, playerTokenArray } = request.body;
};

/**
 * Function that creates the start game button
 */
const createStartGameButton = () => {
  const divStartGameBtn = document.getElementById('div-start-game-button');
  const startgameBtn = document.createElement('button');
  startgameBtn.innerText = 'Start Game';
  divStartGameBtn.appendChild(startgameBtn);
  startgameBtn.addEventListener('click', startGame);
};

/**
 * Handler for the clicking PlayGame Button
 */
const playGame = () => {
  // Hide the play game button
  const btnPlayGame = document.getElementById('btn-play-game');
  btnPlayGame.style.display = 'none';

  // Show the combo list for Board Size and Player count
  createBoardSelectCombo();
  createPlayerCountCombo();

  // Show the start game button
  createStartGameButton();
};

// Get all the tokens available in the game
const getAllTokens = () => {
// Make a request for all the tokens
  axios.get('/tokens')
    .then((response) => {
      console.log(response);
      // handle success
      console.log(response.data);
      gameTokensList = response.data;
    })
    .catch((error) => {
    // handle error
      console.log(error);
    });
};

/**
 * Starting point
 */
function main() {
  const btnPlayGame = document.getElementById('btn-play-game');
  btnPlayGame.addEventListener('click', playGame);
}

getAllTokens();

main();
