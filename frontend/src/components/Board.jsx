import { useRef, useEffect } from "react";
import board_bg from "../assets/images/board/board-bg.png";

function Board({ moves, size = 19 }) {
    const canvasRef = useRef(null);
    const canvasSize = window.innerHeight * 0.8;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const boardBg = new Image();
        boardBg.src = board_bg;

        boardBg.onload = () => {
            ctx.drawImage(boardBg, 0, 0, canvasSize, canvasSize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="board"
            width={canvasSize}
            height={canvasSize}
        >
            <p>Your browser does not support the canvas tag.</p>
        </canvas>
    );
}

export default Board;
