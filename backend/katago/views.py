import json
import os
import subprocess
from datetime import datetime
from django.http import JsonResponse

KATAGO_PATH = "backend/katago/models/kata1-b18c384nbt.bin.gz"
KATAGO_CFG_PATH = "backend/katago/configs/analysis_example.cfg"
LOG_PATH = "backend/katago/logs"


def analyze_move(request):
    if request.method == "POST":
        analysis_request = request.POST.get("analysis_request")

        os.makedirs(LOG_PATH, exist_ok=True)
        log_file_name = f"katago_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log"
        log_file = open(os.path.join(LOG_PATH, log_file_name), "w")

        process = subprocess.Popen(
            ["katago", "analysis", "-model", KATAGO_PATH, "-config", KATAGO_CFG_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=log_file,
            text=True,
        )

        process.stdin.write(json.dumps(analysis_request))
        process.stdin.flush()

        response_line = process.stdout.readline()
        response = json.loads(response_line)

        process.stdin.close()
        process.stdout.close()
        process.wait()

        return JsonResponse(response)
    return JsonResponse({"error": "Invalid request method"}, status=405)
