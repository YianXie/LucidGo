from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch, Mock
import httpx


class AnalyzeViewTests(APITestCase):
    """Tests for the AnalyzeView endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("analyze-move")

    def test_analyze_endpoint_exists(self):
        """Test that the analyze endpoint is accessible"""
        response = self.client.post(self.url, {})
        # Should return 400 for missing data, not 404
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_analyze_missing_analysis_request(self):
        """Test analyze endpoint with missing analysis_request parameter"""
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No analysis request provided")

    @patch("api.views.httpx.Client")
    def test_analyze_successful_request(self, mock_client):
        """Test analyze endpoint with valid request"""
        # Mock the external API response
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": "test_analysis",
            "rootInfo": {"winrate": 0.5},
            "moveInfos": [],
        }
        mock_response.raise_for_status.return_value = None

        mock_client_instance = Mock()
        mock_client_instance.post.return_value = mock_response
        mock_client.return_value.__enter__ = Mock(return_value=mock_client_instance)
        mock_client.return_value.__exit__ = Mock(return_value=None)

        # Prepare test data
        analysis_request = {
            "id": "test_analysis",
            "moves": [["b", "D4"]],
            "rules": "japanese",
            "komi": 6.5,
            "boardXSize": 19,
            "boardYSize": 19,
            "analyzeTurns": [0],
            "maxVisits": 100,
        }

        response = self.client.post(
            self.url, {"analysis_request": analysis_request}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("response", response.data)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Analysis request completed!")

    @patch("api.views.httpx.Client")
    def test_analyze_external_api_error(self, mock_client):
        """Test analyze endpoint when external API returns error"""
        # Mock an HTTP error
        mock_client_instance = Mock()
        mock_client_instance.post.side_effect = httpx.HTTPError("Connection failed")
        mock_client.return_value.__enter__ = Mock(return_value=mock_client_instance)
        mock_client.return_value.__exit__ = Mock(return_value=None)

        analysis_request = {
            "id": "test_analysis",
            "moves": [],
            "rules": "japanese",
        }

        response = self.client.post(
            self.url, {"analysis_request": analysis_request}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn("error", response.data)


class GetGameDataViewTests(APITestCase):
    """Tests for the GetGameDataView endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("get-game-data")

    def test_get_game_data_endpoint_exists(self):
        """Test that the get-game-data endpoint is accessible"""
        response = self.client.post(self.url, {})
        # Should return 400 for missing data, not 404
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_game_data_missing_sgf_data(self):
        """Test get-game-data endpoint with missing sgf_file_data parameter"""
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No SGF file data provided")

    def test_get_game_data_invalid_sgf(self):
        """Test get-game-data endpoint with invalid SGF data"""
        invalid_sgf = "this is not valid sgf data"
        response = self.client.post(
            self.url, {"sgf_file_data": invalid_sgf}, format="json"
        )
        self.assertIn("message", response.data)
        self.assertIn("Invalid sgf data", response.data["message"])

    def test_get_game_data_valid_sgf(self):
        """Test get-game-data endpoint with valid SGF data"""
        # Minimal valid SGF data
        valid_sgf = "(;FF[4]GM[1]SZ[19]KM[6.5]PB[Black Player]PW[White Player];B[dd];W[pp])"

        response = self.client.post(
            self.url, {"sgf_file_data": valid_sgf}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertIn("game_data", response.data)
        self.assertEqual(
            response.data["message"], "SGF file data parsed successfully!"
        )

        # Verify game data structure
        game_data = response.data["game_data"]
        self.assertIn("moves", game_data)
        self.assertIn("size", game_data)
        self.assertIn("komi", game_data)
        self.assertIn("players", game_data)
        self.assertIn("winner", game_data)

        # Verify player information
        self.assertIn("black", game_data["players"])
        self.assertIn("white", game_data["players"])

        # Verify specific values
        self.assertEqual(game_data["size"], 19)
        self.assertEqual(game_data["komi"], 6.5)
        self.assertEqual(game_data["players"]["black"], "Black Player")
        self.assertEqual(game_data["players"]["white"], "White Player")

    def test_get_game_data_sgf_with_minimal_info(self):
        """Test get-game-data endpoint with SGF containing minimal information"""
        # SGF with minimal information
        minimal_sgf = "(;FF[4]GM[1];B[dd];W[pp])"

        response = self.client.post(
            self.url, {"sgf_file_data": minimal_sgf}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        game_data = response.data["game_data"]

        # When information is missing, should return "Unknown"
        self.assertIn("size", game_data)
        self.assertIn("komi", game_data)
        self.assertIn("players", game_data)
        self.assertIn("winner", game_data)


class APIConnectivityTests(APITestCase):
    """Tests for general API connectivity and CORS"""

    def setUp(self):
        self.client = APIClient()

    def test_api_endpoints_are_accessible(self):
        """Test that API endpoints can be reached"""
        # Test analyze endpoint
        analyze_url = reverse("analyze-move")
        response = self.client.post(analyze_url, {})
        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_502_BAD_GATEWAY],
        )

        # Test get-game-data endpoint
        get_game_data_url = reverse("get-game-data")
        response = self.client.post(get_game_data_url, {})
        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST],
        )

    def test_analyze_endpoint_requires_post(self):
        """Test that analyze endpoint only accepts POST requests"""
        url = reverse("analyze-move")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_get_game_data_endpoint_requires_post(self):
        """Test that get-game-data endpoint only accepts POST requests"""
        url = reverse("get-game-data")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
