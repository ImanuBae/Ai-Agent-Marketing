import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "artifacts" / "marketing-baseline-v1.json"


def main():
    model = json.loads(MODEL_PATH.read_text(encoding="utf-8"))
    payload = json.loads(sys.stdin.read())
    spends = payload.get("spends", payload)

    prediction = model["intercept"]
    for feature in model["features"]:
        prediction += model["coefficients"][feature] * float(spends.get(feature, 0))

    print(json.dumps({
        "modelVersion": model["version"],
        "prediction": prediction,
        "target": model["target"],
    }))


if __name__ == "__main__":
    main()
