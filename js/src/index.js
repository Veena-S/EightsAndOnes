import axios from 'axios';
import 'core-js';
import { image } from 'faker';
import './gameRules.js';
import './styles.scss';

const PLAYER_COUNT_COMBO_ID = 'player-count';
const BOARD_SIZE_COMBO_ID = 'board-size';
const CUST_BUTTON_CLASS = 'cust-buttons';
let gameTokensList = null;
let playersList = null; // id, email
let currentBoardState = null; // Current State of the board
let gameUsersTokensList = null; // Array[Mapping of gameId - PlayerId - TokenID]
let gameId = -1; // Current game's id
let totalDicedValue = 0; // recently played dice value
let remainingDiceValue = totalDicedValue; // for each cell movement, this value will be dcremented
const mapPlayerIdToOuterBoardPosClassName = {};
let winnerId = -1;

const startEl = document.getElementById('start');
startEl.style.display = 'none';

const setGameIdAndBoardState = (data) => {
  gameId = data.gameId;
  currentBoardState = data.currentBoardState;
  if (data.gameUsersTokensList !== undefined || data.gameUsersTokensList !== null)
  {
    gameUsersTokensList = data.gameUsersTokensList;
  }
};

const setDiceRollValues = (totalValue, remainingValue) => {
  totalDicedValue = totalValue;
  remainingDiceValue = remainingValue;
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
 * Function to highlight the path of a player after he throw the dice
 * @param {*} currentBoardState
 * @param {*} currentPlayerId
 */
const hightlightTraversePath = (boardState, currentPlayerId) => {
  const { entryPoint } = boardState.playersEntryPoint[currentPlayerId];
  let entry = '';
  if (Array.isArray(entryPoint))
  {
    entry = entryPoint.join('-');
  }
  else {
    entry = JSON.parse(entryPoint).join('-');
  }

  const traversePathArray = boardState.traversePaths[entry];
  traversePathArray.forEach((cellPos, index) => {
    // To Do
    // Check the entry position
    // Loop: Get the cells till the next corner
    // Add respective Arrow for the cell

    const pathCellArr = (typeof (cellPos) === 'string') ? JSON.parse(cellPos) : cellPos;

    // As of now, instead of Arrows, it's highlighted by dots
    // Get the element at the cell pos
    const divCellEl = document.getElementById(`r-c-${pathCellArr[0]}-${pathCellArr[1]}`);
    if (divCellEl)
    {
      if (index === (traversePathArray.length - 2))
      {
      // Add diamond at the last cell
        divCellEl.innerHTML += '<i class="diamond highlighted"></i>';
      }
      else {
        divCellEl.innerHTML += '<i class="dot highlighted"></i>';
      }
    }
  });
};

// Simply remove the hightlighed class elements from the board
// Called before each throw or when the dice is placed completly
const deleteHighlights = () => {
  const divHighlightedEls = document.getElementsByClassName('highlighted');
  if (divHighlightedEls)
  {
    divHighlightedEls.forEach((singleEl) => { singleEl.remove(); });
  }
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
  tokensList.forEach((singleToken) => {
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
  if (remainingDiceValue !== 0)
  {
    // To DO: Instead of alert message, do a proper checking for the possibilities of
    // further movement
    // // eslint-disable-next-line no-alert
    // alert('Current Player\'s movement not finished.\nEither complete the move or skip the turn');
    // return;
  }
  deleteHighlights();
  const rollValueEl = document.getElementById('div-rolled-values');
  rollValueEl.style.display = 'block';
  const divRecentValueEl = document.getElementById('div-rolled-values-recent');
  divRecentValueEl.style.display = 'block';

  const currentPlayerId = currentBoardState.nextPlayerId;
  axios.post('/throwDice', { gameId, currentPlayerId })
    .then((response) => {
      console.log(response.data);
      setDiceRollValues(response.data.totalDicedValue,
        response.data.currentBoardState.remainingDiceValue);
      setGameIdAndBoardState(response.data);

      const itemTotalValueEl = document.createElement('li');
      const textValue = document.createTextNode(`Player: ${currentBoardState.playersEntryPoint[currentPlayerId].playerEmail.split('@', 1)} - Rolled Value: ${totalDicedValue}`);
      itemTotalValueEl.appendChild(textValue);
      const rolledValuesListEl = document.getElementById('rolled-dice');
      rolledValuesListEl.insertBefore(itemTotalValueEl, rolledValuesListEl.childNodes[0]);

      const recentValueEl = document.getElementById('rolled-values-recent');
      if (recentValueEl)
      {
        recentValueEl.innerText = `Player: ${currentBoardState.playersEntryPoint[currentPlayerId].playerEmail.split('@', 1)} - Rolled Value: ${totalDicedValue}`;
      }

      // To do: Hightlight the target positions
      // hightlightTraversePath(response.data.currentBoardState, currentPlayerId);
    })
    .catch((err) => {
      console.log(err);
    });
};

// To DO:
// /**
//  * Function to decide next player turn
//  * @param {Object} movedTokenResponseData
//  */
// const decidePlayerTurn = (movedTokenResponseData, currentPlayerId) => {
//   // Check remainingDiceValue === 0, to find the whether next step is the turn of next player.
//   // If a movement is made for this move request, remainingDiceValue = 0
//   // or just provide a button to mark the turn of next player in case he wants to skip that turn
//   if (remainingDiceValue !== 0)
//   {
//   }
//
//   axios.post('/setNextPlayer', { gameId })
//     .then((response) => {
//
//     })
//     .catch((err) => {
//
//     });
// };

/**
 * Function to check whether the specified player is the winner or not
 * @param {*} playerId
 * @param {*} winnerId
 */
const checkForGameWinner = (playerId, returnedWinnerId) => (playerId === returnedWinnerId);

const declareWinner = (returnedWinnerId) => {
// Provide an alert
// Disable all other buttons, except start game
// get the player name
  // eslint-disable-next-line no-alert
  alert(`Game completed. Winner is: 
  ${currentBoardState.playersEntryPoint[returnedWinnerId].playerEmail.split('@', 1)}`);
  const btnThrow = document.getElementById('btn-throw-dice');
  btnThrow.disabled = true;
};

const findGameWinner = (boardState) => {
  let bWinnerFound = false;
  // Check how many tokens are presnt in the centre cell of the board
  const centreCell = boardState.boardCornersAndSafePos.FinalPos;
  let centrePosStr = null;
  if (Array.isArray(centreCell))
  {
    centrePosStr = centreCell.join('-');
  }
  else {
    centrePosStr = JSON.parse(centreCell).join('-');
  }
  const tokensList = boardState.tokenPositions[centrePosStr];
  if (tokensList !== undefined && tokensList.length !== 0)
  {
    // Check the count of each tokens present in it. If it's 4, that player is the winner
    // "2-0":[{"playerdId":6,"tokenId":2,"tokenCount":1}],"
    tokensList.forEach((tokenData) => {
      if (tokenData.tokenCount === 4)
      {
        // This player is the winner
        bWinnerFound = true;
        winnerId = tokenData.playerdId;
      }
    });
  }
  return bWinnerFound;
};

// Function that compares a given entry point to the list of centre positions
// and returns the id value of the respective outer div element
const getOuterPosIdValues = (entryPoint, centrePositions) => {
  const {
    topCentrePos, leftCentrePos, rightCentrePos, bottomCentrePos,
  } = centrePositions;
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
  return divIdValue;
};

/**
 * Function that removes all the tokens from the inner board cells to outer board
 * @param {*} boardState
 */
const moveTokensToOuterBoard = (boardState) => {
  // Clear the tokens inside the board
  // Get the list of tokens present in the board
  const className = 'token-image';
  const tokenElementsList = document.getElementsByClassName(className);
  if (undefined === tokenElementsList)
  {
    return;
  }
  tokenElementsList.forEach((tokenEl) => {
    const spanTokensPlayerElement = tokenEl.querySelector('.sp-pid');
    const spanCurrentTokenPosElement = tokenEl.querySelector('.sp-current-pos');
    if (spanTokensPlayerElement === null || spanCurrentTokenPosElement === null)
    {
      console.log('validation failed - null');
      // continue;
    }
    const tokenBelongsTo = Number(spanTokensPlayerElement.innerText);
    spanCurrentTokenPosElement.innerText = '-1,-1';
    // Get the entry point for the player
    const { entryPoint } = boardState.playersEntryPoint[tokenBelongsTo];
    // Get the outer element for that entry point
    const divOuterElId = getOuterPosIdValues(entryPoint,
      boardState.boardCornersAndSafePos.EntryPoints);
    const divOuterElement = document.getElementsByid(divOuterElId);
    if (divOuterElement)
    {
      divOuterElement.appendChild(tokenEl);
    }
  });
};

/**
 * This function compares the returned game state token positions to
 * the token placement in the board.
 * If the there is a mismatch, the board position will be corrected
 * Either by placing the token node to destined cell
 * Or by updating the current position of the token present in the current cell,
 * if the player and token id matches
 */
const updateTokenPositions = (boardState) => {
  // First put the tokens in the initial state
  moveTokensToOuterBoard(boardState);
  // Place all the tokens to inner positions
  const updatedTokenPositions = boardState.tokenPositions;
  if (updatedTokenPositions !== undefined)
  {
    Object.keys(updatedTokenPositions).forEach((cellPosition) => {
      // Convert to pos array
      const cellPosArray = cellPosition.split('-');
      const tokensList = updatedTokenPositions[cellPosition];
      tokensList.forEach((tokenInfo) => {
        // Get the entry point for the player
        const { entryPoint } = boardState.playersEntryPoint[tokenInfo.playerId];
        const { tokenCount } = tokenInfo;
        // Get the token elements at the entry position
        const divOuterElId = getOuterPosIdValues(entryPoint,
          boardState.boardCornersAndSafePos.EntryPoints);
        const divOuterElement = document.getElementsByid(divOuterElId);
        if (divOuterElement) {
          const tokenElements = divOuterElement.querySelectorAll('.token-image');
          tokenElements.forEach((tokenEl, index) => {
            if (index < tokenCount)
            {
              const spanCurrentTokenPosElement = tokenEl.querySelector('.sp-current-pos');
              spanCurrentTokenPosElement.innerText = cellPosArray;
              // Append the token element to the cell
              const divCellElement = document.getElementById(`r-c-${cellPosArray[0]}-${cellPosArray[1]}`);
              if (divCellElement)
              {
                divCellElement.appendChild(tokenEl);
              }
            }
          });
        }
      });
    });
  }
};

/**
 * Function that validates whether the token moved out of the board
 * is correctly placed or not. If not, it will update the position.
 * This comes in use, when an already exisiting token was removed by another players token
 * @param {*} removedTokens
 */
const validateRemovedTokenPositions = (removedTokens) => {
  // First move the removed tokens node to outer board space,
  // depending on the player who own the token
  // get the parent node element of the token
  removedTokens.forEach((tokenRemoved) => {
    // Check whether this toke is still at the old location
    const { oldPos, tokenBelongsTo } = tokenRemoved;
    // If the token is present inside a board cell, item id = r-c-<row>-<col>
    const divOldLocation = document.getElementsByid(`r-c-${oldPos[0]}-${oldPos[1]}`);
    if (divOldLocation) // Found the cell element for the old location of the token
    {
      // Check if still there is a token at this location
      const tokenElements = divOldLocation.querySelectorAll('.token-image');
      tokenElements.forEach((tokenEl) => {
        // and if there is one, is it same as the removed token.
        const spanTokensPlayerElement = tokenEl.querySelector('.sp-pid');
        const spanTokensIDElement = tokenEl.querySelector('.sp-tid');
        if (!spanTokensPlayerElement && !spanTokensIDElement)
        {
          // Is it same as the removed token?
          // If it is same as the removed, remove token element from the old location.
          if (tokenRemoved.tokenId === Number(spanTokensIDElement.innerText))
          {
            // Token element is still present at the old location.
            // Move it to the target location
            // Get the target location
            const divOuterTargetElement = document.getElementsByid(
              mapPlayerIdToOuterBoardPosClassName[tokenBelongsTo],
            );
            if (divOuterTargetElement) // If the outer element is found
            {
              // Then check whether the same token element is present under the new location
              // i.e. outside the board
              const targetTokenElements = divOuterTargetElement.querySelectorAll('.token-image');
              let bFound = false;
              targetTokenElements.forEach((destToken) => {
                const spanDestTokensPlayerElement = destToken.querySelector('.sp-pid');
                const spanDestTokensIDElement = destToken.querySelector('.sp-tid');
                if ((tokenRemoved.tokenId === Number(spanDestTokensIDElement.innerText))
                && (tokenRemoved.tokenBelongsTo === Number(spanDestTokensPlayerElement.innerText))
                 && !bFound)
                {
                  // Same as the removed element - i.e.
                  // it is already present at the target location.
                  // In that case just remove the token from the old location
                  tokenEl.remove();
                  bFound = true;
                }
              });
              if (!bFound) {
                // It is not present. Append the tokenEl to target
                // No need to remove the earlier ones. Same object is referenced here.
                divOuterTargetElement.appendChild(tokenEl);
              }//
            } // outer element is found condition ends
          } // condition ends: removed token is still at old location
        }
      });
    } // valid old location
  });
};

/**
 * Function that validates whether the current drag and drop is valid or not.
 * @param {HTMLDivElement} targetNodeElement
 * @param {HTMLParagraphElement} addedNodeElement
 */
const validateAndMoveToken = (targetNodeElement, addedNodeElement) => {
  console.log('validateAndMoveToken');

  return new Promise((resolve, reject) => {
  // Spans on the targets: either "outer-board-pos" or none on the cells
    // Cells id format: r-c-${rowIndex}-${colIndex}. row and col values are stored in innerText also
    // On the added token element hidden spans are: sp-current-pos, sp-pid, sp-tid
    // Tokens placed on outer-board will have sp-current-pos = '-1, -1'

    const currentPlayerId = currentBoardState.lastPlayerId;
    // Player Id to whom the moved token belongs:
    const spanTokensPlayerElement = addedNodeElement.querySelector('.sp-pid');
    const spanTokensIDElement = addedNodeElement.querySelector('.sp-tid');
    const spanCurrentTokenPosElement = addedNodeElement.querySelector('.sp-current-pos');
    if (spanTokensPlayerElement === null || spanTokensIDElement === null
    || spanCurrentTokenPosElement === null)
    {
      console.log('validation failed - null');
      resolve(false);
    }
    axios.post('/validateMove', {
      gameId,
      currentPlayerId,
      totalDicedValue,
      remainingDiceValue,
      movedTokenData: {
        tokenBelongsTo: Number(spanTokensPlayerElement.innerText),
        tokenId: Number(spanTokensIDElement.innerText),
        currentPos: spanCurrentTokenPosElement.innerText.split(',').map(Number),
      },
      sourceCellPos: spanCurrentTokenPosElement.innerText.split(',').map(Number), // will be same as that of the token pos
      targetCellPos: targetNodeElement.innerText.split(',').map(Number),
    })
      .then((response) => {
        console.log(response.data);
        if (response.data.isValid && response.data.gameStatus === 'success')
        {
        // Successfully updated the token position in database
        // Store the returned data into the variables
          setGameIdAndBoardState(response.data);
          setDiceRollValues(response.data.totalDicedValue, response.data.remainingDiceValue);
          spanCurrentTokenPosElement.innerText = response.data.movedTokenData.currentPos.toString();
          validateRemovedTokenPositions(response.data.removedTokens);
          winnerId = response.data.winnerId;
          // updateTokenPositions(response.data.currentBoardState);
          // if (!checkForGameWinner(currentPlayerId, response.data.winnerId)) {
          //   // To do:
          //   // decidePlayerTurn(response.data, currentPlayerId);
          // }
        }
        // Other cases of valiadtion success are crossing out others token
        resolve(response.data.isValid);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
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
  console.log('onDragOver');
  ev.preventDefault();
}

// Function to handle "ondrop" event
// This event is fired when an element or text selection is dropped on a valid drop target.
function onDrop(ev) {
  // ev.preventDefault();
  const droppedNodeId = ev.dataTransfer.getData('text');
  // const data = ev.dataTransfer.getData('application/x-moz-node');
  console.log('onDrop: ev.target-', ev.target, 'getData-', droppedNodeId);
  const addedNode = document.getElementById(droppedNodeId);
  console.log('addingNode:', addedNode);

  // For further validation and server communication
  // If token movement validation failed, it will not be able to drop on the target location
  // const bValid = validateAndMoveToken(ev.target, addedNode);
  // if (bValid)
  // {
  //   ev.preventDefault();
  //   ev.target.appendChild(addedNode);
  // }

  validateAndMoveToken(ev.target, addedNode)
    .then((bValid) => {
      if (bValid)
      {
        ev.preventDefault();
        ev.target.appendChild(addedNode);
        if (checkForGameWinner(currentBoardState.lastPlayerId, winnerId)) {
          // To do:
          // decidePlayerTurn(response.data, currentPlayerId);
          declareWinner(winnerId);
        }
      }
    })
    .catch((err) => { console.log(err); });

  // Clear the drag data cache (for all formats/types)
  ev.dataTransfer.clearData();
}

/**
 * Function to add common class name for all the safe cells
 */
const markSafeCells = () => {
  // A cell is represented by the id: 'r-c-${rowIndex}-${colIndex}`
  // Apply a common class for all the entry points
  Object.keys(currentBoardState.boardCornersAndSafePos.EntryPoints).forEach((entryPoint) => {
    const indexRowCol = currentBoardState.boardCornersAndSafePos.EntryPoints[entryPoint];
    const idValue = `r-c-${indexRowCol[0]}-${indexRowCol[1]}`;
    const divSafeCellElement = document.getElementById(idValue);
    if (divSafeCellElement)
    {
      divSafeCellElement.classList.add('safe-cell');
    }
  });
  const centreCell = currentBoardState.boardCornersAndSafePos.FinalPos;
  let centrePosStr = null;
  if (Array.isArray(centreCell))
  {
    centrePosStr = centreCell.join('-');
  }
  else {
    centrePosStr = JSON.parse(centreCell).join('-');
  }
  const idValue = `r-c-${centrePosStr}`;
  const divCentreCellElement = document.getElementById(idValue);
  if (divCentreCellElement)
  {
    divCentreCellElement.classList.add('centre-cell');
  }
};

const refreshGameStatus = () => {
  // Get the list of users and in the game

  axios.get('/refreshGame', { gameId })
    .then((response) => {
      console.log(response.data);

      setGameIdAndBoardState(response.data);
      setDiceRollValues(response.data.totalDicedValue, response.data.remainingDiceValue);
      // Update the token positions as per the current position returned after movement
      // removedTokens
      gameUsersTokensList = [...response.data.gameUsersData];
      gameTokensList = [...response.data.completeTokensList];
      updateTokenPositions(response.data.currentBoardState);
      if (findGameWinner(response.data.currentBoardState)) {
        // decidePlayerTurn(response.data, currentPlayerId);
        declareWinner(response.data.winnerId);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const skipTurn = () => {
  deleteHighlights();
  // Set the next player id and activate that player
  // Same as calling refresh and activating next players turn
  axios.post('/setNextPlayer', { gameId })
    .then((response) => {
      console.log(response.data);

      setGameIdAndBoardState(response.data);
      setDiceRollValues(response.data.totalDicedValue, response.data.remainingDiceValue);
    })
    .catch((err) => {
      console.log(err);
    });
};

const addSkipButton = (parentNode) => {
  const skipButton = document.createElement('button');
  skipButton.classList.add('btn', 'btn-sm', CUST_BUTTON_CLASS);
  skipButton.innerText = 'Skip Turn';
  // const btnIconEl = document.createElement('img');
  // btnIconEl.innerHTML = 'Skip Turn';
  // btnIconEl.innerHTML = "<img src=>"
  skipButton.addEventListener('click', skipTurn);
  parentNode.appendChild(skipButton);
};

/**
 * Function that draws the board as per the size selected
 * @param {Numeric} boardSize - board Size
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
  divTopRow.classList.add('row');
  // Add a span element idicating info to be used ondrop event
  // handle drop events
  const spanEl = document.createElement('span');
  spanEl.hidden = true;
  spanEl.classList.add('outer-board-pos', 'sp-current-pos');
  spanEl.innerText = '-1,-1';
  divTopRow.appendChild(spanEl);
  divTopRow.addEventListener('drop', onDrop);
  divTopRow.addEventListener('dragover', onDragOver);
  divOuterGameBoard.appendChild(divTopRow);

  const divMiddleRow = document.createElement('div');
  divMiddleRow.classList.add('row');
  divOuterGameBoard.appendChild(divMiddleRow);

  const divBottomRow = document.createElement('div');
  divBottomRow.setAttribute('id', 'bottom-player');
  divBottomRow.classList.add('row');
  // Add a span element idicating info to be used ondrop event
  // handle drop events
  divBottomRow.appendChild(spanEl.cloneNode(true));
  divBottomRow.addEventListener('drop', onDrop);
  divBottomRow.addEventListener('dragover', onDragOver);
  divOuterGameBoard.appendChild(divBottomRow);

  // Add 3 columns to the middle row
  const divLeftCol = document.createElement('div');
  divLeftCol.classList.add('col-1');
  divLeftCol.setAttribute('id', 'left-player');
  // Add a span element idicating info to be used ondrop event
  // handle drop events
  divLeftCol.appendChild(spanEl.cloneNode(true));
  divLeftCol.addEventListener('drop', onDrop);
  divLeftCol.addEventListener('dragover', onDragOver);
  divMiddleRow.appendChild(divLeftCol);

  const divMiddleCol = document.createElement('div');
  divMiddleCol.classList.add('col');
  divMiddleRow.appendChild(divMiddleCol);

  const divRightCol = document.createElement('div');
  divRightCol.classList.add('col-1');
  divRightCol.setAttribute('id', 'right-player');
  // Add a span element idicating info to be used ondrop event
  // handle drop events
  divRightCol.appendChild(spanEl.cloneNode(true));
  divRightCol.addEventListener('drop', onDrop);
  divRightCol.addEventListener('dragover', onDragOver);
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
      divCol.innerHTML = `<sup>${rowIndex},${colIndex}</sup>`;
      divCol.setAttribute('id', `r-c-${rowIndex}-${colIndex}`);
      divCol.classList.add('col', 'board-cell');
      divCol.addEventListener('drop', onDrop);
      divCol.addEventListener('dragover', onDragOver);

      divRow.appendChild(divCol);
    }
  }
  markSafeCells();
};

/**
 * Function that marks the position of players and respective tokens in the board
 */
const markPlayerTokensInitialPosition = () => {
  console.log('markPlayerTokensInitialPosition');
  let tokenImageElementCounter = 0;
  Object.keys(currentBoardState.playersEntryPoint).forEach((playerId) => {
    console.log(playerId);

    const { entryPoint } = currentBoardState.playersEntryPoint[playerId];

    console.log(entryPoint);

    // Check for this entry point in the boardCornersAndSafePos
    // Depending on that, place the players tokens in the board
    const playerEmailShort = currentBoardState.playersEntryPoint[playerId].playerEmail.split('@', 1);
    const pElPlayer = document.createElement('p');
    pElPlayer.innerText = playerEmailShort;

    console.log(`playerEmailShort:${playerEmailShort}`);

    const gameTokenInfo = findTokenDetailsForPlayer(playerId);

    // console.log(`gameTokenInfo:${gameTokenInfo}`);

    const divIdValue = getOuterPosIdValues(entryPoint,
      currentBoardState.boardCornersAndSafePos.EntryPoints);
    console.log(divIdValue);
    const divEl = document.getElementById(divIdValue);
    console.log(divEl);
    if (divEl !== null || divEl !== undefined)
    {
      mapPlayerIdToOuterBoardPosClassName[playerId] = divIdValue;

      console.log('Appending player name element');

      pElPlayer.classList.add('player-name');
      divEl.appendChild(pElPlayer);
      // create the token element and append
      for (let indexToken = 0; indexToken < 4; indexToken += 1)
      {
        const imageContainerEl = document.createElement('p');
        // imageContainerEl.classList.add('col');
        // imageCol.appendChild(tokenImgEl);
        imageContainerEl.style.backgroundImage = `url(${gameTokenInfo.imageFilePath})`;
        const className = 'token-image';
        imageContainerEl.setAttribute('id', `${className}-${tokenImageElementCounter}`);
        tokenImageElementCounter += 1;
        imageContainerEl.classList.add(className);
        imageContainerEl.draggable = true;
        // Adding the details PlayerId, TokenId, and currentCellPos as hidden elements
        // This will be read when the element is dropped
        const spanPlayer = document.createElement('span');
        imageContainerEl.appendChild(spanPlayer);
        spanPlayer.classList.add('sp-pid');
        spanPlayer.innerText = playerId;
        spanPlayer.hidden = true;

        const spanToken = document.createElement('span');
        imageContainerEl.appendChild(spanToken);
        spanToken.classList.add('sp-tid');
        spanToken.innerText = gameTokenInfo.id;
        spanToken.hidden = true;

        const spanCurrentPos = document.createElement('span');
        imageContainerEl.appendChild(spanCurrentPos);
        spanCurrentPos.classList.add('sp-current-pos');
        spanCurrentPos.innerText = '-1,-1'; // it's currently outside the game board
        spanCurrentPos.hidden = true;

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
  markPlayerTokensInitialPosition();

  // Add buttons necessary for playing
  const divPlayGroupButtons = document.getElementById('div-play-group-buttons');
  const btnThrowDice = document.createElement('button');
  btnThrowDice.setAttribute('id', 'btn-throw-dice');
  btnThrowDice.classList.add('btn', 'btn-sm', CUST_BUTTON_CLASS);
  btnThrowDice.innerText = 'Roll Stick Dice';
  btnThrowDice.addEventListener('click', throwRollingSticksDice);
  divPlayGroupButtons.appendChild(btnThrowDice);

  // addSkipButton(divPlayGroupButtons);
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
  const divRefreshGameBtn = document.getElementById('div-refresh-game-button');
  divRefreshGameBtn.style.display = 'block';

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
  startgameBtn.classList.add('btn', 'btn-sm', CUST_BUTTON_CLASS);
  startgameBtn.innerText = 'Start Game';
  divStartGameBtn.appendChild(startgameBtn);
  startgameBtn.addEventListener('click', startGame);
};

const createRefreshButton = () => {
  const divRefreshGameBtn = document.getElementById('div-refresh-game-button');
  const refreshGameBtn = document.createElement('button');
  refreshGameBtn.classList.add('btn', 'btn-sm', CUST_BUTTON_CLASS);
  refreshGameBtn.innerText = 'Refresh';
  divRefreshGameBtn.style.display = 'none';
  divRefreshGameBtn.appendChild(refreshGameBtn);
  refreshGameBtn.addEventListener('click', refreshGameStatus);
};

/**
 * Handler for the clicking PlayGame Button
 */
const playGame = () => {
  // Hide the Game description and details
  const gameDetailsEl = document.getElementById('game-details');
  gameDetailsEl.style.display = 'none';
  // Hide the play game button
  const btnPlayGame = document.getElementById('btn-play-game');
  btnPlayGame.style.display = 'none';

  const divSettingsEl = document.getElementById('settings');
  divSettingsEl.style.display = 'flex';

  // Show the combo list for Board Size and Player count
  createBoardSelectCombo();
  createPlayerCountCombo();

  // Show the start game button
  createStartGameButton();

  // Create Refresh Button
  createRefreshButton();
};

const requestLogin = () => {
  const data = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };
  console.log(data);
  axios.post('/login', data)
    .then((responseData) => {
      console.log(responseData);
      const isUserLoggedIn = responseData.data.success;
    })
    .catch((error) => {
      console.log(error);
    });
};

const requestSignup = () => {
  const data = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };
  console.log(data);

  axios.post('/sign-up', data)
    .then((responseData) => {
      console.log(responseData);
      const isUserLoggedIn = responseData.data.success;
    })
    .catch((error) => {
      console.log(error);
    });
};

const doLoginAsGuest = () => {
  const loginEl = document.getElementById('login-form');
  loginEl.style.display = 'none';
  const startElement = document.getElementById('start');
  startElement.style.display = 'block';
  const btnPlayGame = document.getElementById('btn-play-game');
  btnPlayGame.style.display = 'block';
  const divSettingsEl = document.getElementById('settings');
  divSettingsEl.style.display = 'none';
};

/**
 * Starting point
 */
function main() {
  const btnLogin = document.getElementById('submit-login');
  btnLogin.addEventListener('click', requestLogin);
  const btnSignup = document.getElementById('submit-signup');
  btnSignup.addEventListener('click', requestSignup);
  const btnGuest = document.getElementById('as-guest');
  btnGuest.addEventListener('click', doLoginAsGuest);
  const btnPlayGame = document.getElementById('btn-play-game');
  btnPlayGame.style.display = 'none';
  btnPlayGame.addEventListener('click', playGame);
  const rollValueEl = document.getElementById('div-rolled-values');
  rollValueEl.style.display = 'none';
  const divRecentValueEl = document.getElementById('div-rolled-values-recent');
  divRecentValueEl.style.display = 'none';
}

getAllTokens();

main();
