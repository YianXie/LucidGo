import api from "@/api";
import board_bg from "@/assets/images/board/board-bg.png";
import placeStoneSound from "@/assets/sounds/board/place-stone.wav";
import Controls from "@/components/board/Controls";
import Upload from "@/components/common/Upload";
import { BOARD_SIZE, GTPLetters, getAnalysisURL } from "@/constants";
import {
    type AnalysisConfig,
    type AnalysisResult,
    type GameData,
    type GameMove,
    isValidMove,
} from "@/types/game";
import { toGTPFormat, toRowColFormat } from "@/utils";
import { buildAnalysisApiPayload } from "@/utils/analysisRequest";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Board from "@sabaki/go-board";
import { useEffect, useRef, useState } from "react";

const placeStoneSoundInstance = new Audio(placeStoneSound);

function GameBoard({
    gameData,
    analysisData,
    isLoading,
    loadedValue,
    useAI,
    currentMove,
    onCurrentMoveChange,
    useSample,
    onUseSampleChange,
    analysisConfig,
    onOpenAnalysisSettings,
    onAnalyzeWithAI,
    onViewSample,
    onPlayWithAI,
    onFileChange,
}: {
    gameData: GameData | null;
    analysisData: AnalysisResult[] | null;
    isLoading: boolean;
    loadedValue: number;
    useAI: boolean;
    onViewSample: () => void;
    useSample: boolean | null;
    onUseSampleChange: (useSample: boolean) => void;
    currentMove: number | null;
    analysisConfig: AnalysisConfig;
    onOpenAnalysisSettings: () => void;
    onAnalyzeWithAI: () => void;
    onCurrentMoveChange: (move: number) => void;
    onPlayWithAI: () => void;
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

    const replayMoves = useAI ? moves : (gameData?.moves ?? []);

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
        const cm = currentMove ?? 0;
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
            if (last && isValidMove(last)) {
                setToPlay(last[0].toUpperCase() === "B" ? "W" : "B");
            }
        }

        if (!canvasRef.current) return;
        const canvasContext = canvasRef.current.getContext("2d");
        redrawBoardAndStones(canvasContext);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMove, replayMoves, boardSize, boardImageData, analysisData]);

    useEffect(() => {
        if (!useAI) return;
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
    }, [useAI]);

    const clientToCanvasCoords = (x: number, y: number) => {
        if (!canvasRef.current) return [null, null] as const;

        const bounds = canvasRef.current.getBoundingClientRect();
        const canvasX = x - bounds.left;
        const canvasY = y - bounds.top;

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
                GTPLetters[i],
                padding + margin * i,
                canvasSize - padding / 2
            );
            canvasContext.fillText(
                GTPLetters[i],
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
            onCurrentMoveChange(nextMoves.length);

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

        const analysisIndex = currentMove ?? 0;
        if (analysisData && analysisData[analysisIndex]) {
            const data = analysisData[analysisIndex];
            const [row, col] = toRowColFormat(data.best_move);
            const color = `rgba(255, 0, 0, 0.5)`;
            drawStone(canvasContext, row, col, color, true);
        }
    };

    const drawStones = (canvasContext: CanvasRenderingContext2D) => {
        const cm = currentMove ?? 0;
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
        highlight = false,
        text: string | null = null,
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

        const request = buildAnalysisApiPayload(analysisConfig, {
            moves: gtpMoves,
            toPlay: AIColor,
            gameData,
        });

        try {
            const response = await api.post<AnalysisResult>(
                getAnalysisURL,
                request
            );
            const data = response.data;
            const [row, col] = toRowColFormat(data.best_move);
            return [AIColor, [row, col]];
        } catch (error) {
            console.error("Error while getting AI move:", error);
            return null;
        }
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
                </Box>
            )}
            {useSample === null && useAI === false && (
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
                            onUseSampleChange(false);
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
                        onClick={onPlayWithAI}
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
                maxMove={moves.length}
                disabled={useAI}
                currentMove={currentMove}
                onMoveChange={onCurrentMoveChange}
                handleAnalyzeWithAI={onAnalyzeWithAI}
                onOpenAnalysisSettings={onOpenAnalysisSettings}
            />
        </Box>
    );
}

export default GameBoard;
