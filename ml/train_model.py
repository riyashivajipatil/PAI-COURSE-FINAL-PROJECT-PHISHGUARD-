
import argparse
import json
from pathlib import Path

import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)


# --------------------------------------------------
# 1. LOAD AND CLEAN DATASET
# --------------------------------------------------

def load_dataset(path):
    rows = []

    # Read the dataset line by line.
    # Split only at the first tab.
    with open(path, "r", encoding="latin-1") as file:
        for line in file:
            line = line.rstrip("\r\n")

            if not line:
                continue

            parts = line.split("\t", 1)

            if len(parts) != 2:
                continue

            label, message = parts

            rows.append({
                "label": label.strip().lower(),
                "message": message.strip()
            })

    df = pd.DataFrame(rows)

    if df.empty:
        raise ValueError(
            "No valid records found. Check the dataset file."
        )

    scam_labels = {
        "spam", "scam", "phishing", "fraud",
        "1", "true", "malicious"
    }

    genuine_labels = {
        "ham", "genuine", "legitimate",
        "0", "false", "safe", "normal"
    }

    def normalize_label(value):
        if value in scam_labels:
            return 1
        elif value in genuine_labels:
            return 0
        return None

    df["label"] = df["label"].apply(normalize_label)

    df = df.dropna(subset=["label", "message"])

    df["label"] = df["label"].astype(int)

    df = df[df["message"].str.strip() != ""]

    if df.empty:
        raise ValueError("No valid labelled messages found.")

    return df


# --------------------------------------------------
# 2. TRAIN MODEL AND EVALUATE
# --------------------------------------------------

def train_model(data_path, output_path):

    print("\nLoading dataset...")

    df = load_dataset(data_path)

    print("Dataset loaded successfully!")
    print("Total messages:", len(df))

    print("\nClass distribution:")
    print(
        df["label"].value_counts().rename(
            index={0: "Genuine (ham)", 1: "Spam"}
        )
    )

    X = df["message"]
    y = df["label"]

    # Split dataset into training and testing sets.
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print("\nTraining messages:", len(X_train))
    print("Testing messages:", len(X_test))

    # --------------------------------------------------
    # 3. TF-IDF FEATURE EXTRACTION
    # --------------------------------------------------

    print("\nExtracting text features...")

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words=None,
        ngram_range=(1, 2),
        max_features=2500,
        min_df=2,
        sublinear_tf=True
    )

    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # --------------------------------------------------
    # 4. LOGISTIC REGRESSION
    # --------------------------------------------------

    print("\nTraining Logistic Regression model...")

    model = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        solver="liblinear",
        random_state=42
    )

    model.fit(X_train_tfidf, y_train)

    # Predictions using the held-out test set.
    y_pred = model.predict(X_test_tfidf)
    y_prob = model.predict_proba(X_test_tfidf)[:, 1]

    # --------------------------------------------------
    # 5. MODEL EVALUATION
    # --------------------------------------------------

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(
        y_test, y_pred, zero_division=0
    )
    recall = recall_score(
        y_test, y_pred, zero_division=0
    )
    f1 = f1_score(
        y_test, y_pred, zero_division=0
    )
    roc_auc = roc_auc_score(y_test, y_prob)

    cm = confusion_matrix(
        y_test, y_pred, labels=[0, 1]
    )

    fpr, tpr, thresholds = roc_curve(y_test, y_prob)

    print("\n-----------------------------------")
    print("MODEL EVALUATION RESULTS")
    print("-----------------------------------")

    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print(f"ROC-AUC:   {roc_auc:.4f}")

    print("\nConfusion Matrix:")
    print(cm)

    # --------------------------------------------------
    # 6. EXPORT MODEL FOR REACT
    # --------------------------------------------------

    print("\nExporting model...")

    vocabulary = vectorizer.vocabulary_
    idf_values = vectorizer.idf_

    vocabulary_json = {
        word: int(index)
        for word, index in vocabulary.items()
    }

    model_data = {
        "trained": True,

        "model_type": "TF-IDF + Logistic Regression",

        "vocabulary": vocabulary_json,

        "idf": idf_values.tolist(),

        "coefficients": model.coef_[0].tolist(),

        "intercept": float(model.intercept_[0]),

        "thresholds": {
            "medium": 0.40,
            "high": 0.75
        },

        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "roc_auc": float(roc_auc),
            "confusion_matrix": cm.tolist()
        },

        "roc_curve": [
            {
                "fpr": float(x),
                "tpr": float(y)
            }
            for x, y in zip(fpr, tpr)
        ],

        "training_info": {
            "dataset": "UCI SMS Spam Collection",
            "total_messages": int(len(df)),
            "training_messages": int(len(X_train)),
            "testing_messages": int(len(X_test)),
            "random_state": 42,
            "test_size": 0.20,
            "scam_messages": int((df["label"] == 1).sum()),
            "genuine_messages": int((df["label"] == 0).sum())
        }
    }

    # Create output folder if it does not exist.
    output_path = Path(output_path)
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # Save trained model as JSON.
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(model_data, file)

    print("\nModel exported successfully!")
    print("Saved location:", output_path.resolve())

    print("\nTraining completed successfully!")


# --------------------------------------------------
# 7. MAIN PROGRAM
# --------------------------------------------------

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Train the PhishGuard detection model"
    )

    parser.add_argument(
        "--data-path",
        default="data/SMSSpamCollection",
        help="Path to the SMS Spam Collection dataset"
    )

    parser.add_argument(
        "--output-path",
        default="public/model/model.json",
        help="Path to save the exported model"
    )

    args = parser.parse_args()

    train_model(
        data_path=args.data_path,
        output_path=args.output_path
    )
