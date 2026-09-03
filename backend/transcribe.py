import sys
import json
import whisper

# Cek argumen
if len(sys.argv) < 2:
    print(json.dumps({"text": "Error: no file path provided"}))
    sys.exit(1)

file_path = sys.argv[1]

# Load model (bisa diganti 'base', 'small', 'tiny', dll)
model = whisper.load_model("base")

# Transkripsi
try:
    result = model.transcribe(file_path)
    print(json.dumps({"text": result["text"]}))
except Exception as e:
    print(json.dumps({"text": f"Error: {str(e)}"}))
    sys.exit(1)