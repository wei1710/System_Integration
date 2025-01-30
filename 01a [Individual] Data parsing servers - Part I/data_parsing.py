import json
from pathlib import Path

BASE_FOLDER = Path(__file__).parent.parent / "02_Text-based_Data_Formats"
file_types = [".json", ".csv", ".xml", ".yaml", ".txt"]

def parse_file(file_path):
    data = file_path.read_text(encoding="utf-8")
    return json.dumps(json.loads(data), indent=4) if file_path.suffix == ".json" else data

def print_data_structure(data):
    print(data)

def main():
    for ext in file_types:
        file_path = BASE_FOLDER / f"me{ext}"
        print(f"\n--- {file_path.name} ---")
        print_data_structure(parse_file(file_path))

main()