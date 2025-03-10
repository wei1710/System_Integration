from pathlib import Path

BASE_FOLDER = Path(__file__).parent.parent / "02_Text-based_Data_Formats"
file_types = [".json", ".csv", ".xml", ".yaml", ".txt"]

for ext in file_types:
    file_path = BASE_FOLDER / f"me{ext}"
    print(f"\n--- {file_path.name} ---")
    print(file_path.read_text(encoding="utf-8"))