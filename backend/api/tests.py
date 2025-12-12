from unittest.mock import MagicMock, patch

import httpx
from rest_framework import status
from rest_framework.test import APITestCase


class AnalyzeViewTestCase(APITestCase):
    """Tests for the analyze endpoint"""

    def setUp(self):
        """Set up test data"""
        self.analyze_url = "/api/analyze/"
        self.valid_analysis_request = {
            "id": "analysis_request_1",
            "moves": [
                ["b", "Q16"],
                ["w", "Q4"],
                ["b", "C16"],
                ["w", "D4"],
                ["b", "R14"],
                ["w", "E16"],
                ["b", "H17"],
                ["w", "D14"],
                ["b", "C14"],
                ["w", "C13"],
                ["b", "B13"],
                ["w", "C12"],
                ["b", "B14"],
                ["w", "D15"],
                ["b", "B12"],
                ["w", "C11"],
                ["b", "H15"],
                ["w", "C15"],
                ["b", "B15"],
                ["w", "C17"],
                ["b", "B17"],
                ["w", "D17"],
                ["b", "B18"],
                ["w", "G12"],
                ["b", "C9"],
                ["w", "B11"],
                ["b", "C6"],
                ["w", "C5"],
                ["b", "D6"],
                ["w", "F3"],
                ["b", "F5"],
                ["w", "P18"],
                ["b", "O17"],
                ["w", "O18"],
                ["b", "N17"],
                ["w", "R17"],
                ["b", "Q17"],
                ["w", "Q18"],
                ["b", "R16"],
                ["w", "S17"],
                ["b", "G3"],
                ["w", "F4"],
                ["b", "G4"],
                ["w", "G2"],
                ["b", "H2"],
                ["w", "F2"],
                ["b", "G5"],
                ["w", "B5"],
                ["b", "O3"],
                ["w", "R6"],
                ["b", "Q2"],
                ["w", "R3"],
                ["b", "R2"],
                ["w", "R9"],
            ],
            "rules": "japanese",
            "komi": 6.5,
            "boardXSize": 19,
            "boardYSize": 19,
            "analyzeTurns": [1],
            "maxVisits": 500,
            "includePolicy": True,
            "includeOwnership": True,
        }

    def test_analyze_with_missing_analysis_request(self):
        """Test analyze endpoint with missing analysis_request"""
        response = self.client.post(self.analyze_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No analysis request provided")

    def test_analyze_with_empty_analysis_request(self):
        """Test analyze endpoint with empty analysis_request"""
        response = self.client.post(
            self.analyze_url,
            {"analysis_request": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No analysis request provided")

    def test_analyze_with_external_api_http_error(self):
        """Test analyze endpoint when external API returns HTTP error"""
        mock_response = httpx.Response(status_code=500, text="Internal Server Error")
        mock_response.raise_for_status = MagicMock(
            side_effect=httpx.HTTPStatusError(
                "Server Error", request=None, response=mock_response
            )
        )

        mock_client = MagicMock()
        mock_client.post.return_value = mock_response
        mock_client.__enter__.return_value = mock_client
        mock_client.__exit__.return_value = None

        with patch("api.views.httpx.Client", return_value=mock_client):
            response = self.client.post(
                self.analyze_url,
                {"analysis_request": self.valid_analysis_request},
                format="json",
            )

            self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
            self.assertIn("error", response.data)

    def test_analyze_with_external_api_timeout(self):
        """Test analyze endpoint when external API times out"""
        mock_client = MagicMock()
        mock_client.post.side_effect = httpx.TimeoutException("Request timed out")
        mock_client.__enter__.return_value = mock_client
        mock_client.__exit__.return_value = None

        with patch("api.views.httpx.Client", return_value=mock_client):
            response = self.client.post(
                self.analyze_url,
                {"analysis_request": self.valid_analysis_request},
                format="json",
            )

            self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
            self.assertIn("error", response.data)

    def test_analyze_with_external_api_connection_error(self):
        """Test analyze endpoint when external API connection fails"""
        mock_client = MagicMock()
        mock_client.post.side_effect = httpx.ConnectError("Connection failed")
        mock_client.__enter__.return_value = mock_client
        mock_client.__exit__.return_value = None

        with patch("api.views.httpx.Client", return_value=mock_client):
            response = self.client.post(
                self.analyze_url,
                {"analysis_request": self.valid_analysis_request},
                format="json",
            )

            self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
            self.assertIn("error", response.data)

    def test_analyze_with_external_api_request_error(self):
        """Test analyze endpoint when external API request error occurs"""
        mock_client = MagicMock()
        mock_client.post.side_effect = httpx.RequestError("Request error")
        mock_client.__enter__.return_value = mock_client
        mock_client.__exit__.return_value = None

        with patch("api.views.httpx.Client", return_value=mock_client):
            response = self.client.post(
                self.analyze_url,
                {"analysis_request": self.valid_analysis_request},
                format="json",
            )

            self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
            self.assertIn("error", response.data)

    def test_analyze_allows_post_method(self):
        """Test that analyze endpoint only accepts POST requests"""
        response = self.client.get(self.analyze_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.put(self.analyze_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.delete(self.analyze_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class GetGameDataViewTestCase(APITestCase):
    """Tests for the get-game-data endpoint"""

    def setUp(self):
        """Set up test data"""
        self.get_game_data_url = "/api/get-game-data/"
        self.valid_sgf_data = """(;FF[4]CA[UTF-8]SZ[19]KM[7.5]PB[Player1]PW[Player2]
;B[qd];W[dd];B[pq];W[dp];B[fc];W[cf])"""

    def test_get_game_data_with_valid_sgf(self):
        """Test get-game-data endpoint with valid SGF data"""
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": self.valid_sgf_data},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertIn("game_data", response.data)
        self.assertEqual(response.data["message"], "SGF file data parsed successfully!")
        self.assertIn("moves", response.data["game_data"])
        self.assertIn("size", response.data["game_data"])
        self.assertIn("komi", response.data["game_data"])
        self.assertIn("players", response.data["game_data"])
        self.assertIn("winner", response.data["game_data"])

    def test_get_game_data_with_missing_sgf_file_data(self):
        """Test get-game-data endpoint with missing sgf_file_data"""
        response = self.client.post(self.get_game_data_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No SGF file data provided")

    def test_get_game_data_with_empty_sgf_file_data(self):
        """Test get-game-data endpoint with empty sgf_file_data"""
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No SGF file data provided")

    def test_get_game_data_with_invalid_sgf_data(self):
        """Test get-game-data endpoint with invalid SGF data"""
        invalid_sgf = "This is not valid SGF data"
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": invalid_sgf},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)
        self.assertIn("Invalid sgf data", response.data["message"])

    def test_get_game_data_with_malformed_sgf(self):
        """Test get-game-data endpoint with malformed SGF data"""
        malformed_sgf = "(;FF[4]CA[UTF-8]SZ[19]KM[7.5]PB[Player1]PW[Player2];B[invalid"
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": malformed_sgf},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)
        self.assertIn("Invalid sgf data", response.data["message"])

    def test_get_game_data_extracts_correct_game_info(self):
        """Test that get-game-data correctly extracts game information"""
        sgf_with_info = """(;FF[4]CA[UTF-8]SZ[19]KM[7.5]PB[Player Black]PW[Player White]
;B[qd];W[dd])"""
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": sgf_with_info},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        game_data = response.data["game_data"]
        self.assertEqual(game_data["size"], 19)
        self.assertEqual(game_data["komi"], 7.5)
        self.assertEqual(game_data["players"]["black"], "Player Black")
        self.assertEqual(game_data["players"]["white"], "Player White")
        self.assertIsInstance(game_data["moves"], list)
        self.assertGreater(len(game_data["moves"]), 0)

    def test_get_game_data_handles_missing_optional_fields(self):
        """Test that get-game-data handles missing optional fields gracefully"""
        minimal_sgf = "(;FF[4]SZ[19];B[qd];W[dd])"
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": minimal_sgf},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        game_data = response.data["game_data"]
        # Should handle missing fields with "Unknown"
        self.assertIn(game_data["komi"], [None, "Unknown"])
        self.assertIn(game_data["players"]["black"], [None, "Unknown"])
        self.assertIn(game_data["players"]["white"], [None, "Unknown"])

    def test_get_game_data_with_different_board_sizes(self):
        """Test get-game-data with different board sizes"""
        sgf_13x13 = "(;GK[2]TP[0]EV[rank game]CDT[30]TML[600]BAVA[60004]AP[New Tygem]SZ[13];B[ad];W[cb];)"
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": sgf_13x13},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["game_data"]["size"], 13)

        sgf_9x9 = "(;GK[2]TP[0]EV[rank game]CDT[30]TML[600]BAVA[60004]AP[New Tygem]SZ[9];B[ad];W[cb];)"
        response = self.client.post(
            self.get_game_data_url,
            {"sgf_file_data": sgf_9x9},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["game_data"]["size"], 9)

    def test_get_game_data_allows_post_method(self):
        """Test that get-game-data endpoint only accepts POST requests"""
        response = self.client.get(self.get_game_data_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.put(self.get_game_data_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.delete(self.get_game_data_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
