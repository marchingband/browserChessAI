import React from 'react'
import ReactDOM from 'react-dom'
import {runInDebugContext} from 'vm'

const initBoard = [
  'r',
  'kn',
  'b',
  'k',
  'q',
  'b',
  'kn',
  'r',
  'p',
  'p',
  'p',
  'p',
  'p',
  'p',
  'p',
  'p',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  'P',
  'P',
  'P',
  'P',
  'P',
  'P',
  'P',
  'P',
  'R',
  'KN',
  'B',
  'K',
  'Q',
  'B',
  'KN',
  'R'
]

var F_
const r_ = (x, fn) => {
  if (fn) {
    F_ = fn
  }
  return F_(x)
}
var R_ = f => a => r_(a, f)
const inPlay = (x, d) => {
  let a = co(x)[0] + d[0],
    b = co(x)[1] + d[1]
  return a >= 0 && a < 8 && b >= 0 && b < 8
}
const isWhite = p => p != '' && p.toUpperCase() == p
const isBlack = p => p != '' && p.toUpperCase() != p
const step = (x, d) => dex(co(x)[0] + d[0], co(x)[1] + d[1])
const co = x => [x % 8, Math.trunc(x / 8)]
const dex = (x, y) => x + y * 8
const isCap = piece => piece.toUpperCase() == piece && piece != ''
const valueOf = p => {
  if (p.toUpperCase() == 'P') {
    return 1
  }
  if (p.toUpperCase() == 'B') {
    return 3
  }
  if (p.toUpperCase() == 'KN') {
    return 3
  }
  if (p.toUpperCase() == 'R') {
    return 5
  }
  if (p.toUpperCase() == 'Q') {
    return 8
  }
  if (p == 'K') {
    return 100
  }
  if (p == 'k') {
    return 1000
  }
  return 0
}

const B_DS = [[1, 1], [1, -1], [-1, -1], [-1, 1]]
const R_DS = [[1, 0], [0, 1], [-1, 0], [0, -1]]
const RK_DS = [
  [2, 1],
  [2, -1],
  [1, 2],
  [1, -2],
  [-2, 1],
  [-2, -1],
  [-1, 2],
  [-1, -2]
]

