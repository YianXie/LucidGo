import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Board from "@sabaki/go-board";
import { useEffect, useRef, useState } from "react";

import board_bg from "../../assets/images/board/board-bg.png";
import { GTPLetters } from "../../constants";
import { toRowColFormat } from "../../utils";
import Upload from "../common/Upload";
import Controls from "./Controls";

function GameBoard({
    id,
    gameData,
    analysisData,
    isLoading,
    loadedValue,
    useAI,
    handleViewSample, // eslint-disable-line no-unused-vars
    handlePlayWithAI,
    currentMove,
    setCurrentMove,
    maxVisits,
    setMaxVisits,
    useSamples,
    setUseSamples, // eslint-disable-line no-unused-vars
    showRecommendedMoves,
    setShowRecommendedMoves,
    setFiles, // eslint-disable-line no-unused-vars
}) {
    // Canvas variables
    const boardSize = gameData?.size || 19;
    const canvasSize = 800;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (boardSize - 1);
    const stoneRadius = margin / 2;
    let game = Board.fromDimensions(boardSize);
    let playerColor = "B";

    // React variables
    const canvasRef = useRef(null);
    const [boardImageData, setBoardImageData] = useState(null);

    useEffect(() => {
        if (boardSize > 19 || boardSize < 2) {
            throw new RangeError(
                `<size> must be between 2 - 19, received ${boardSize}`
            );
        }

        // Adjust the canvas' size based on the screen
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasContext = canvas.getContext("2d", {
            willReadFrequently: true,
        });
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvasSize * devicePixelRatio;
        canvas.height = canvasSize * devicePixelRatio;
        canvasContext.scale(devicePixelRatio, devicePixelRatio);

        // The background image
        const boardBackgroundImage = new Image();
        boardBackgroundImage.src = board_bg;

        boardBackgroundImage.onload = () => {
            canvasContext.drawImage(
                boardBackgroundImage,
                0,
                0,
                canvasSize,
                canvasSize
            );
            drawBoard(canvasContext);
            drawCoords(canvasContext);
            setBoardImageData(
                canvasContext.getImageData(
                    0,
                    0,
                    canvasSize * devicePixelRatio,
                    canvasSize * devicePixelRatio
                )
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardSize]);

    useEffect(() => {
        if (!useAI) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener("mousemove", handleHover);
        canvas.addEventListener("click", handleClick);

        return () => {
            canvas.removeEventListener("mousemove", handleHover);
            canvas.removeEventListener("click", handleClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useAI]);

    useEffect(() => {
        if (!currentMove) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasContext = canvas.getContext("2d");
        boardImageData ? canvasContext.putImageData(boardImageData, 0, 0) : "";
        game.clear();

        for (let i = 0; i <= currentMove; i++) {
            const move = gameData.moves[i];

            // a null indicates an invalid move
            if (move.includes(null)) {
                continue;
            }

            placeStone(move);
        }
        drawStones(canvasContext);

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
                    drawStone(
                        canvasContext,
                        row,
                        col,
                        color,
                        true,
                        false,
                        winRate,
                        "white"
                    );
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMove, analysisData, showRecommendedMoves]);

    /**
     * Convert client coordinates to canvas coordinates
     * @param {number} x - The x coordinate of the client
     * @param {number} y - The y coordinate of the client
     * @returns {number[]} - The canvas coordinates [x, y]
     */
    const clientToCanvasCoords = (x, y) => {
        if (!canvasRef.current) return [null, null];

        const bounds = canvasRef.current.getBoundingClientRect();
        const canvasX = x - bounds.left;
        const canvasY = y - bounds.top;

        return [canvasX, canvasY];
    };

    /**
     * Convert board coordinates to canvas coordinates
     * @param {number} row - The row of the board
     * @param {number} col - The column of the board
     * @returns {number[]} - The canvas coordinates [x, y], [null, null] if row or col is out of the board
     */
    const boardToCanvasCoords = (row, col) => {
        // row or col is out of the board
        if (row < 0 || row > boardSize - 1 || col < 0 || col > boardSize - 1) {
            throw new RangeError(
                `<row> or <col> must be between 0 and ${boardSize - 1}, received ${row} or ${col}`
            );
        }

        return [
            margin * col + padding,
            (boardSize - row - 1) * margin + padding,
        ];
    };

    /**
     * Convert canvas coordinates to board coordinates
     * @param {number} x - The x coordinate of the canvas
     * @param {number} y - The y coordinate of the canvas
     * @returns {number[]} - The board coordinates [row, col], [null, null] if x or y is out of the canvas
     */
    const canvasToBoardCoords = (x, y) => {
        // x or y is out of the canvas
        if (
            x < padding ||
            x > canvasSize - padding ||
            y < padding ||
            y > canvasSize - padding
        ) {
            return [null, null];
        }

        return [
            Math.round(boardSize - 1 - (y - padding) / margin),
            Math.round((x - padding) / margin),
        ];
    };

    /**
     * Draw the game board with lines
     * @param {CanvasRenderingContext2D} canvasContext - The canvas context
     */
    const drawBoard = (canvasContext) => {
        for (let i = 0; i < boardSize; i++) {
            if (i === 0 || i === boardSize - 1) {
                canvasContext.lineWidth = 1.25;
            } else {
                canvasContext.lineWidth = 0.75;
            }

            // Vertical lines
            canvasContext.beginPath();
            canvasContext.moveTo(padding + margin * i, padding);
            canvasContext.lineTo(padding + margin * i, canvasSize - padding);

            // Horizontal lines
            canvasContext.moveTo(padding, padding + margin * i);
            canvasContext.lineTo(canvasSize - padding, padding + margin * i);

            canvasContext.stroke();
            canvasContext.closePath();

            if (boardSize === 19) {
                if ([4 - 1, 10 - 1, 16 - 1].includes(i)) {
                    // Draw the 3*3 dots
                    for (let x = 0; x < 3; x++) {
                        canvasContext.beginPath();
                        canvasContext.arc(
                            padding + margin * i,
                            padding + margin * (4 - 1) + margin * 6 * x,
                            stoneRadius / 4,
                            0,
                            2 * Math.PI
                        );
                        canvasContext.stroke();
                        canvasContext.fill();
                    }
                    canvasContext.closePath();
                }
            }
        }
    };

    /**
     * Draw the game board's coords at both side (letter + number, GTP format)
     * @param {CanvasRenderingContext2D} canvasContext - The canvas context
     */
    const drawCoords = (canvasContext) => {
        canvasContext.font = "15px Arial";
        canvasContext.textBaseline = "middle";
        canvasContext.textAlign = "center";
        canvasContext.fillStyle = "black";

        for (let i = 0; i < boardSize; i++) {
            // Draw the letters (exclude 'i')
            canvasContext.fillText(
                GTPLetters[i],
                padding + margin * i,
                canvasSize - padding / 2
            );
            canvasContext.fillText(
                GTPLetters[i],
                padding + margin * i,
                padding / 2
            );

            // Draw the numbers
            canvasContext.fillText(
                i + 1,
                canvasSize - padding / 2,
                canvasSize - padding - margin * i
            );
            canvasContext.fillText(
                i + 1,
                padding / 2,
                canvasSize - padding - margin * i
            );
        }
    };

    /**
     * Update the game variable based on the given data
     * @param {string[][]} move - The move data [color, [row, col]]
     */
    const placeStone = (move) => {
        const [color, [row, col]] = move;
        const sign = color.toUpperCase() === "B" ? 1 : -1;
        const check = game.analyzeMove(sign, [row, col]);
        if (!check.suicide && !check.ko && !check.overwrite) {
            game = game.makeMove(sign, [row, col]);
            playerColor = playerColor === "B" ? "W" : "B";
        }
    };

    /**
     * Draw all the stones out until moveIndex
     * @param {CanvasRenderingContext2D} canvasContext - The canvas context
     */
    const drawStones = (canvasContext) => {
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
                    canvasContext,
                    row,
                    col,
                    color === 1 ? "black" : "white",
                    true,
                    isHighlighted
                );
            }
        }
    };

    /**
     * Draw a stone based on the given information
     * @param {CanvasRenderingContext2D} canvasContext - The canvas context
     * @param {number} row - the row of the move
     * @param {number} col - the column of the move
     * @param {string} color the color of the move
     * @param {boolean} stroke whether to stroke the stone or not
     * @param {boolean} highlight whether to highlight the move or not
     * @param {string} text the text to draw on the stone
     * @param {string} textColor the color of the text
     */
    const drawStone = (
        canvasContext,
        row,
        col,
        color,
        stroke = true,
        highlight = false,
        text = null,
        textColor = "white"
    ) => {
        canvasContext.fillStyle = color;
        canvasContext.beginPath();
        const [canvasX, canvasY] = boardToCanvasCoords(row, col);
        canvasContext.arc(canvasX, canvasY, stoneRadius - 2, 0, 2 * Math.PI);
        if (stroke) canvasContext.stroke();
        canvasContext.fill();
        canvasContext.closePath();

        if (highlight) {
            // Draw a red dot in the center of the stone
            canvasContext.beginPath();
            canvasContext.arc(
                canvasX,
                canvasY,
                stoneRadius / 4,
                0,
                2 * Math.PI
            );
            canvasContext.fillStyle = "red";
            canvasContext.fill();
            canvasContext.closePath();
        }

        if (text) {
            canvasContext.font = "12px Arial";
            canvasContext.textBaseline = "middle";
            canvasContext.textAlign = "center";
            canvasContext.fillStyle = textColor;
            canvasContext.fillText(text, canvasX, canvasY);
        }
    };

    const handleHover = (event) => {
        const { clientX, clientY } = event;
        const [canvasX, canvasY] = clientToCanvasCoords(clientX, clientY);
        const [row, col] = canvasToBoardCoords(canvasX, canvasY);

        const canvasContext = canvasRef.current.getContext("2d");
        boardImageData ? canvasContext.putImageData(boardImageData, 0, 0) : "";
        drawStones(canvasContext);
        if (row !== null && col !== null) {
            const check = game.analyzeMove(playerColor === "B" ? 1 : -1, [
                row,
                col,
            ]);
            if (!check.suicide && !check.ko && !check.overwrite) {
                canvasRef.current.style.cursor = "pointer";
                const color =
                    playerColor === "B"
                        ? "rgba(0, 0, 0, 0.5)"
                        : "rgba(255, 255, 255, 0.5)";
                drawStone(canvasContext, row, col, color, false);
            } else {
                canvasRef.current.style.cursor = "not-allowed";
            }
        } else {
            canvasRef.current.style.cursor = "default";
        }
    };

    const handleClick = (event) => {
        const { clientX, clientY } = event;
        const [canvasX, canvasY] = clientToCanvasCoords(clientX, clientY);
        const [row, col] = canvasToBoardCoords(canvasX, canvasY);

        // const canvasContext = canvasRef.current.getContext("2d");
        if (row !== null && col !== null) {
            placeStone([playerColor, [row, col]]);
        }
    };

    return (
        <Box
            sx={{
                position: "relative",
            }}
        >
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
            {useSamples === null && useAI === false && (
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
                    }}
                >
                    <Upload
                        setFile={() => {
                            alert(
                                "WIP: Uploading a new game is not supported yet"
                            );
                            // setFiles((prev) =>
                            //     prev.map((value, index) =>
                            //         index === id ? file : value
                            //     )
                            // );
                            // setUseSamples((prev) =>
                            //     prev.map((value, index) =>
                            //         index === id ? false : value
                            //     )
                            // );
                        }}
                        accept={".sgf"}
                    />
                    <Link
                        component="button"
                        onClick={() => {
                            alert("WIP: Viewing a sample is not supported yet");
                            // handleViewSample(id);
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
                    <Link
                        component="button"
                        onClick={() => {
                            handlePlayWithAI(id);
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
                        Play with AI
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
                maxMove={gameData?.moves.length}
                setCurrentMove={setCurrentMove}
                maxVisits={maxVisits}
                setMaxVisits={setMaxVisits}
                showRecommendedMoves={showRecommendedMoves}
                setShowRecommendedMoves={setShowRecommendedMoves}
            />
        </Box>
    );
}

export default GameBoard;
