import { useRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GTPLetters } from "../constants";
import board_bg from "../assets/images/board/board-bg.png";
import styles from "../styles/Board.module.css";

function Board({ data, size = 19 }) {
    const canvasRef = useRef(null);
    const [currentMove, setCurrentMove] = useState(0);
    const [currentBoard, setCurrentBoard] = useState(
        Array(size).fill(Array(size).fill(null))
    );
    const canvasSize = 800;
    const fontSize = 15;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (size - 1);
    const stoneRadius = margin / 2;

    useEffect(() => {
        if (size > 19 || size < 2) {
            throw new RangeError(
                `<size> must be between 2 - 19, received ${size}`
            );
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.scale(dpr, dpr);

        const boardBg = new Image();
        boardBg.src = board_bg;

        boardBg.onload = () => {
            ctx.drawImage(boardBg, 0, 0, canvasSize, canvasSize);
            drawBoard();
            drawCoords();
        };
    }, []);

    const drawBoard = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < size; i++) {
            if (i === 0 || i === size - 1) {
                ctx.lineWidth = 1.25;
            } else {
                ctx.lineWidth = 0.75;
            }

            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(padding + margin * i, padding);
            ctx.lineTo(padding + margin * i, canvasSize - padding);

            // Horizontal lines
            ctx.moveTo(padding, padding + margin * i);
            ctx.lineTo(canvasSize - padding, padding + margin * i);

            ctx.stroke();
            ctx.closePath();

            if (size === 19) {
                if ([4 - 1, 10 - 1, 16 - 1].includes(i)) {
                    // Draw the 3*3 dots
                    for (let x = 0; x < 3; x++) {
                        ctx.beginPath();
                        ctx.arc(
                            padding + margin * i,
                            padding + margin * (4 - 1) + margin * 6 * x,
                            stoneRadius / 4,
                            0,
                            2 * Math.PI
                        );
                        ctx.stroke();
                        ctx.fill();
                    }
                    ctx.closePath();
                }
            }
        }
    };

    const drawCoords = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.font = `${fontSize}px Arial`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";

        for (let i = 0; i < size; i++) {
            // Draw the letters (exclude 'i')
            ctx.fillText(
                GTPLetters[i],
                padding + margin * i,
                canvasSize - padding / 2
            );
            ctx.fillText(GTPLetters[i], padding + margin * i, padding / 2);

            // Draw the numbers
            ctx.fillText(
                i + 1,
                canvasSize - padding / 2,
                canvasSize - padding - margin * i
            );
            ctx.fillText(i + 1, padding / 2, canvasSize - padding - margin * i);
        }
    };

    const placeStone = (row, col, color) => {
        const newBoard = [...currentBoard];
        newBoard[row][col] = color;
        setCurrentBoard(newBoard);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        color === "b" ? (ctx.fillStyle = "black") : (ctx.fillStyle = "white");
        ctx.beginPath();
        ctx.arc(
            padding + margin * col,
            canvasSize - padding - margin * row,
            stoneRadius - 2,
            0,
            2 * Math.PI
        );
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    };

    const removeStone = (row, col) => {
        if (currentBoard[row][col] === null) {
            toast.warn("No stone to remove");
            return;
        }

        const newBoard = [...currentBoard];
        newBoard[row][col] = null;
        setCurrentBoard(newBoard);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(
            padding + margin * col,
            canvasSize - padding - margin * row,
            stoneRadius,
            stoneRadius
        );
    };

    const updateCurrentMove = (amount) => {
        if (!data) {
            toast.warn("No .sgf file uploaded");
            return;
        }
        if (currentMove + amount < 0) {
            toast.warn("Already at the start");
            return;
        }
        if (currentMove + amount > data.moves.length) {
            toast.warn("Already at the end");
            return;
        }
        setCurrentMove(currentMove + amount);

        if (amount === 1) {
            const move = data.moves[currentMove + amount];
            const [color, [row, col]] = move;
            placeStone(row, col, color);
        } else {
            const move = data.moves[currentMove + amount];
            const [color, [row, col]] = move;
            removeStone(row, col);
        }
    };

    return (
        <div className={styles.container}>
            <canvas
                ref={canvasRef}
                id="board"
                className={styles.board}
                width={canvasSize}
                height={canvasSize}
            >
                <p>Your browser does not support the canvas tag.</p>
            </canvas>
            <div className={styles.controls}>
                <button
                    onClick={() => {
                        updateCurrentMove(-1);
                    }}
                >
                    Previous
                </button>
                <button
                    onClick={() => {
                        updateCurrentMove(1);
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Board;
