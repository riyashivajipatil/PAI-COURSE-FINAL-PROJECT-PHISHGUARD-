# PhishGuard — Probabilistic Phishing & Scam Message Detection

A React + Vite cybersecurity dashboard with four pages, dark/light themes, browser-side Logistic Regression inference, and model-performance visualizations.

## Pages

1. **Overview** — session counts, detection activity, classification split, recent detections and model status.
2. **Message Detector** — message input, scam/genuine probabilities, risk classification and influential TF-IDF terms.
3. **Analytics & Performance** — accuracy, precision, recall, F1-score, confusion matrix and ROC curve from the trained model.
4. **PAI Concepts & Model** — probability concepts and their connection to the implementation.

## 1. Requirements

- Node.js LTS
- VS Code
- Python 3.10 or later (only for training the model)
- A labelled SMS/message CSV dataset

## 2. Run the React website

Open the `PhishGuard` folder in VS Code, then run in the terminal:

```bash
npm install
npm run dev
```

Open the local URL Vite prints, normally `http://localhost:5173/PhishGuard/`.

The pages and theme toggle work before model training. The detector intentionally does not generate predictions until a trained model is installed. This prevents fabricated probability outputs.

## 3. Train the Logistic Regression model

Obtain a labelled SMS spam dataset, such as the UCI SMS Spam Collection. Save a CSV copy in the project folder or note its full path.

The CSV must have a text column and a label column. The script recognizes common column names (`message`, `text`, `v2`, `sms`; and `label`, `category`, `v1`, `target`). If yours differ, pass the column names explicitly.

Create a Python environment (recommended):

```bash
python -m venv .venv
```

Windows PowerShell activation:

```powershell
.venv\Scripts\Activate.ps1
```

Install requirements:

```bash
pip install -r ml/requirements.txt
```

Example if your CSV has columns `message` and `label`:

```bash
python ml/train_model.py --data-path data/messages.csv --text-column message --label-column label
```

The script:
- removes rows with missing text/labels;
- maps spam/scam to 1 and ham/genuine to 0;
- creates a stratified 80/20 train/test split;
- fits TF-IDF on training text only;
- trains Logistic Regression;
- evaluates the held-out test split;
- exports `public/model/model.json`.

If the dataset is TSV rather than CSV, convert it to CSV first or adapt the `read_csv` call to `sep="\\t"`.

**Test-set discipline:** Keep the test split untouched during model selection. The metrics shown in Analytics are calculated from the held-out test data for the exported model. Do not repeatedly change model settings based on test results and then present the same test set as an unbiased final evaluation.

## 4. Verify model integration

After training, confirm this file exists:

```text
public/model/model.json
```

Restart Vite if needed:

```bash
npm run dev
```

Open **Message Detector** and test a message. The browser fetches the local JSON model and performs the Logistic Regression calculation without calling an external API.

The model is trained using TF-IDF with unigrams and bigrams, sublinear term frequency and L2 normalization (without stop-word removal). Browser inference uses the exported vocabulary, IDF values, coefficients and intercept and reproduces these vectorization steps for the supported English word-token pattern and adjacent bigrams. Validate a few browser predictions against the Python pipeline before presenting the results.

## 5. Build locally

```bash
npm run build
npm run preview
```

Vite creates the production website in `dist/`.

## 6. GitHub Pages deployment

### A. Create a GitHub repository

Create a repository named exactly:

`PhishGuard`

For a free public GitHub Pages deployment, make the repository public unless your GitHub plan supports private Pages publishing.

### B. Check the Vite base path

`vite.config.js` currently contains:

```js
base: "/PhishGuard/"
```

This is correct when the repository name is `PhishGuard`. If you choose another repository name, change the base path to `"/YOUR-REPOSITORY-NAME/"`.

### C. Push the project

In the VS Code terminal, from the PhishGuard folder:

```bash
git init
git add .
git commit -m "Initial PhishGuard project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/PhishGuard.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

### D. Deploy

Run:

```bash
npm install
npm run deploy
```

This publishes the `dist` folder to the `gh-pages` branch.

On GitHub:
1. Open your repository.
2. Go to **Settings → Pages**.
3. Under Build and deployment, choose **Deploy from a branch**.
4. Select branch `gh-pages` and folder `/ (root)`.
5. Save.

Your website URL will be:

`https://YOUR-USERNAME.github.io/PhishGuard/`

It can take a few minutes for the first deployment to appear.

### E. Updating the website

After changing code:

```bash
git add .
git commit -m "Update PhishGuard"
git push
npm run deploy
```

## 7. Important project limitations and honest reporting

- A probability is a model estimate, not proof that a message is fraudulent or safe.
- Risk thresholds (40% and 75%) are project-defined decision thresholds.
- The dataset may not represent every language, country, scam style or current phishing campaign.
- This project is an educational classifier, not a production anti-phishing gateway.
- Do not submit real private messages containing personal information.
- The model file is part of the website bundle. Do not put private or licensed data in the public repository.
- The dashboard's detection history is session-only and is not uploaded to a server.

## 8. Stanford PAI final project alignment

The project demonstrates probability, conditional probability, random variables, probabilistic models, Logistic Regression and maximum likelihood estimation. The training script documents the data source and test methodology. In your final write-up, record the exact dataset URL/version, dataset preprocessing, model parameters, test metrics, uncertainty, limitations and your initial prediction before inspecting the test results.

AI-use disclosure: state which AI tools helped with planning, code generation, debugging or documentation, and identify your own contributions honestly.
