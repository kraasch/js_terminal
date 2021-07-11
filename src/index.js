
/***********************************
 *            Tasks                *
 ***********************************/

/* 
 * important:
 * - [ ] stop text from anti-aliasing completely (!!!).
 * - [ ] allow clearing of screen (with 'cls' or 'clear').
 * - [ ] allow scrolling of text if bottom is reached.
 * - [ ] update screen dimensions (height and width) when user resizes (eg with ctrl-+, ctrl--).
 *
 * misc:
 * - [ ] read special keystrokes (ctrl+w, ctrl-a, alt-b, alt-c/u/l etc)
 * - [ ] make it possible to follow web links via mouse click.
 * - [ ] make it possible to print web links as text.
 * - [ ] use up arrow to show previous command.
 *
 * maybe:
 * - [ ] different text colors in same printed line.
 * - [ ] read special keystrokes (ctrl+w, ctrl-a, alt-b, alt-c/u/l etc)
 *
 * done:
 * - [X] show help menu.
 * - [X] make cursor blink.
 * - [X] read standard keystrokes (a-z, A-Z, 0-9, etc)
 * - [X] print types keystrokes out immediately.
 */

/***********************************
 *            Utilties            *
 ***********************************/

function isFunction(variable) {
  return typeof variable === 'function';
}

/***********************************
 *            CONSTANTS            *
 ***********************************/

const BLACK = "#000";
const WHITE = "#fff";
const RED = "#f00";
const GREEN = "#0f0";
const BLUE = "#00f";

const TAB = "   ";
const NL = "\n";

const lineHeight = 14;
const lineSpacing = 2;
const lineDifference = lineHeight + lineSpacing;
const SCROLL_LIMIT_BOTTOM = 100;
const LINE_START_VALUE = 1;

const ME_INFO_MSG = NL +
  '+=====================================+' + NL +
  '|            Alex Kraasch             |' + NL +
  '| ~~ Software Engineer && Tinkerer ~~ |' + NL +
  '+-------------------------------------+' + NL +
  '|                                     |' + NL +
  '|  mail: alex@kraasch.eu              |' + NL +
  '|  web:  https://github.com/kraasch   |' + NL +
  '|  tel:  ____                         |' + NL +
  '|                                     |' + NL +
  '|    @Germany, Europe                 |' + NL +
  '|                                     |' + NL +
  '+=====================================+' + NL +
  '';

const PAGE_INFO_MSG = NL +
  ' ______________________      ' + NL +
  '                             ' + NL +
  ' Alex Kraasch                ' + NL +
  ' info(at)kraasch(dot)eu      ' + NL +
  ' Germany, Europe             ' + NL +
  ' ______________________      ' + NL +
  '                             ' + NL +
  '';

const ERR_MSG_CMD_NOT_FOUND = ': command not found';

function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lastLine = LINE_START_VALUE;
}

const COMMANDS =
  [
    {
      command: 'help',
      help: 'Print available commands.',
      response: '',
    },
    {
      command: 'tetris',
      help: 'Play tetris (not yet available).',
      response: 'Not yet implemented.',
    },
    {
      command: 'ipconfig',
      help: 'Prints your IP.',
      response: 'Not found.'
    },
    {
      command: 'pwd',
      help: 'Prints your location.',
      response: document.URL,
    },
    {
      command: 'legal',
      help: 'Information about this web page.',
      response: PAGE_INFO_MSG,
    },
    {
      command: 'whoami',
      help: 'Information about me.',
      response: ME_INFO_MSG,
    },
    {
      command: 'cls',
      help: 'Clear the screen.',
      response: clearScreen,
    },
    {
      command: 'clear',
      help: 'Clear the screen.',
      response: clearScreen,
    },
  ];

function setCommandResponse(coms, key, val) {
  for (const com of coms) {
    if (com.command == key) {
      com.response = val;
    }
  }
}

