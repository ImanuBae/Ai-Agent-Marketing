import csv
import json
import math
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "marketing.csv"
PLATFORM_SNAPSHOTS_PATH = ROOT / "data" / "platform-training-snapshots.json"
ARTIFACT_DIR = ROOT / "artifacts"

TARGET = "sales"
RANDOM_SEED = 42
TEST_RATIO = 0.2


def read_rows(path: Path):
    with path.open("r", encoding="utf-8", newline="") as f:
        return [
            {key: float(value) for key, value in row.items()}
            for row in csv.DictReader(f)
        ]


def platform_rows_from_marketing(rows):
    transformed = []
    for row in rows:
        transformed.append({
            # This is a deterministic seed baseline for the app's platform schema.
            # Replace it with real user-uploaded platform history when available.
            "facebook": row["facebook"],
            "instagram": row["youtube"] * 0.42,
            "threads": row["newspaper"] * 0.25,
            "tiktok": row["youtube"] * 0.58,
            TARGET: row[TARGET],
        })
    return transformed


def read_platform_snapshot_rows(path: Path):
    if not path.exists():
        return []

    rows = json.loads(path.read_text(encoding="utf-8"))
    valid_rows = []
    for row in rows:
        try:
            valid_rows.append({
                "facebook": float(row["facebook"]),
                "instagram": float(row["instagram"]),
                "threads": float(row["threads"]),
                "tiktok": float(row["tiktok"]),
                TARGET: float(row[TARGET]),
            })
        except (KeyError, TypeError, ValueError):
            continue
    return valid_rows


def deterministic_shuffle(rows, seed):
    shuffled = rows[:]
    state = seed

    def rand():
        nonlocal state
        state = (state * 1664525 + 1013904223) % (2 ** 32)
        return state / (2 ** 32)

    for i in range(len(shuffled) - 1, 0, -1):
        j = int(rand() * (i + 1))
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]

    return shuffled


def transpose(matrix):
    return [list(col) for col in zip(*matrix)]


def matmul(a, b):
    b_t = transpose(b)
    return [[sum(x * y for x, y in zip(row, col)) for col in b_t] for row in a]


def matvec(a, v):
    return [sum(x * y for x, y in zip(row, v)) for row in a]


def solve_linear_system(a, b):
    n = len(a)
    aug = [row[:] + [b[i]] for i, row in enumerate(a)]

    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(aug[r][col]))
        if abs(aug[pivot][col]) < 1e-12:
            raise ValueError("Singular matrix while fitting linear regression")
        aug[col], aug[pivot] = aug[pivot], aug[col]

        pivot_value = aug[col][col]
        aug[col] = [value / pivot_value for value in aug[col]]

        for row in range(n):
            if row == col:
                continue
            factor = aug[row][col]
            aug[row] = [
                value - factor * aug[col][idx]
                for idx, value in enumerate(aug[row])
            ]

    return [row[-1] for row in aug]


def fit_linear_regression(rows, features):
    x = [[1.0] + [row[f] for f in features] for row in rows]
    y = [row[TARGET] for row in rows]
    x_t = transpose(x)
    x_tx = matmul(x_t, x)
    x_ty = matvec(x_t, y)
    weights = solve_linear_system(x_tx, x_ty)
    return weights[0], dict(zip(features, weights[1:]))


def predict(row, intercept, coefficients, features):
    return intercept + sum(coefficients[f] * row[f] for f in features)


def mean(values):
    return sum(values) / len(values)


def stddev(values):
    mu = mean(values)
    return math.sqrt(sum((v - mu) ** 2 for v in values) / len(values))


def metrics(rows, intercept, coefficients, features):
    actual = [row[TARGET] for row in rows]
    predicted = [predict(row, intercept, coefficients, features) for row in rows]
    actual_mean = mean(actual)
    residuals = [a - p for a, p in zip(actual, predicted)]
    ss_res = sum(r ** 2 for r in residuals)
    ss_tot = sum((a - actual_mean) ** 2 for a in actual)
    mae = mean([abs(r) for r in residuals])
    rmse = math.sqrt(mean([r ** 2 for r in residuals]))
    r2 = 1 - ss_res / ss_tot if ss_tot else 0
    return {"r2": r2, "mae": mae, "rmse": rmse}


