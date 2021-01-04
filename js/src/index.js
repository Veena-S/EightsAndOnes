import axios from 'axios';
import './styles.scss';

const PLAYER_COUNT_COMBO_ID = 'player-count';
const BOARD_SIZE_COMBO_ID = 'board-size';
let gameTokensList = null;
let playersList = null;

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

  const optionsList = [1, 2, 3, 4];

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

  const maxBoardSize = 13;
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
 * Function that displays the board of requested Size
 * @param {Numeric} boardSize - Size of board selected by the players
 */
const createBoard = (boardSize) => {
  const divPlayingBoard = document.getElementById('div-playing-board');
  divPlayingBoard.classList.add('container', 'board-container');
  // Board of size n x n
  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1)
  {
    const divRow = document.createElement('div');
    divRow.setAttribute('id', `r-${rowIndex}`);
    divRow.classList.add('row', 'board-row');
    divPlayingBoard.appendChild(divRow);
    for (let colIndex = 0; colIndex < boardSize; colIndex += 1)
    {
      const divCol = document.createElement('div');
      divCol.innerHTML = `<sup>(${rowIndex},${colIndex})</sup>`;
      divCol.setAttribute('id', `r-c-${rowIndex}-${colIndex}`);
      divCol.classList.add('col', 'board-cell', 'border');
      divRow.appendChild(divCol);
    }
  }
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
  createBoard(boardSize);
  // An array of objects that holds info on players and their selected tokens
  const playerTokenArray = createPlayerTokenArray();
  console.log(`${boardSize}, ${playerTokenArray}, ${playersList}`);
  axios.post('/createGame', { boardSize, playerTokenArray, playersList })
    .then((response) => {
      console.log(response.data);
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