function getIpAddress() {
  let url = 'https://api.db-ip.com/v2/free/self';
  fetch(url).then(res => res.json()).then(data => {
    let response = JSON.stringify(data, null, 2);
    setCommandResponse(COMMANDS, 'ipconfig', response);
  });
}
getIpAddress();

function sortCommands(arr) {
  arr.sort(function(a, b) {
    if (a.command < b.command) { return -1; }
    if (a.command > b.command) { return 1; }
    return 0;
  })
};
sortCommands(COMMANDS);

function createHelp(coms) {
  let str = '\n';
  let longest = 0;
  for (const com of coms) {
    if (com.command.length > longest) {
      longest = com.command.length;
    }
  }
  let spaces = ' '.repeat(longest);
  for (const com of coms) {
    let space = spaces.substring(com.command.length);
    str += TAB + com.command + space + ' -- ' + com.help + NL;
  }
  setCommandResponse(coms, 'help', str);
}
createHelp(COMMANDS);

/***********************************
 *           SETUP SCREEN          *
 ***********************************/

// create a canvas in the size of the the screen.
const maxWidth = window.innerWidth;
const maxHeight = window.innerHeight;
const canvas = document.getElementById('canvas');

canvas.width = maxWidth;
canvas.height = maxHeight;
let ctx = canvas.getContext('2d');
ctx['imageSmoothingEnabled'] = false; // standard
ctx['oImageSmoothingEnabled'] = false; // opera
ctx['webkitImageSmoothingEnabled'] = false; // safari
ctx['msImageSmoothingEnabled'] = false; // IE

// set background color to black.
document.body.style.background = BLACK;

// remove scroll bars from right and bottom window side.
document.body.style.overflow = 'hidden';

/***********************************
 *           DEFINE VARIABLES      *
 ***********************************/

let DOMAIN = "user@galaxy";
let CURSOR = "_";
let POINTER = ">";
let SPACE = " ";
let topScreenMargin = 10;
let isBlinkOn = false;
let pixels = 16;
let pixelFactor = 10;
let start_x = 20;
let start_y = 20;
let width_x = pixels * 0.6;
let line_spacing = 1;
let height_y = pixels + line_spacing;
let lastLine = -1;
let charY = 0;
let input = '';
let scrollProgressY = 0;
let commandHistory = [];
let historyIndex = -1;

/***********************************
 *           DEFINE FUNCTIONS      *
 ***********************************/

let line = DOMAIN + SPACE + POINTER;

/* NOTE: this might come in handy later!
function addDiv(line, lineIndex, color) {
  let myLayer = document.createElement('div');
  myLayer.style.fontFamily = 'monospace';
  myLayer.style.position = 'absolute';
  myLayer.style.left   = '10px';
  let newHeight = topScreenMargin + lineDifference * lineIndex;
  myLayer.style.top    = newHeight + 'px'
  myLayer.style.width  = maxWidth;
  myLayer.style.height = maxHeight;
  myLayer.style.color  = color;
  myLayer.innerHTML    = line;
  document.body.appendChild(myLayer);
}
*/

function fillChar(x, y) {
  ctx.clearRect(start_x + x * width_x - 1, start_y + (y - 1) * height_y + 4, width_x + 2, height_y + 1);
}

function appendLine(line, color, x, y) {
  ctx.font = 'bold ' + pixels + 'px courier';
  ctx.fillStyle = color;
  let ix = start_x + x * width_x;
  let iy = start_y + y * height_y;
  scrollProgressY = iy;
  checkForScrolling(0);
  ctx.fillText(line, ix, iy);
}

function checkForScrolling(offset) {
  if (maxHeight - scrollProgressY + offset < SCROLL_LIMIT_BOTTOM) {
    clearScreen();
  }
}

function blinkCursor() {
  let x = line.length + charY;
  let y = lastLine;
  if (isBlinkOn) {
    isBlinkOn = false;
    fillChar(x, y);
  } else {
    isBlinkOn = true;
    appendLine(CURSOR, GREEN, x, y);
  }
}