def feature_statistics(rows, features):
    stats = {}
    for feature in features:
        values = [row[feature] for row in rows]
        stats[feature] = {
            "mean": mean(values),
            "std": stddev(values),
            "min": min(values),
            "max": max(values),
        }
    return stats


def target_statistics(rows):
    values = [row[TARGET] for row in rows]
    return {
        "mean": mean(values),
        "std": stddev(values),
        "min": min(values),
        "max": max(values),
    }


def standardized_importance(coefficients, x_stats, y_stats, features):
    y_std = y_stats["std"] or 1
    raw = {
        feature: abs(coefficients[feature] * x_stats[feature]["std"] / y_std)
        for feature in features
    }
    total = sum(raw.values()) or 1
    return {
        feature: {
            "standardizedCoefficient": raw[feature],
            "share": raw[feature] / total,
        }
        for feature in features
    }


def round_nested(value):
    if isinstance(value, float):
        return round(value, 6)
    if isinstance(value, dict):
        return {key: round_nested(item) for key, item in value.items()}
    if isinstance(value, list):
        return [round_nested(item) for item in value]
    return value


def train_model(version, rows, features, source_note):
    shuffled = deterministic_shuffle(rows, RANDOM_SEED)
    split_at = int(len(shuffled) * (1 - TEST_RATIO))
    train_rows = shuffled[:split_at]
    test_rows = shuffled[split_at:]

    intercept, coefficients = fit_linear_regression(train_rows, features)
    train_metrics = metrics(train_rows, intercept, coefficients, features)
    test_metrics = metrics(test_rows, intercept, coefficients, features)
    x_stats = feature_statistics(train_rows, features)
    y_stats = target_statistics(train_rows)

    artifact = {
        "version": version,
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "source": {
            **source_note,
            "rows": len(rows),
            "trainRows": len(train_rows),
            "testRows": len(test_rows),
            "randomSeed": RANDOM_SEED,
        },
        "features": features,
        "target": TARGET,
        "intercept": intercept,
        "coefficients": coefficients,
        "metrics": {
            "train": train_metrics,
            "test": test_metrics,
        },
        "featureStatistics": x_stats,
        "targetStatistics": y_stats,
        "featureImportance": standardized_importance(coefficients, x_stats, y_stats, features),
        "scaleHints": {
            "spendVndPerDatasetUnit": 500000,
            "salesVndPerDatasetUnit": 2000000,
        },
    }

    model_path = ARTIFACT_DIR / f"{version}.json"
    metrics_path = ARTIFACT_DIR / f"{version}.metrics.json"
    model_path.write_text(
        json.dumps(round_nested(artifact), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    metrics_path.write_text(
        json.dumps(round_nested(artifact["metrics"]), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {model_path}")
    print(f"Wrote {metrics_path}")
    print(f"{version} Test R2: {test_metrics['r2']:.4f}")


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    rows = read_rows(DATA_PATH)
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    train_model(
        "marketing-baseline-v1",
        rows,
        ["youtube", "facebook", "newspaper"],
        {
            "dataset": "marketing.csv",
            "url": "https://github.com/prasertcbs/basic-dataset/blob/master/marketing.csv",
        },
    )

    seed_platform_rows = platform_rows_from_marketing(rows)
    user_platform_rows = read_platform_snapshot_rows(PLATFORM_SNAPSHOTS_PATH)

    train_model(
        "platform-baseline-v1",
        seed_platform_rows + user_platform_rows,
        ["facebook", "instagram", "threads", "tiktok"],
        {
            "dataset": "marketing.csv transformed to platform schema + platform-training-snapshots.json",
            "url": "https://github.com/prasertcbs/basic-dataset/blob/master/marketing.csv",
            "seedRows": len(seed_platform_rows),
            "userRows": len(user_platform_rows),
            "note": "Uses real anonymized Facebook/Instagram/Threads/TikTok upload rows when exported from DB.",
        },
    )


if __name__ == "__main__":
    main()
