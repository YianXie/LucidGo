import api from "@/api";
import board_bg from "@/assets/images/board/board-bg.png";
import placeStoneSoundInstance from "@/assets/sounds/placeStoneSoundInstance";
import Controls from "@/components/board/Controls";
import Upload from "@/components/common/Upload";
import { BOARD_SIZE, GET_ANALYSIS_URL, GTP_LETTERS } from "@/constants";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type GameData,
    type GameMove,
    type GameSource,
    isValidMove,
} from "@/types/game";
import { buildAnalysisRequest } from "@/utils/buildAnalysisRequest";
import {
    parseGtpBoardPoint,
    toGTPFormat,
    toRowColFormat,
} from "@/utils/coordinates";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Board from "@sabaki/go-board";
import { useEffect, useRef, useState } from "react";

type TopMoveEntry = AnalysisResult["top_moves"][number];

/** Side to play at board position `moveIndex` (0 = empty board, Black moves first). */
function sideToMoveAtMoveIndex(
    moveIndex: number,
    moves: GameMove[]
): "B" | "W" {
    if (moveIndex <= 0) return "B";
    const prev = moves[moveIndex - 1];
    const c = prev?.[0];
    if (!c) return "B";
    return c.toUpperCase() === "B" ? "W" : "B";
}

function formatSuggestedMoveWinrate(
    winrate: { black: number; white: number },
    sideToMove: "B" | "W"
): string {
    const pct = sideToMove === "B" ? winrate.black : winrate.white;
    return `${pct.toFixed(1)}%`;
}