function removeText() {
  if (input.length > 0) {
    input = input.substring(0, input.length - 1);
  }
  fillChar(line.length + charY, lastLine); // clear last typed character.
  fillChar(line.length + charY + 1, lastLine); // clear cursor to the right.
}

function appendText(text) {
  input = input + text;
  clearInterval(cursorBlinking);
  fillChar(line.length + charY, lastLine);
  appendLine(text, GREEN, line.length + charY, lastLine);
  charY++;
  cursorBlinking = setInterval(blinkCursor, 500);
}

function writeOutput(text) {
  const parts = text.split('\n');
  for (const part of parts) {
    appendLine(part, GREEN, 0, lastLine);
    lastLine++;
  }
}

function evalInput(input) {
  input = input; // TODO: remove leading or trailing spaces.
  let isFound = false;
  for (const com of COMMANDS) {
    if (com.command === input) {
      commandHistory.push(com.command);
      if (isFunction(com.response)) {
        com.response.call();
      } else {
        writeOutput(com.response);
      }
      isFound = true;
      break;
    }
  }
  if (!isFound) {
    writeOutput("'" + input + "'" + ERR_MSG_CMD_NOT_FOUND);
  }
}

function isNotShift(code) {
  return code != 16;
}

function isNormalChar(code) {
  // TODO: also allow special characters like the following ((( ^&|/-+*\()[]{}~''"":!?.;,!@#$%_<> ))) .
  let isAlpha = code >= 65 && code <= 90
  let isNum = code >= 48 && code <= 57;
  let isSpace = code == 32;
  return isAlpha || isNum || isSpace;
}

function clearLine(index) {
  // TODO: implement.
}

function writePs1(color) {
  appendLine(line, color, 0, lastLine);
}

function handleKeyEvent(ev) {
  if (ev.keyCode == 8) { // BACKSPACE.
    clearInterval(cursorBlinking);
    if (charY > 0) {
      charY--;
      removeText();
    }
    cursorBlinking = setInterval(blinkCursor, 500);
  } else if (ev.keyCode == 38) { // UP ARROW.

    /* SOMETHING IS BROKEN (FIXME)

    // TODO: alternatively ctrl + p
    let newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
    if (newIndex != historyIndex) {
      clearInterval(cursorBlinking);
      input = '';
      clearLine(lastLine);
      writePs1(RED);
      historyIndex = newIndex;
      let oldCmd = commandHistory[historyIndex];
      appendText(oldCmd);
      charY = oldCmd.length;
      cursorBlinking = setInterval(blinkCursor, 500);
    }
    */

  } else if (ev.keyCode == 40) { // DOWN ARROW.

    /* SOMETHING IS BROKEN (FIXME)

    // TODO: alternatively ctrl + n
    historyIndex = Math.max(0, historyIndex - 1);

    */

  } else if (ev.keyCode == 13) { // RETURN or ENTER.

    // stop blinking.
    clearInterval(cursorBlinking);

    // clear cursor.
    fillChar(line.length + charY, lastLine); // clear cursor to the right.

    // reset values.
    historyIndex = -1;
    lastLine++;
    charY = 0;
    evalInput(input);
    input = '';

    // write output.
    writePs1(GREEN);

    // restart cursor.
    cursorBlinking = setInterval(blinkCursor, 500);

  } else if (isNotShift(ev.keyCode) && isNormalChar(ev.keyCode)) {
    let text = String.fromCharCode(ev.keyCode);
    if (ev.shiftKey) {
      appendText(text);
    } else {
      text = text.toLowerCase();
      appendText(text);
    }
  }
}

lastLine = LINE_START_VALUE;
appendLine(line, GREEN, 0, lastLine);
cursorBlinking = setInterval(blinkCursor, 500);

