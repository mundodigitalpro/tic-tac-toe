import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Confetti = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
      angle: Math.random() * 6 - 3,
    }));
    
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + particle.angle,
        })).filter(particle => particle.y < 120)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  );
};

const PlayerSelection = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose your letter:</h3>
        <p className="text-sm text-gray-500">Computer will play as the other letter</p>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onSelect('X')}
          className="h-24 w-24 text-4xl font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105 transition-all duration-200"
          variant="ghost"
        >
          X
        </Button>
        <Button
          onClick={() => onSelect('O')}
          className="h-24 w-24 text-4xl font-bold bg-rose-100 text-rose-600 hover:bg-rose-200 hover:scale-105 transition-all duration-200"
          variant="ghost"
        >
          O
        </Button>
      </div>
    </div>
  );
};

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [playerLetter, setPlayerLetter] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winningLine, setWinningLine] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [scores, setScores] = useState({
    player: 0,
    computer: 0,
    draws: 0
  });

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return squares.every(square => square !== '') ? { winner: 'Draw' } : null;
  };

  const findBestMove = (squares) => {
    const computerLetter = playerLetter === 'X' ? 'O' : 'X';
    const availableMoves = squares.map((square, index) => square === '' ? index : null).filter(val => val !== null);
    
    // Añadir algo de aleatoriedad (20% de probabilidad de hacer un movimiento aleatorio)
    if (Math.random() < 0.2) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // A veces (30% de probabilidad) no bloquea el movimiento ganador del jugador
    const shouldBlock = Math.random() > 0.3;
    
    // Tomar el centro si está disponible (70% de probabilidad)
    if (squares[4] === '' && Math.random() < 0.7) return 4;
    
    // Buscar movimiento ganador
    for (const move of availableMoves) {
      const boardCopy = [...squares];
      boardCopy[move] = computerLetter;
      if (calculateWinner(boardCopy)?.winner === computerLetter) return move;
    }
    
    // Bloquear movimiento ganador del jugador
    if (shouldBlock) {
      for (const move of availableMoves) {
        const boardCopy = [...squares];
        boardCopy[move] = playerLetter;
        if (calculateWinner(boardCopy)?.winner === playerLetter) return move;
      }
    }
    
    // Preferir esquinas pero no siempre (50% de probabilidad)
    const corners = [0, 2, 6, 8].filter(corner => squares[corner] === '');
    if (corners.length > 0 && Math.random() < 0.5) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
    
    // Movimiento aleatorio en cualquier posición disponible
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const makeComputerMove = async (currentBoard) => {
    if (gameOver) return;
    
    setIsThinking(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const computerLetter = playerLetter === 'X' ? 'O' : 'X';
      const move = findBestMove(currentBoard);
      
      if (move !== undefined && currentBoard[move] === '') {
        const newBoard = Array.from(currentBoard);
        newBoard[move] = computerLetter;
        setBoard(newBoard);
        
        const result = calculateWinner(newBoard);
        if (result) {
          setGameOver(true);
          if (result.winner !== 'Draw') {
            setWinningLine(result.line);
            setShowCelebration(result.winner === playerLetter);
            setScores(prev => ({
              ...prev,
              computer: prev.computer + (result.winner === computerLetter ? 1 : 0),
              player: prev.player + (result.winner === playerLetter ? 1 : 0)
            }));
          } else {
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
          }
        }
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleClick = async (index) => {
    if (board[index] !== '' || gameOver || isThinking) return;

    const newBoard = Array.from(board);
    newBoard[index] = playerLetter;
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setGameOver(true);
      if (result.winner !== 'Draw') {
        setWinningLine(result.line);
        setShowCelebration(true);
        setScores(prev => ({
          ...prev,
          player: prev.player + 1
        }));
      } else {
        setScores(prev => ({
          ...prev,
          draws: prev.draws + 1
        }));
      }
    } else {
      await makeComputerMove(newBoard);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setGameOver(false);
    setShowCelebration(false);
    setWinningLine(null);
    setIsThinking(false);
  };

  const resetAll = () => {
    resetGame();
    setGameStarted(false);
    setPlayerLetter(null);
    setScores({
      player: 0,
      computer: 0,
      draws: 0
    });
  };

  const handlePlayerSelection = (letter) => {
    setPlayerLetter(letter);
    setGameStarted(true);
    
    if (letter === 'O') {
      setTimeout(() => {
        makeComputerMove(Array(9).fill(''));
      }, 100);
    }
  };

  const result = calculateWinner(board);
  const status = result
    ? result.winner === 'Draw'
      ? "It's a draw!"
      : result.winner === playerLetter
        ? "You won! 🎉"
        : "Computer won!"
    : isThinking
      ? "Computer is thinking..."
      : `Your turn (${playerLetter})`;

  const getSquareColor = (value, index) => {
    if (winningLine?.includes(index)) {
      return value === 'X' 
        ? 'bg-blue-200 text-blue-700 animate-pulse border-blue-300' 
        : 'bg-rose-200 text-rose-700 animate-pulse border-rose-300';
    }
    if (value === '') return 'hover:bg-gray-50 bg-gray-50/50';
    return value === 'X' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-rose-100 text-rose-600 border-rose-200';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Card className="w-96 bg-white border-2 relative overflow-hidden shadow-xl">
        {showCelebration && <Confetti />}
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Tic Tac Toe
          </CardTitle>
          {gameStarted && (
            <>
              <div className="flex justify-center gap-8 text-sm font-medium">
                <div className="text-center">
                  <div className="text-blue-600">You</div>
                  <div className="text-2xl font-bold">{scores.player}</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-600">Draws</div>
                  <div className="text-2xl font-bold">{scores.draws}</div>
                </div>
                <div className="text-center">
                  <div className="text-rose-600">Computer</div>
                  <div className="text-2xl font-bold">{scores.computer}</div>
                </div>
              </div>
              <div className={`text-lg font-medium text-center p-2 rounded-lg ${
                result?.winner === 'Draw' 
                  ? 'text-orange-600 bg-orange-50'
                  : result?.winner 
                    ? 'text-green-600 bg-green-50 animate-bounce' 
                    : isThinking
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600'
              }`}>
                {status}
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <PlayerSelection onSelect={handlePlayerSelection} />
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-xl shadow-md border border-gray-100">
                {board.map((value, index) => (
                  <Button
                    key={index}
                    onClick={() => handleClick(index)}
                    className={`h-20 w-20 text-3xl font-bold transition-all duration-200 border-2 border-gray-200
                      ${getSquareColor(value, index)} 
                      ${value === '' && !gameOver && !isThinking ? 'hover:scale-105' : ''}
                      ${gameOver && !winningLine?.includes(index) ? 'opacity-80' : ''}
                    `}
                    variant="ghost"
                    disabled={gameOver || value !== '' || isThinking}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col gap-4 w-full">
                <Button 
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 font-semibold py-6"
                >
                  Next Game
                </Button>
                <Button 
                  onClick={resetAll}
                  className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 font-semibold py-6"
                  variant="ghost"
                >
                  Reset All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicTacToe;