import httpx
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from sgfmill import sgf


class AnalyzeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        analysis_request = request.data.get("analysis_request")
        if not analysis_request:
            return Response({"error": "No analysis request provided"}, status=400)

        try:
            with httpx.Client(timeout=settings.API_TIMEOUT) as client:
                r = client.post(
                    f"{settings.API_ENDPOINT}/katago/analyze",
                    json={"request": analysis_request},
                )
                r.raise_for_status()
                response = r.json()
        except httpx.HTTPError as e:
            return Response({"error": str(e)}, status=502)

        return Response(
            {"response": response, "message": "Analysis request completed!"}, status=200
        )


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
            {"message": "SGF file data parsed successfully!", "game_data": game_data},
            status=200,
        )
