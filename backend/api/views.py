import httpx
from django.conf import settings
from rest_framework import status  # type: ignore
from rest_framework.permissions import AllowAny  # type: ignore
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.views import APIView  # type: ignore
from sgfmill import sgf  # type: ignore

# Reusable HTTP client to avoid connection overhead
_http_client = None


def get_http_client() -> httpx.Client:
    """Get or create a reusable HTTP client instance."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.Client(timeout=settings.API_TIMEOUT)
    return _http_client


def close_http_client() -> None:
    """Close the HTTP client if it exists (e.g. on process shutdown)."""
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        _http_client.close()
        _http_client = None


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response(
            {"message": "OK"},
            status=status.HTTP_200_OK,
        )


class AnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        if not request.data:
            return Response(
                {"error": "No data provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            client = get_http_client()
            http_response = client.post(
                f"{settings.API_ENDPOINT}/api/analyze/",
                json=request.data,
            )
            http_response.raise_for_status()
            response = http_response.json()
        except httpx.HTTPError as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(
            response,
            status=status.HTTP_200_OK,
        )


class GetGameDataView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        if not request.data:
            return Response(
                {"error": "No data provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.get("sgf_file_data")
        try:
            game = sgf.Sgf_game.from_string(data)
        except ValueError as error:
            return Response(
                {"message": f"Invalid sgf data: {error}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        moves = [node.get_move() for node in game.get_main_sequence()]
        game_size = game.get_size()
        game_komi = game.get_komi()
        black_player = game.get_player_name("b")
        white_player = game.get_player_name("w")
        winner = game.get_winner()

        game_data = {
            "moves": moves,
            "size": game_size if game_size else None,
            "komi": game_komi if game_komi else "Unknown",
            "players": {
                "black": black_player if black_player else "Unknown",
                "white": white_player if white_player else "Unknown",
            },
            "winner": winner if winner else "Unknown",
        }

        return Response(
            game_data,
            status=status.HTTP_200_OK,
        )
