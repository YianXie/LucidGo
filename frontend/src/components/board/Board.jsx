import { useRef, useEffect, useState } from "react";
import { GTPLetters } from "../../constants";
import board_bg from "../../assets/images/board/board-bg.png";
import place_stone_sound from "../../assets/sounds/board/place-stone.wav";
import styles from "../../styles/components/board/Board.module.css";

/**
 * Draws a Weiqi board with Pixi.js
 * @param {object} data - The data object containing the game data
 * @returns {JSX.Element} - The board component
 */
function Board({ data, moveIndex }) {
    // Canvas variables
    const size = data?.size || 19;
    const canvasSize = 800;
    const fontSize = 15;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (size - 1);
    const stoneRadius = margin / 2;

    // React variables
    const canvasRef = useRef(null);
    const [emptyBoard, setEmptyBoard] = useState(null);
    const [currentBoard, setCurrentBoard] = useState(
        Array(size)
            .fill()
            .map(() => Array(size).fill(null))
    );

    // Assets
    const placeStoneSound = new Audio(place_stone_sound);

    useEffect(() => {
        if (size > 19 || size < 2) {
            throw new RangeError(
                `<size> must be between 2 - 19, received ${size}`
            );
        }

        // Adjust the canvas' size based on the screen
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.scale(dpr, dpr);

        // The background image
        const boardBg = new Image();
        boardBg.src = board_bg;

        boardBg.onload = () => {
            ctx.drawImage(boardBg, 0, 0, canvasSize, canvasSize);
            drawBoard();
            drawCoords();
            setEmptyBoard(
                ctx.getImageData(0, 0, canvasSize * dpr, canvasSize * dpr)
            );
        };
    }, [size]);

    useEffect(() => {
        if (!moveIndex) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.putImageData(emptyBoard, 0, 0);
        const newArray = Array(size)
            .fill()
            .map(() => Array(size).fill(null));
        setCurrentBoard(newArray);
        placeStoneSound.play();

        for (let i = 0; i <= moveIndex; i++) {
            const move = data.moves[i];

            if (move.includes(null)) {
                continue;
            }

            const [color, [row, col]] = move;
            placeStone(row, col, color, i === moveIndex ? true : false);
        }
    }, [moveIndex]);

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

    const placeStone = (row, col, color, highlight = false) => {
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

        if (highlight) {
            ctx.beginPath();
            ctx.arc(
                padding + margin * col,
                canvasSize - padding - margin * row,
                stoneRadius / 3,
                0,
                2 * Math.PI
            );
            ctx.stroke();
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className={styles.board}
            width={canvasSize}
            height={canvasSize}
        />
    );
}

export default Board;