function GameBoard({
    gameData,
    analysisData,
    isLoading,
    loadedValue,
    live,
    analysisConfig,
    gameSource,
    currentMoveIndex,
    setCurrentMoveIndex,
    onGameSourceChange,
    onGenerateWinrate,
    onAnalyzeCurrentMove,
    onAnalyzeAllMoves,
    onViewSample,
    onLive,
    onFileChange,
}: {
    gameData: GameData | null;
    analysisData: (AnalysisResult | null)[] | null;
    isLoading: boolean;
    loadedValue: number | null;
    live: boolean;
    analysisConfig: AnalysisConfig;
    gameSource: GameSource;
    currentMoveIndex: number | null;
    setCurrentMoveIndex: (move: number) => void;
    onGameSourceChange: (source: GameSource) => void;
    onGenerateWinrate: () => void;
    onAnalyzeCurrentMove: () => void;
    onAnalyzeAllMoves: () => void;
    onViewSample: () => void;
    onLive: () => void;
    onFileChange: (file: File) => void;
}) {
    const boardSize = BOARD_SIZE;
    const canvasSize = 800;
    const padding = 50;
    const margin = (canvasSize - padding * 2) / (boardSize - 1);
    const stoneRadius = margin / 2;

    const gameRef = useRef(Board.fromDimensions(boardSize));
    const toPlayRef = useRef<"B" | "W">("B");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [boardImageData, setBoardImageData] = useState<ImageData | null>(
        null
    );
    const [toPlay, setToPlay] = useState<"B" | "W">("B");
    const [moves, setMoves] = useState<GameMove[]>(gameData?.moves ?? []);
    const movesRef = useRef(moves);
    movesRef.current = moves;

    const hoverRef = useRef<(event: MouseEvent) => void>(() => {});
    const clickRef = useRef<(event: MouseEvent) => void>(() => {});

    toPlayRef.current = toPlay;

    useEffect(() => {
        if (!gameData) return;
        setMoves(gameData.moves ?? []);
    }, [gameData]);

    const replayMoves = live ? moves : (gameData?.moves ?? []);

    const userColor = "B" as const;
    const AIColor = "W" as const;

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
        if (!canvasContext) return;

        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvasSize * devicePixelRatio;
        canvas.height = canvasSize * devicePixelRatio;
        canvasContext.scale(devicePixelRatio, devicePixelRatio);

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
    }, []);

    useEffect(() => {
        const cm = currentMoveIndex ?? 0;
        let g = Board.fromDimensions(boardSize);
        for (let i = 0; i < Math.min(cm, replayMoves.length); i++) {
            const move = replayMoves[i];
            if (!move || !isValidMove(move)) continue;

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
            if (last) {
                setToPlay(last[0].toUpperCase() === "B" ? "W" : "B");
            }
        }

        if (!canvasRef.current) return;
        const canvasContext = canvasRef.current.getContext("2d");
        redrawBoardAndStones(canvasContext);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentMoveIndex,
        replayMoves,
        boardSize,
        boardImageData,
        analysisData,
    ]);

    useEffect(() => {
        if (!live) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const onMove = (e: MouseEvent) => hoverRef.current(e);
        const onClick = (e: MouseEvent) => clickRef.current(e);
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("click", onClick);

        return () => {
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("click", onClick);
        };
    }, [live]);

    const clientToCanvasCoords = (x: number, y: number) => {
        if (!canvasRef.current) return [null, null] as const;

        const bounds = canvasRef.current.getBoundingClientRect();
        // Scale from rendered CSS pixels back to logical canvas pixels
        const scale = canvasSize / bounds.width;
        const canvasX = (x - bounds.left) * scale;
        const canvasY = (y - bounds.top) * scale;

        return [canvasX, canvasY] as const;
    };

    const boardToCanvasCoords = (row: number, col: number) => {
        if (row < 0 || row > boardSize - 1 || col < 0 || col > boardSize - 1) {
            throw new RangeError(
                `<row> or <col> must be between 0 and ${boardSize - 1}, received ${row} or ${col}`
            );
        }

        return [
            margin * col + padding,
            (boardSize - row - 1) * margin + padding,
        ] as const;
    };

    const canvasToBoardCoords = (
        x: number,
        y: number
    ): [number, number] | [null, null] => {
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

    const drawBoard = (canvasContext: CanvasRenderingContext2D) => {
        for (let i = 0; i < boardSize; i++) {
            if (i === 0 || i === boardSize - 1) {
                canvasContext.lineWidth = 1.25;
            } else {
                canvasContext.lineWidth = 0.75;
            }

            canvasContext.beginPath();
            canvasContext.moveTo(padding + margin * i, padding);
            canvasContext.lineTo(padding + margin * i, canvasSize - padding);

            canvasContext.moveTo(padding, padding + margin * i);
            canvasContext.lineTo(canvasSize - padding, padding + margin * i);

            canvasContext.stroke();
            canvasContext.closePath();

            if (boardSize === 19) {
                if ([4 - 1, 10 - 1, 16 - 1].includes(i)) {
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

    const drawCoords = (canvasContext: CanvasRenderingContext2D) => {
        canvasContext.font = "15px Arial";
        canvasContext.textBaseline = "middle";
        canvasContext.textAlign = "center";
        canvasContext.fillStyle = "black";

        for (let i = 0; i < boardSize; i++) {
            canvasContext.fillText(
                GTP_LETTERS[i],
                padding + margin * i,
                canvasSize - padding / 2
            );
            canvasContext.fillText(
                GTP_LETTERS[i],
                padding + margin * i,
                padding / 2
            );

            canvasContext.fillText(
                String(i + 1),
                canvasSize - padding / 2,
                canvasSize - padding - margin * i
            );
            canvasContext.fillText(
                String(i + 1),
                padding / 2,
                canvasSize - padding - margin * i
            );
        }
    };

    const tryPlayMove = (move: [string, [number, number]]) => {
        const [color, [row, col]] = move;
        const sign = color.toUpperCase() === "B" ? 1 : -1;
        const g = gameRef.current;
        const check = g.analyzeMove(sign, [row, col]);
        if (!check.suicide && !check.ko && !check.overwrite) {
            gameRef.current = g.makeMove(sign, [row, col]);
            const nextMoves = [...movesRef.current, move];
            movesRef.current = nextMoves;
            setMoves(nextMoves);
            setCurrentMoveIndex(nextMoves.length);

            placeStoneSoundInstance.currentTime = 0;
            void placeStoneSoundInstance.play();

            if (color === userColor) {
                getAIMove(nextMoves)
                    .then((aiMove) => {
                        if (aiMove) {
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

    const redrawBoardAndStones = (
        canvasContext: CanvasRenderingContext2D | null
    ) => {
        const canvas = canvasRef.current;
        if (!canvas || !boardImageData || !canvasContext) return;
        canvasContext.putImageData(boardImageData, 0, 0);
        drawStones(canvasContext);

        const analysisIndex = currentMoveIndex ?? 0;
        const sideToMove = sideToMoveAtMoveIndex(analysisIndex, replayMoves);
        const slice = analysisData?.[analysisIndex];
        if (slice?.top_moves?.length) {
            const ordered = slice.top_moves
                .map((entry) => {
                    const pt = parseGtpBoardPoint(entry.move);
                    return pt ? { entry, row: pt[0], col: pt[1] } : null;
                })
                .filter(
                    (
                        x
                    ): x is { entry: TopMoveEntry; row: number; col: number } =>
                        x !== null
                );

            const board = gameRef.current;
            for (const [index, { entry, row, col }] of ordered.entries()) {
                const sign = board.get([row, col]);
                if (sign !== 0 && sign != null) continue;

                const fill = `rgba(255, 0, 0, ${Math.max(0.3, 1 / (index + 1))})`;
                const [cx, cy] = boardToCanvasCoords(row, col);
                canvasContext.beginPath();
                canvasContext.arc(cx, cy, stoneRadius - 2, 0, 2 * Math.PI);
                canvasContext.fillStyle = fill;
                canvasContext.fill();

                if (entry.winrate != null) {
                    const label = formatSuggestedMoveWinrate(
                        entry.winrate,
                        sideToMove
                    );
                    canvasContext.font = "bold 11px Arial";
                    canvasContext.textBaseline = "middle";
                    canvasContext.textAlign = "center";
                    canvasContext.lineWidth = 3;
                    canvasContext.strokeStyle = "rgba(0,0,0,0.65)";
                    canvasContext.strokeText(label, cx, cy);
                    canvasContext.fillStyle = "#fff";
                    canvasContext.fillText(label, cx, cy);
                }
            }
        }
    };

    const drawStones = (canvasContext: CanvasRenderingContext2D) => {
        const cm = currentMoveIndex ?? 0;
        const lastMove = cm !== 0 ? replayMoves[cm - 1] : null;
        let lastMoveCoords: [number, number] | null = null;

        if (lastMove && isValidMove(lastMove)) {
            const [, [row, col]] = lastMove;
            lastMoveCoords = [row, col];
        }

        const board = gameRef.current;
        for (let row = 0; row < board.signMap.length; row++) {
            for (let col = 0; col < board.signMap[row].length; col++) {
                const color = board.get([row, col]);

                if (color === 0 || color === null) {
                    continue;
                }

                const isHighlighted =
                    lastMoveCoords !== null &&
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

    const drawStone = (
        canvasContext: CanvasRenderingContext2D,
        row: number,
        col: number,
        color: string,
        stroke = true,
        highlight = false
    ) => {
        canvasContext.fillStyle = color;
        canvasContext.beginPath();
        const [canvasX, canvasY] = boardToCanvasCoords(row, col);
        canvasContext.arc(canvasX, canvasY, stoneRadius - 2, 0, 2 * Math.PI);
        if (stroke) canvasContext.stroke();
        canvasContext.fill();
        canvasContext.closePath();

        if (highlight) {
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
    };

    const handleHover = (event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (toPlayRef.current !== userColor) {
            canvas.style.cursor = "default";
            return;
        }

        const { clientX, clientY } = event;
        const coords = clientToCanvasCoords(clientX, clientY);
        if (coords[0] === null || coords[1] === null) return;
        const [canvasX, canvasY] = coords;
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
                drawStone(canvasContext!, row, col, color, false);
            } else {
                nextCursor = "not-allowed";
            }
        }
        if (canvas.style.cursor !== nextCursor) {
            canvas.style.cursor = nextCursor;
        }
    };

    const handleClick = (event: MouseEvent) => {
        if (toPlayRef.current !== userColor) return;
        const { clientX, clientY } = event;
        const coords = clientToCanvasCoords(clientX, clientY);
        if (coords[0] === null || coords[1] === null) return;
        const [canvasX, canvasY] = coords;
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

    const getAIMove = async (
        movesForRequest: GameMove[]
    ): Promise<[string, [number, number]] | null> => {
        if (!gameData) return null;

        const gtpMoves: [string, string][] = [];
        for (const move of movesForRequest) {
            if (!isValidMove(move)) continue;
            const [color, [row, col]] = move;
            gtpMoves.push([color, toGTPFormat(row, col)]);
        }

        const request = buildAnalysisRequest(analysisConfig, gtpMoves, AIColor);
        try {
            const { data } = await api.post<AnalysisResult>(
                GET_ANALYSIS_URL,
                request
            );
            const [row, col] = toRowColFormat(data.top_moves[0].move);
            return [AIColor, [row, col]];
        } catch (error) {
            console.error("Error while getting AI move:", error);
            return null;
        }
    };

    const handlePassMove = () => {
        if (toPlayRef.current !== userColor) return;
        const passMove: GameMove = [userColor, null];
        const nextMoves = [...movesRef.current, passMove];
        movesRef.current = nextMoves;
        setMoves(nextMoves);
        setCurrentMoveIndex(nextMoves.length);

        getAIMove(nextMoves)
            .then((aiMove) => {
                if (aiMove) {
                    tryPlayMove(aiMove);
                }
            })
            .catch((error) => {
                console.error("Error while getting AI move after pass:", error);
            });
    };

    hoverRef.current = handleHover;
    clickRef.current = handleClick;

    return (
        <Box
            sx={{
                position: "relative",
            }}
        >
            {isLoading && (
                <Box
                    sx={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        gap: 4,
                        backdropFilter: "blur(4px) brightness(0.5)",
                        zIndex: (theme) => theme.zIndex.appBar - 1,
                    }}
                >
                    <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                            color: "primary.main",
                            textAlign: "center",
                            width: "100%",
                        }}
                    >
                        Loading...
                    </Typography>
                    {loadedValue == null ? (
                        <CircularProgress size={120} />
                    ) : (
                        <Box
                            sx={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
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
                </Box>
            )}
            {gameSource === "none" && !live && (
                <Box
                    sx={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        color: "#fff",
                        gap: 2,
                        backdropFilter: "blur(4px) brightness(0.5)",
                        zIndex: (theme) => theme.zIndex.appBar - 1,
                    }}
                >
                    <Upload
                        setFile={(file) => {
                            onFileChange(file);
                            onGameSourceChange("file");
                        }}
                        accept={".sgf"}
                    />
                    <Link
                        component="button"
                        onClick={onViewSample}
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
                        onClick={onLive}
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
                width={canvasSize}
                height={canvasSize}
                style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    maxWidth: `${canvasSize}px`,
                }}
            />
            <Controls
                maxMove={moves.length}
                live={live}
                currentMoveIndex={currentMoveIndex}
                setCurrentMoveIndex={setCurrentMoveIndex}
                onGenerateWinrate={onGenerateWinrate}
                onAnalyzeCurrentMove={onAnalyzeCurrentMove}
                onAnalyzeAllMoves={onAnalyzeAllMoves}
                onPassMove={handlePassMove}
            />
        </Box>
    );
}

export default GameBoard;
