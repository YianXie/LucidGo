import { useRef, useEffect, useState } from "react";
import { GTPLetters } from "../../constants";
import { toRowColFormat } from "../../utils";
import Board from "@sabaki/go-board";
import board_bg from "../../assets/images/board/board-bg.png";
import place_stone_sound from "../../assets/sounds/board/place-stone.wav";
import styles from "../../styles/components/board/Board.module.css";

/**
 * Draws a Weiqi board with Pixi.js
 * @param {object} data - The data object containing the game data
 * @param {number} moveIndex - The move you want to get to
 * @returns The board component
 */
function GameBoard({ data, moveIndex }) {
    // Canvas variables
    const size = data?.size || 19;
    const canvasSize = 800;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (size - 1);
    const stoneRadius = margin / 2;
    let game = Board.fromDimensions(size);

    // React variables
    const canvasRef = useRef(null);
    const [emptyBoard, setEmptyBoard] = useState(null);

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
        emptyBoard ? ctx.putImageData(emptyBoard, 0, 0) : ""; // idk why but if I don't check if emptyBoard exists first, sometimes error occurs
        game.clear();

        for (let i = 0; i <= moveIndex; i++) {
            const move = data.moves[i];

            // a null indicates an invalid move
            if (move.includes(null)) {
                continue;
            }

            placeStone(move);
        }
        placeStoneSound.play();
        drawStones();
    }, [moveIndex]);

    /**
     * Draw the game board with lines
     */
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

    /**
     * Draw the game board's coords at both side (letter + number, GTP format)
     */
    const drawCoords = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.font = "15px Arial";
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

    /**
     * Update the game variable based on the given data
     * @param {string[][]} move - The move data [color, [row, col]]
     */
    const placeStone = (move) => {
        const [color, [row, col]] = move;
        const sign = color === "b" ? 1 : -1;
        const check = game.analyzeMove(sign, [row, col]);
        if (!check.suicide && !check.ko && !check.overwrite) {
            game = game.makeMove(color === "b" ? 1 : -1, [row, col]);
        }
    };

    /**
     * Draw all the stones out until moveIndex
     */
    const drawStones = () => {
        // Get the most recent move to highlight
        const lastMove =
            moveIndex > 0 && moveIndex < data.moves.length
                ? data.moves[moveIndex]
                : null;
        let lastMoveCoords = null;

        if (lastMove && !lastMove.includes(null)) {
            const [, [row, col]] = lastMove;
            lastMoveCoords = [row, col];
        }

        for (let row = 0; row < game.signMap.length; row++) {
            for (let col = 0; col < game.signMap[row].length; col++) {
                const color = game.get([row, col]);

                // if color is 0, it means there is no move at that point
                if (color === 0) {
                    continue;
                }

                // Check if this stone is the most recent move
                const isHighlighted =
                    lastMoveCoords &&
                    lastMoveCoords[0] === row &&
                    lastMoveCoords[1] === col;

                drawStone(
                    row,
                    col,
                    color === 1 ? "black" : "white",
                    isHighlighted
                );
            }
        }
    };

    /**
     * Draw a stone based on the given information
     * @param {number} row - the row of the move
     * @param {number} col - the column of the move
     * @param {string} color the color of the move (either black or white)
     * @param {boolean} highlight whether to highlight the move or not
     */
    const drawStone = (row, col, color, highlight) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
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
            // Draw a red dot in the center of the stone
            ctx.beginPath();
            ctx.arc(
                padding + margin * col,
                canvasSize - padding - margin * row,
                stoneRadius / 4, // Smaller dot for better visibility
                0,
                2 * Math.PI
            );
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        }
    };

    const drawRecommendedMove = (row, col, color, winRate) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Draw the red circle
        ctx.beginPath();
        ctx.arc(
            padding + margin * col,
            canvasSize - padding - margin * row,
            stoneRadius - 2,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        // Write the winrate text
        ctx.font = `12px Arial`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(
            winRate,
            padding + margin * col,
            canvasSize - padding - margin * row
        );
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

export default GameBoard;