class Piece extends React.Component {
  constructor() {
    super()
    this.state = {
      hovered: false
    }
  }
  render() {
    var {index, piece, active, inMove, legal, onclick} = this.props
    var isPiece = false
    if (piece != '') {
      isPiece = true
    }
    return (
      <div
        style={{
          ...squareStyle,
          backgroundColor: active
            ? '#8bafaf'
            : inMove && legal && this.state.hovered
              ? '#fff7e2'
              : (Math.trunc(index / 8) % 2 != 0 && index % 2 != 0) ||
                (Math.trunc(index / 8) % 2 == 0 && index % 2 == 0)
                ? 'darkgray'
                : 'grey',
          cursor: legal ? 'pointer' : 'auto'
        }}
        onClick={onclick}
        onMouseEnter={() => this.setState({hovered: true})}
        onMouseOut={() => this.setState({hovered: false})}
      >
        {isPiece && (
          <div
            style={{
              ...pieceStyle,
              color: isWhite(piece) ? 'black' : 'white',
              backgroundColor: isWhite(piece) ? 'white' : 'black'
            }}
          >
            {piece.toUpperCase()}
          </div>
        )}
      </div>
    )
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      board: initBoard,
      // [
      //   '','kn','b','k','q','b','kn','r',
      //   'P', 'p','','p','p','p','p' ,'p',
      //   '' , '' ,'' ,'' ,'' ,'' ,''  ,'' ,
      //   '' , '' ,'' ,'' ,'' ,'' ,''  ,'' ,
      //   '' , '' ,'' ,'' ,'' ,'' ,''  ,'' ,
      //   '' , '' ,'' ,'' ,'' ,'' ,''  ,'' ,
      //   '', '','','','','','' ,'',
      //   'R','','','K','','','','R',
      // ]
      ms: [],
      turn: false,
      active: undefined,
      gameOver: false,
      crown: false,
      canCastleL: true,
      canCastleR: true
    }
  }
  componentDidMount() {
    var ms = this.getMoves(this.state.board, this.state.turn)
    this.setState({ms})
  }
  getMoves(board, turn) {
    var ms = board.map(x => [])
    board.forEach((p, i, b) => {
      switch (p.toUpperCase()) {
        case 'R':
          R_DS.forEach(d =>
            R_(
              j =>
                inPlay(j, d) &&
                (b[j] == '' || j == i) &&
                ms[i].push(step(j, d)) &&
                r_(step(j, d))
            )(i)
          )
          break
        case 'KN':
          RK_DS.forEach(d => inPlay(i, d) && ms[i].push(step(i, d)))
          break
        case 'K':
          ;[...R_DS, ...B_DS].forEach(
            d => inPlay(i, d) && ms[i].push(step(i, d))
          )
          break
        case 'B':
          B_DS.forEach(d => {
            for (
              var x = i;
              inPlay(x, d) && (x == i || b[x] == '');
              x = step(x, d), ms[i].push(x)
            ) {}
          })
          break
        case 'Q':
          ;[...R_DS, ...B_DS].forEach(d => {
            for (
              var x = i;
              inPlay(x, d) && (x == i || b[x] == '');
              x = step(x, d), ms[i].push(x)
            ) {}
          })
          break
        case 'P':
          ;((a, ds) =>
            [ds[2], ds[3]]
              .filter(d => b[step(i, d)] != '')
              .concat(
                b[step(i, ds[0])] != ''
                  ? []
                  : co(i)[1] == a && b[step(i, ds[1])] == ''
                    ? [ds[0], ds[1]]
                    : [ds[0]]
              ))(
            turn ? 1 : 6,
            turn
              ? [[0, 1], [0, 2], [1, 1], [-1, 1]]
              : [[0, -1], [0, -2], [1, -1], [-1, -1]]
          ).forEach(d => inPlay(i, d) && ms[i].push(step(i, d)))
          break
      }
    })
    ms = ms.map(
      (m, i) =>
        isCap(board[i]) != turn
          ? m.filter(p => board[p] == '' || isCap(board[p]) == turn)
          : []
    )
    return ms
  }
  getBoards(board, turn) {
    var ms = this.getMoves(board, turn)
    var possibleBoards = []
    ms.forEach((moves, origin) => {
      moves.forEach(destination => {
        possibleBoards.push(this.movePiece(origin, destination, board))
      })
    })
    return possibleBoards
  }
  movePiece = (from, to, board) => {
    var newBoard = [...board]
    newBoard[to] = newBoard[from]
    newBoard[from] = ''
    newBoard.destination = to
    return newBoard
  }
  checkForMate = b => {
    if (b.includes('k') && b.includes('K')) {
      return
    }
    this.setState({gameOver: true})
  }
  crown = b => [0, 1, 2, 3, 4, 5, 6, 7].some(x => b[x] == 'P')
  handleCrown = i => {
    var {board, crown} = this.state
    if (!crown) {
      return
    }
    board[board.indexOf('P')] = this.getWhiteBoneYard(board)[i]
    this.setState(
      {
        board,
        crown: false,
        turn: true,
        ms: this.getMoves(board),
        active: undefined,
        inMove: false
      },
      () => setTimeout(() => this.blackTurn(board), 100)
    )
  }
  getBlackBoneYard = b => {
    var board = [...b].filter(x => isBlack(x))
    var blacks = [...initBoard].filter(x => isBlack(x))
    board.forEach(p => {
      blacks.splice(blacks.indexOf(p), 1)
    })
    return blacks
  }
  getWhiteBoneYard = b => {
    var board = [...b].filter(x => isWhite(x))
    var whites = [...initBoard].filter(x => isWhite(x))
    board.forEach(p => {
      whites.splice(whites.indexOf(p), 1)
    })
    return whites
  }
  askToCastle = () => window.confirm('Do you want to Castle?')
  handleClickPiece = i => {
    const {
      ms,
      board,
      from,
      inMove,
      turn,
      gameOver,
      crown,
      canCastleL,
      canCastleR
    } = this.state
    if (turn || gameOver || crown || (!inMove && board[i] == '')) {
      return
    }
    if (inMove && (from == i || !ms[from].includes(i))) {
      return this.setState({inMove: false, active: undefined})
    }
    if (inMove) {
      var newBoard = this.movePiece(from, i, [...board])
      this.checkForMate(newBoard)
      if (this.crown(newBoard)) {
        return this.setState({crown: true, board: newBoard})
      }
      if (canCastleR && i == 60 && newBoard[60] == 'R' && this.askToCastle()) {
        newBoard = this.movePiece(59, 61, newBoard)
        this.setState({canCastleL: false, canCastleR: false})
      }
      if (canCastleL && i == 58 && newBoard[58] == 'R' && this.askToCastle()) {
        newBoard = this.movePiece(59, 57, newBoard)
        this.setState({canCastleL: false, canCastleR: false})
      }
      if ((canCastleL || canCastleR) && board[from] == 'K') {
        this.setState({canCastleL: false, canCastleR: false})
      }
      if (canCastleL && from == 56) {
        console.log('no left')
        this.setState({canCastleL: false})
      }
      if (canCastleR && from == 63) {
        console.log('no right')
        this.setState({canCastleR: false})
      }
      var newTurn = !turn
      var newMs = this.getMoves(newBoard, newTurn)
      this.setState(
        {
          board: newBoard,
          inMove: false,
          ms: newMs,
          turn: newTurn,
          active: undefined
        },
        () => setTimeout(() => this.blackTurn(newBoard), 100)
      )
    } else {
      this.setState({from: i, inMove: true, active: i})
    }
  }
  blackTurn(board) {
    const moves = this.getBoards(board, true) // black moves
    var maxVal = -Infinity
    var maxValI = 0
    for (var i = 0; i < moves.length; i++) {
      // Maximizer
      var minVal = Infinity
      var wMoves = this.getBoards(moves[i], false) // white moves
      for (var ii = 0; ii < wMoves.length; ii++) {
        // Minimizer
        var maxVal2 = -Infinity
        let bMoves = this.getBoards(wMoves[ii], true) // blackMoves2
        for (var iii = 0; iii < bMoves.length; iii++) {
          // Maximizer
          var minVal2 = Infinity
          var wMoves2 = this.getBoards(bMoves[iii])
          for (var iiii = 0; iiii < wMoves2.length; iiii++) {
            var boardVal = this.getBoardValue(wMoves2[iiii])
            var positionVal = this.getBoardPositionalValue(wMoves2[iiii])
            var moveVal = boardVal * 10 + positionVal
            if (moveVal < minVal2) {
              minVal2 = moveVal
            }
            if (moveVal < maxVal2) {
              break
            }
          }
          if (minVal2 > maxVal2) {
            maxVal2 = moveVal
          }
          if (minVal2 > minVal) {
            break
          }
        }
        if (maxVal2 < minVal) {
          minVal = maxVal2
        }
        if (maxVal2 < maxVal) {
          break
        }
      }
      if (minVal > maxVal) {
        maxVal = minVal
        maxValI = i
      }
    }
    const choice = moves[maxValI]
    this.checkForMate(choice)
    this.setState({
      board: choice,
      turn: false,
      ms: this.getMoves(choice, false)
    })
  }
  getBoardValue = b =>
    b.reduce(
      (acc, cur) => (isWhite(cur) ? acc - valueOf(cur) : acc + valueOf(cur)),
      0
    )
  getBoardPositionalValue(b) {
    var positionScore = 0
    ;[26, 27, 28, 29].forEach(n => isBlack(b[n]) && (positionScore += 1))
    ;[34, 35, 36, 37].forEach(n => isBlack(b[n]) && (positionScore += 2))
    ;[42, 43, 44, 45].forEach(n => isBlack(b[n]) && (positionScore += 3))
    return positionScore
  }
  render() {
    const {board, inMove, ms, active, gameOver, crown} = this.state
    return (
      <div>
        <div
          style={{
            ...boneYardStyle,
            paddingBottom: '40px',
            backgroundColor: crown ? '#8bafaf' : 'grey'
          }}
        >
          {this.getWhiteBoneYard(board).map((x, i) => (
            <div
              style={{
                ...pieceStyle,
                color: isWhite(x) ? 'black' : 'white',
                backgroundColor: isWhite(x) ? 'white' : 'black'
              }}
              onClick={() => this.handleCrown(i)}
            >
              {x.toUpperCase()}
            </div>
          ))}
        </div>
        <div
          style={{...boardStyle, backgroundColor: gameOver ? 'red' : 'black'}}
        >
          {board.map((p, i) => (
            <Piece
              active={active == i}
              legal={inMove && ms[active].includes(i)}
              piece={p}
              index={i}
              onclick={() => this.handleClickPiece(i)}
              inMove={inMove}
            />
          ))}
        </div>
        <div style={{...boneYardStyle, paddingTop: '40px'}}>
          {this.getBlackBoneYard(board).map((x, i) => (
            <div
              style={{
                ...pieceStyle,
                color: isWhite(x) ? 'black' : 'white',
                backgroundColor: isWhite(x) ? 'white' : 'black'
              }}
            >
              {x.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
const boardStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  width: '320px',
  height: '320px',
  justifyContent: 'center',
  alignItems: 'center',
  userSelect: 'none'
}
const boneYardStyle = {
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'gray',
  height: '40px',
  width: '320px'
}
const pieceStyle = {
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  height: '28px',
  width: '28px',
  borderColor: 'white',
  borderWidth: '1px',
  borderRadius: '30px',
  margin: '1px',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  userSelect: 'none'
}
const squareStyle = {
  display: 'flex',
  flexDirection: 'row',
  height: '38px',
  width: '38px',
  borderWidth: '1px',
  margin: '1px',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  userSelect: 'none'
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
