import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Board from "@sabaki/go-board";
import { useEffect, useRef, useState } from "react";

import board_bg from "../../assets/images/board/board-bg.png";
import place_stone_sound from "../../assets/sounds/board/place-stone.wav";
import { GTPLetters } from "../../constants";
import { toRowColFormat } from "../../utils";
import Upload from "../global/Upload";
import Controls from "./Controls";

// Create audio instance once, outside component to avoid recreating on every render
const placeStoneSound = new Audio(place_stone_sound);

/**
 * Draws a Weiqi board with Pixi.js
 * @param {number} id - the id of the board
 * @param {object} data - The data object containing the game data
 * @param {number} moveIndex - The move you want to get to
 * @param {number} winRate - The win rate of the board
 * @returns The board component
 */
function GameBoard({
    id,
    gameData,
    analysisData,
    currentMove,
    setCurrentMove,
    maxVisits,
    setMaxVisits,
    setUseSamples,
    useSamples,
    setFiles,
    handleViewSample,
    isLoading,
    loadedValue,
    showRecommendedMoves,
    showPolicy,
    showOwnership,
    setShowRecommendedMoves,
    setShowPolicy,
    setShowOwnership,
}) {
    // Canvas variables
    const size = gameData?.size || 19;
    const canvasSize = 800;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (size - 1);
    const stoneRadius = margin / 2;
    let game = Board.fromDimensions(size);

    // React variables
    const canvasRef = useRef(null);
    const [emptyBoard, setEmptyBoard] = useState(null);

    useEffect(() => {
        if (size > 19 || size < 2) {
            throw new RangeError(
                `<size> must be between 2 - 19, received ${size}`
            );
        }

        // Adjust the canvas' size based on the screen
        const canvas = canvasRef.current;
        if (!canvas) return;

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
            drawBoard(ctx);
            drawCoords(ctx);
            setEmptyBoard(
                ctx.getImageData(0, 0, canvasSize * dpr, canvasSize * dpr)
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size]);

    useEffect(() => {
        if (!currentMove) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        emptyBoard ? ctx.putImageData(emptyBoard, 0, 0) : ""; // idk why but if I don't check if emptyBoard exists first, sometimes error occurs
        game.clear();

        for (let i = 0; i <= currentMove; i++) {
            const move = gameData.moves[i];

            // a null indicates an invalid move
            if (move.includes(null)) {
                continue;
            }

            placeStone(move);
        }
        placeStoneSound.play();
        drawStones(ctx);

        // Draw the recommended move if it exists
        if (analysisData && analysisData[currentMove]) {
            if (showRecommendedMoves) {
                for (
                    let i = 0;
                    i < analysisData[currentMove].response.moveInfos.length;
                    i++
                ) {
                    const move =
                        analysisData[currentMove].response.moveInfos[i];
                    const [row, col] = toRowColFormat(move.move);
                    const alpha = Math.max(0.25, 0.75 * 0.5 ** i); // Make sure the alpha is at least 0.25
                    const color = `rgba(255, 0, 0, ${alpha})`;

                    // The winrate is always for black, so we need to convert it to white's winrate
                    const rawWinRate =
                        currentMove % 2 === 0 ? move.winrate : 1 - move.winrate;
                    const winRate = (rawWinRate * 100).toFixed(1);
                    drawStone(ctx, row, col, color, false, winRate, "white");
                }
            }

            if (showOwnership) {
                const ownership = analysisData[currentMove].response.ownership;
                for (let i = 0; i < ownership.length; i++) {
                    const row = Math.floor(i / gameData.size);
                    const col = i % gameData.size;
                    if (game.get([row, col]) !== 0) continue;

                    const alpha = Math.min(
                        0.75,
                        Math.max(0.25, Math.abs(ownership[i]))
                    );
                    const color =
                        ownership[i] < 0
                            ? `rgba(0, 0, 0, ${alpha})`
                            : `rgba(255, 255, 255, ${alpha})`;
                    drawStone(
                        ctx,
                        row,
                        col,
                        color,
                        false,
                        null,
                        color.indexOf("255") === -1 ? "white" : "black"
                    );
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentMove,
        analysisData,
        showRecommendedMoves,
        showPolicy,
        showOwnership,
    ]);

    /**
     * Draw the game board with lines
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    const drawBoard = (ctx) => {
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
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    const drawCoords = (ctx) => {
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
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    const drawStones = (ctx) => {
        // Get the most recent move to highlight
        const lastMove =
            currentMove > 0 && currentMove < gameData.moves.length
                ? gameData.moves[currentMove]
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
                    ctx,
                    row,
                    col,
                    color === 1 ? "black" : "white",
                    isHighlighted,
                    null,
                    color === 1 ? "white" : "black"
                );
            }
        }
    };

    /**
     * Draw a stone based on the given information
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {number} row - the row of the move
     * @param {number} col - the column of the move
     * @param {string} color the color of the move
     * @param {boolean} highlight whether to highlight the move or not
     * @param {string} text the text to draw on the stone
     * @param {string} textColor the color of the text
     */
    const drawStone = (ctx, row, col, color, highlight, text, textColor) => {
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
                stoneRadius / 4,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        }

        if (text) {
            ctx.font = "12px Arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = textColor;
            ctx.fillText(
                text,
                padding + margin * col,
                canvasSize - padding - margin * row
            );
        }
    };

    return (
        <div className="relative">
            {isLoading && loadedValue > 0 && (
                <Box
                    sx={{
                        position: "absolute",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        backdropFilter: "blur(4px) brightness(0.5)",
                        zIndex: (theme) => theme.zIndex.appBar - 1,
                    }}
                >
                    <CircularProgress
                        size={120}
                        variant="determinate"
                        value={loadedValue}
                    />
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="body1"
                            component="div"
                            fontWeight={600}
                            sx={{ color: "primary.main" }}
                        >
                            {loadedValue.toFixed(1)}%
                        </Typography>
                    </Box>
                </Box>
            )}
            {useSamples[id] === null && (
                <Box
                    sx={{
                        position: "absolute",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        color: "#fff",
                        flexDirection: "column",
                        gap: 2,
                        backdropFilter: "blur(4px) brightness(0.5)",
                        zIndex: (theme) => theme.zIndex.appBar - 1,
                        animation: "fadeIn 0.3s ease",
                        "@keyframes fadeIn": {
                            from: {
                                opacity: 0,
                            },
                            to: {
                                opacity: 1,
                            },
                        },
                    }}
                >
                    <Upload
                        setFile={(file) => {
                            setFiles((prev) =>
                                prev.map((value, index) =>
                                    index === id ? file : value
                                )
                            );
                            setUseSamples((prev) =>
                                prev.map((value, index) =>
                                    index === id ? false : value
                                )
                            );
                        }}
                        accept={".sgf"}
                    />
                    <Link
                        component="button"
                        onClick={() => {
                            handleViewSample(id);
                        }}
                        sx={{
                            color: "primary.light",
                            textDecoration: "underline",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            mt: 2,
                            "&:hover": {
                                color: "primary.dark",
                            },
                        }}
                    >
                        View a sample
                        <OpenInNewIcon fontSize="small" />
                    </Link>
                </Box>
            )}
            <canvas
                ref={canvasRef}
                className="size-200"
                width={canvasSize}
                height={canvasSize}
            />
            <Controls
                id={id}
                currentMove={currentMove}
                setCurrentMove={setCurrentMove}
                maxVisits={maxVisits}
                setMaxVisits={setMaxVisits}
                maxMove={gameData?.moves.length}
                setShowRecommendedMoves={setShowRecommendedMoves}
                setShowPolicy={setShowPolicy}
                setShowOwnership={setShowOwnership}
                showRecommendedMoves={showRecommendedMoves}
                showPolicy={showPolicy}
                showOwnership={showOwnership}
            />
        </div>
    );
}

export default GameBoard;
