export const navGroups = [
  {
    title: "Dashboard",
    items: [
      { id: "overview", label: "Overview", icon: "dashboard" }
    ]
  },
  {
    title: "Operations",
    items: [
      { id: "detector", label: "Message Detector", icon: "scan" },
      { id: "analytics", label: "Analytics", icon: "chart" }
    ]
  },
  {
    title: "Intelligence",
    items: [
      { id: "concepts", label: "PAI Concepts", icon: "brain" }
    ]
  }
];

export const conceptItems = [
  {
    title: "Probability",
    formula: "0 ≤ P(A) ≤ 1",
    description: "Probability measures how likely an event is. In this project, the event is that a message belongs to the scam class.",
    application: "The model estimates P(Scam | message features)."
  },
  {
    title: "Conditional Probability",
    formula: "P(A | B) = P(A ∩ B) / P(B)",
    description: "Conditional probability updates the probability of an event when evidence is known.",
    application: "We estimate the probability of scam given the words and patterns present in a message."
  },
  {
    title: "Axioms of Probability",
    formula: "P(Ω) = 1; P(A) ≥ 0",
    description: "Probabilities are non-negative, the sample space has probability one, and mutually exclusive events are additive.",
    application: "Scam and genuine probabilities are complementary and sum to 100%."
  },
  {
    title: "Independence",
    formula: "P(A ∩ B) = P(A)P(B)",
    description: "Two events are independent when knowing one does not change the probability of the other.",
    application: "Word-based models can make simplifying feature assumptions; correlated words mean independence should not be assumed blindly."
  },
  {
    title: "Bayes' Theorem",
    formula: "P(A | B) = P(B | A)P(A) / P(B)",
    description: "Bayes' theorem updates prior belief using observed evidence.",
    application: "The model learns how message features relate to the scam class and estimates a posterior class probability."
  },
  {
    title: "Random Variables",
    formula: "Y ∈ {0, 1}",
    description: "A random variable maps an outcome to a numerical value.",
    application: "The target label is binary: 1 for scam and 0 for genuine."
  },
  {
    title: "Probabilistic Models",
    formula: "P(Y = 1 | X)",
    description: "A probabilistic model represents uncertainty instead of returning only a hard class.",
    application: "PhishGuard displays both scam probability and genuine probability."
  },
  {
    title: "Continuous Random Variables",
    formula: "0 ≤ p ≤ 1",
    description: "A continuous variable can take any value in a range.",
    application: "The estimated probability is a continuous value between 0 and 1."
  },
  {
    title: "Gradient Ascent",
    formula: "θ ← θ + η∇L(θ)",
    description: "Gradient ascent updates parameters in the direction that increases an objective function.",
    application: "It is one way to optimize likelihood; scikit-learn's LogisticRegression uses its own numerical solver."
  },
  {
    title: "Maximum Likelihood",
    formula: "θ̂ = arg maxθ L(θ)",
    description: "Maximum likelihood selects parameters that make the observed training labels most likely.",
    application: "Logistic Regression estimates coefficients from labelled training messages."
  },
  {
    title: "Logistic Regression",
    formula: "P(Y=1|X) = 1 / (1 + e⁻ᶻ)",
    description: "A linear score is transformed by the sigmoid function into a probability.",
    application: "This is the main classification model used by the project."
  },
  {
    title: "Train-Test Split",
    formula: "D = Dtrain ∪ Dtest",
    description: "Training data fits the model; held-out test data evaluates performance on unseen examples.",
    application: "The training script uses a stratified split and reports test-set metrics."
  },
  {
    title: "Deep Learning",
    formula: "Multiple learned representation layers",
    description: "Deep learning uses neural networks with multiple layers to learn representations.",
    application: "Not used in this project; Logistic Regression is intentionally selected for simplicity and interpretability."
  },
  {
    title: "Inside a Large Language Model",
    formula: "Tokens → embeddings → transformer",
    description: "Large language models use tokenization, embeddings and transformer networks.",
    application: "Not used for classification; PhishGuard uses a lightweight local statistical model."
  },
  {
    title: "Alignment",
    formula: "Useful + safe + honest",
    description: "Alignment concerns making AI systems behave in ways that are helpful and safe.",
    application: "The interface warns that predictions are estimates and should not be treated as proof."
  }
];

export const sampleMessages = [
  {
    message: "Your parcel is waiting. Pay the small delivery fee using this link.",
    label: "Review example"
  },
  {
    message: "Hi, are we still meeting for lunch tomorrow?",
    label: "Review example"
  },
  {
    message: "URGENT: Your account is locked. Verify your password immediately.",
    label: "Review example"
  }
];