import httpx
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from sgfmill import sgf

from django.conf import settings

# Reusable HTTP client to avoid connection overhead
_http_client = None


def get_http_client() -> httpx.Client:
    """Get or create a reusable HTTP client instance."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.Client(timeout=settings.API_TIMEOUT)
    return _http_client


def close_http_client():
    """Close the HTTP client if it exists."""
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        _http_client.close()
        _http_client = None


# @method_decorator(csrf_exempt, name="dispatch")
class AnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        analysis_request = request.data.get("analysis_request")
        if not analysis_request:
            return Response({"error": "No analysis request provided"}, status=400)

        try:
            client = get_http_client()
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


# @method_decorator(csrf_exempt, name="dispatch")
class GetGameDataView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        sgf_file_data = request.data.get("sgf_file_data")
        if not sgf_file_data:
            return Response({"error": "No SGF file data provided"}, status=400)

        try:
            game = sgf.Sgf_game.from_string(sgf_file_data)
        except ValueError as error:
            return Response({"message": f"Invalid sgf data: {error}"}, status=400)
        moves = [node.get_move() for node in game.get_main_sequence()]
        # Optimize conditional checks by calling methods once
        game_size = game.get_size()
        game_komi = game.get_komi()
        black_player = game.get_player_name("b")
        white_player = game.get_player_name("w")
        winner = game.get_winner()

        game_data = {
            "moves": moves,
            "size": game_size if game_size else "Unknown",
            "komi": game_komi if game_komi else "Unknown",
            "players": {
                "black": black_player if black_player else "Unknown",
                "white": white_player if white_player else "Unknown",
            },
            "winner": winner if winner else "Unknown",
        }

        return Response(
            {"message": "SGF file data parsed successfully!", "game_data": game_data},
            status=200,
        )
