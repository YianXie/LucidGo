import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Board from "@sabaki/go-board";
import { useEffect, useRef, useState } from "react";

import api from "../../api";
import board_bg from "../../assets/images/board/board-bg.png";
import { GTPLetters, getAnalysisURL } from "../../constants";
import { toGTPFormat, toRowColFormat } from "../../utils";
import Upload from "../common/Upload";
import Controls from "./Controls";

function GameBoard({
    boardIdx,
    gameData,
    analysisData,
    isLoading,
    loadedValue,
    useAI,
    handleViewSample,
    handlePlayWithAI,
    currentMove,
    setCurrentMove,
    useSamples,
    setUseSamples,
    showRecommendedMoves,
    setShowRecommendedMoves,
    setFiles,
}) {
    // Canvas variables
    const boardSize = gameData?.size || 19;
    const canvasSize = 800;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (boardSize - 1);
    const stoneRadius = margin / 2;

    // Single Board instance for play/hover — must not be recreated when listeners re-bind.
    const gameRef = useRef(Board.fromDimensions(boardSize));
    const toPlayRef = useRef("B");

    // React variables
    const canvasRef = useRef(null);
    const [boardImageData, setBoardImageData] = useState(null);
    const [toPlay, setToPlay] = useState("B");
    const [moves, setMoves] = useState(gameData?.moves || []);
    const movesRef = useRef(moves);
    movesRef.current = moves;

    const hoverRef = useRef(null);
    const clickRef = useRef(null);

    toPlayRef.current = toPlay;

    useEffect(() => {
        if (!gameData) return;
        setMoves(gameData.moves || []);
    }, [gameData]);

    /** Plies to replay: live moves in AI mode; always use server moves in analysis so we never lag one frame behind gameData. */
    const replayMoves = useAI ? moves : (gameData?.moves ?? []);

    const userColor = "B";
    const AIColor = "W";

    useEffect(() => {
        if (boardSize > 19 || boardSize < 2) {
            throw new RangeError(
                `<size> must be between 2 - 19, received ${boardSize}`
            );
        }

        gameRef.current = Board.fromDimensions(boardSize);
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
        const cm = currentMove ?? 0;
        let g = Board.fromDimensions(boardSize);
        const n = Math.min(cm, replayMoves.length);
        for (let i = 0; i < n; i++) {
            const move = replayMoves[i];
            if (!move || move.includes(null)) continue;

            const [color, [row, col]] = move;
            const sign = color.toUpperCase() === "B" ? 1 : -1;
            const check = g.analyzeMove(sign, [row, col]);
            if (!check.suicide && !check.ko && !check.overwrite) {
                g = g.makeMove(sign, [row, col]);
            }
        }
        gameRef.current = g;

        if (cm === 0) {
            setToPlay("B");
        } else {
            const last = replayMoves[cm - 1];
            if (last && !last.includes(null)) {
                setToPlay(last[0].toUpperCase() === "B" ? "W" : "B");
            }
        }

        if (!canvasRef.current) return;
        const canvasContext = canvasRef.current.getContext("2d");
        redrawBoardAndStones(canvasContext);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentMove,
        replayMoves,
        boardSize,
        boardImageData,
        analysisData,
        showRecommendedMoves,
    ]);

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
     * Apply a user move on the live board (gameRef).
     * @param {string[][]} move - The move data [color, [row, col]]
     */
    const tryPlayMove = (move) => {
        const [color, [row, col]] = move;
        const sign = color.toUpperCase() === "B" ? 1 : -1;
        const g = gameRef.current;
        const check = g.analyzeMove(sign, [row, col]);
        if (!check.suicide && !check.ko && !check.overwrite) {
            gameRef.current = g.makeMove(sign, [row, col]);
            const nextMoves = [...movesRef.current, move];
            movesRef.current = nextMoves;
            setMoves(nextMoves);
            setCurrentMove((prev) =>
                prev.map((value, index) =>
                    index === boardIdx ? (value ?? 0) + 1 : value
                )
            );

            if (color === userColor) {
                getAIMove(nextMoves)
                    .then((aiMove) => {
                        if (aiMove) {
                            // console.log("AI move:", aiMove);
                            tryPlayMove(aiMove);
                        }
                    })
                    .catch((error) => {
                        console.error("Error while getting AI move:", error);
                    });
            }
        } else {
            console.error("Invalid move:", move);
        }
    };

    const redrawBoardAndStones = (canvasContext) => {
        const canvas = canvasRef.current;
        if (!canvas || !boardImageData) return;
        canvasContext.putImageData(boardImageData, 0, 0);
        drawStones(canvasContext);

        const cm = currentMove ?? 0;
        if (analysisData && analysisData[cm] && showRecommendedMoves) {
            const data = analysisData[cm];
            const [row, col] = toRowColFormat(data.best_move);
            const color = `rgba(255, 0, 0, 0.5)`;
            drawStone(canvasContext, row, col, color, true);
        }
    };

    /**
     * Draw all the stones out until moveIndex
     * @param {CanvasRenderingContext2D} canvasContext - The canvas context
     */
    const drawStones = (canvasContext) => {
        // Get the most recent move to highlight
        const cm = currentMove ?? 0;
        const lastMove = cm !== 0 ? replayMoves[cm - 1] : null;
        let lastMoveCoords = null;

        if (lastMove && !lastMove.includes(null)) {
            const [, [row, col]] = lastMove;
            lastMoveCoords = [row, col];
        }

        const board = gameRef.current;
        for (let row = 0; row < board.signMap.length; row++) {
            for (let col = 0; col < board.signMap[row].length; col++) {
                const color = board.get([row, col]);

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
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (toPlayRef.current !== userColor) {
            canvas.style.cursor = "default";
            return;
        }

        const { clientX, clientY } = event;
        const [canvasX, canvasY] = clientToCanvasCoords(clientX, clientY);
        const [row, col] = canvasToBoardCoords(canvasX, canvasY);

        const canvasContext = canvas.getContext("2d");
        redrawBoardAndStones(canvasContext);
        let nextCursor = "default";
        if (row !== null && col !== null) {
            const check = gameRef.current.analyzeMove(
                userColor === "B" ? 1 : -1,
                [row, col]
            );
            if (!check.suicide && !check.ko && !check.overwrite) {
                nextCursor = "pointer";
                const color =
                    userColor === "B"
                        ? "rgba(0, 0, 0, 0.5)"
                        : "rgba(255, 255, 255, 0.5)";
                drawStone(canvasContext, row, col, color, false);
            } else {
                nextCursor = "not-allowed";
            }
        }
        if (canvas.style.cursor !== nextCursor) {
            canvas.style.cursor = nextCursor;
        }
    };

    const handleClick = (event) => {
        if (toPlayRef.current !== userColor) return;
        const { clientX, clientY } = event;
        const [canvasX, canvasY] = clientToCanvasCoords(clientX, clientY);
        const [row, col] = canvasToBoardCoords(canvasX, canvasY);

        if (row !== null && col !== null) {
            const check = gameRef.current.analyzeMove(
                userColor === "B" ? 1 : -1,
                [row, col]
            );
            if (!check.suicide && !check.ko && !check.overwrite) {
                tryPlayMove([userColor, [row, col]]);
            }
        }
    };

    /**
     * Get the AI move from the server
     * @param {string[][]} movesForRequest - Plies to send (must include the latest stone just played)
     * @returns {Promise<string[][]>} - The AI move [color, [row, col]]
     */
    const getAIMove = async (movesForRequest) => {
        const gtpMoves = [];
        const src = movesForRequest ?? movesRef.current;
        for (const move of src) {
            if (move.includes(null)) continue;
            const [color, [row, col]] = move;
            gtpMoves.push([color, toGTPFormat(row, col)]);
        }

        // console.log("gtpMoves:", gtpMoves);

        const request = {
            board_size: gameData.size,
            rules: "japanese",
            komi: gameData.komi || 6.5,
            to_play: AIColor,
            moves: gtpMoves,
            algo: "nn",
        };

        try {
            const response = await api.post(getAnalysisURL, request);
            const data = await response.data;
            const [row, col] = toRowColFormat(data.best_move);
            return [AIColor, [row, col]];
        } catch (error) {
            console.error("Error while getting AI move:", error);
            return null;
        }
    };

    hoverRef.current = handleHover;
    clickRef.current = handleClick;

    useEffect(() => {
        if (!useAI) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const onMove = (e) => hoverRef.current(e);
        const onClick = (e) => clickRef.current(e);
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("click", onClick);

        return () => {
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("click", onClick);
        };
    }, [useAI]);

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
                        setFile={(file) => {
                            setFiles((prev) =>
                                prev.map((value, index) =>
                                    index === boardIdx ? file : value
                                )
                            );
                            setUseSamples((prev) =>
                                prev.map((value, index) =>
                                    index === boardIdx ? false : value
                                )
                            );
                        }}
                        accept={".sgf"}
                    />
                    <Link
                        component="button"
                        onClick={() => {
                            handleViewSample(boardIdx);
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
                    </Link>
                    <Link
                        component="button"
                        onClick={() => {
                            handlePlayWithAI(boardIdx);
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
                boardIdx={boardIdx}
                maxMove={moves.length}
                disabled={useAI}
                currentMove={currentMove}
                setCurrentMove={setCurrentMove}
                showRecommendedMoves={showRecommendedMoves}
                setShowRecommendedMoves={setShowRecommendedMoves}
            />
        </Box>
    );
}

export default GameBoard;
