import json
import os
import subprocess
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from datetime import datetime
from sgfmill import sgf


class AnalyzeView(APIView):
    permission_classes = [AllowAny]
    KATAGO_MODEL_PATH = "katago/models/kata1-b18c384nbt.bin.gz"
    KATAGO_CONFIG_PATH = "katago/configs/analysis_example.cfg"
    KATAGO_LOG_DIR = "katago/logs/"
    KATAGO_LOG_FILENAME = f"katago_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log"

    def post(self, request):
        analysis_request = request.data.get("analysis_request")
        if not analysis_request:
            return Response({"error": "No analysis request provided"}, status=400)

        os.makedirs(self.KATAGO_LOG_DIR, exist_ok=True)
        katago_log_file = open(
            os.path.join(self.KATAGO_LOG_DIR, self.KATAGO_LOG_FILENAME), "w"
        )
        process = subprocess.Popen(
            [
                "katago",
                "analysis",
                "-model",
                self.KATAGO_MODEL_PATH,
                "-config",
                self.KATAGO_CONFIG_PATH,
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=katago_log_file,
            text=True,
        )
        process.stdin.write(json.dumps(analysis_request) + "\n")
        process.stdin.flush()

        response_line = process.stdout.readline()
        response = {
            "response": json.loads(response_line),
            "message": "Analysis request completed!",
        }

        return Response(response, status=200)


class GetGameDataView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        sgf_file_data = request.data.get("sgf_file_data")
        if sgf_file_data is None:
            f = open("katago/data/samples/2.sgf", "r")
            sgf_file_data = f.read()

        if not sgf_file_data:
            return Response({"error": "No SGF file data provided"}, status=400)

        try:
            game = sgf.Sgf_game.from_string(sgf_file_data)
        except ValueError as error:
            return Response({"message": f"Invalid sgf data: {error}"})
        moves = [node.get_move() for node in game.get_main_sequence()]
        game_data = {
            "moves": moves,
            "size": game.get_size() if game.get_size() else "Unknown",
            "komi": game.get_komi() if game.get_komi() else "Unknown",
            "players": {
                "black": (
                    game.get_player_name("b")
                    if game.get_player_name("b")
                    else "Unknown"
                ),
                "white": (
                    game.get_player_name("w")
                    if game.get_player_name("w")
                    else "Unknown"
                ),
            },
            "winner": game.get_winner() if game.get_winner() else "Unknown",
        }

        return Response(
            {"message": "SGF file data parsed successfully!", "game_data": game_data},
            status=200,
        )
