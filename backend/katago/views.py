import json
import os
import subprocess
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from datetime import datetime
from sgfmill import sgf

KATAGO_MODEL_PATH = "backend/katago/models/kata1-b18c384nbt.bin.gz"
KATAGO_CONFIG_PATH = "backend/katago/configs/analysis_example.cfg"
KATAGO_LOG_PATH = "backend/katago/logs"


class AnalyzeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        analysis_request = request.data.get("analysis_request")
        if not analysis_request:
            return Response({"error": "No analysis request provided"}, status=400)

        analysis_request = json.loads(analysis_request)
        print(analysis_request)
        return Response({"message": "Analysis request received"}, status=200)


class GetGameDataView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        sgf_file_data = request.data.get("sgf_file_data")
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
            {"message": "SGF file data parsed successfully", "game_data": game_data},
            status=200,
        )
