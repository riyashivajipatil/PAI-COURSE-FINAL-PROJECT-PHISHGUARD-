import { useEffect, useMemo, useState } from "react";

import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell,
  BrainCircuit, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, BookOpen, Gauge, LayoutDashboard, LockKeyhole,
  Moon, Search, ScanSearch, ShieldAlert, ShieldCheck, Sun,
  Target, TrendingUp, X, Zap, BarChart3, MessageSquareText, Info
} from "lucide-react";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

import {
  navGroups,
  conceptItems,
  sampleMessages
} from "./data";

import { predictMessage } from "./model";

const iconMap = {
  dashboard: LayoutDashboard,
  scan: ScanSearch,
  chart: BarChart3,
  brain: BrainCircuit
};

const initialHistory = [];

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

/* SIDEBAR */

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>

      <div className="brand-row">

        <div className="brand-mark">
          <ShieldCheck size={25} strokeWidth={2.3} />
        </div>

        {!collapsed && (
          <div className="brand-word">
            phish<span>guard</span>
          </div>
        )}

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <ChevronRight size={17} />
            : <ChevronLeft size={17} />
          }
        </button>

      </div>

      <div className="sidebar-scroll">

        {navGroups.map((group) => (

          <div className="nav-group" key={group.title}>

            {!collapsed && (
              <div className="nav-label">{group.title}</div>
            )}

            {group.items.map((item) => {

              const Icon = iconMap[item.icon];

              return (
                <button
                  key={item.id}
                  className={`nav-link ${
                    page === item.id ? "selected" : ""
                  }`}
                  onClick={() => setPage(item.id)}
                  title={item.label}
                >

                  <Icon size={19} />

                  {!collapsed && <span>{item.label}</span>}

                  {page === item.id && !collapsed && (
                    <span className="nav-active-dot" />
                  )}

                </button>
              );

            })}

          </div>

        ))}

      </div>

      {!collapsed && (

        <div className="workspace-card">

          <div className="workspace-symbol">
            <LockKeyhole size={19} />
          </div>

          <div>
            <small>Workspace</small>
            <strong>Security Research Lab</strong>
          </div>

          <span className="online-dot" />

        </div>

      )}

      <div className="sidebar-bottom">
        PHISHGUARD · v1.0
      </div>

    </aside>
  );
}

/* TOP NAVIGATION */

function Topbar({ dark, setDark, title, onSearch }) {
  return (
    <header className="topbar">

      <div className="topbar-context">
        <span className="breadcrumb-muted">Workspace</span>
        <ChevronRight size={14} />
        <strong>{title}</strong>
      </div>

      <div className="topbar-actions">

        <span className="system-pill">
          <i /> LOCAL ENGINE
        </span>

        <button
          className="top-icon"
          onClick={onSearch}
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <button
          className="top-icon"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <i className="notification-dot" />
        </button>

        <button
          className="theme-toggle"
          onClick={() => setDark(!dark)}
          aria-label="Toggle light and dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}

          <span>
            {dark ? "Light mode" : "Dark mode"}
          </span>
        </button>

        <div className="avatar">PG</div>

      </div>

    </header>
  );
}

/* PAGE HEADING */

function PageHeading({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <div className="page-heading">

      <div>
        <div className="eyebrow">{eyebrow}</div>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      {action && (
        <div className="heading-action">
          {action}
        </div>
      )}

    </div>
  );
}

/* DASHBOARD METRIC CARD */

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "purple",
  trend
}) {
  return (
    <article className="metric-card">

      <div className="metric-topline">

        <div className={`metric-icon ${tone}`}>
          <Icon size={20} />
        </div>

        {trend && (
          <span className={`metric-trend ${trend.direction}`}>

            {trend.direction === "up"
              ? <ArrowUpRight size={14} />
              : <ArrowDownRight size={14} />
            }

            {trend.text}

          </span>
        )}

      </div>

      <div className="metric-label">{label}</div>

      <div className="metric-value">{value}</div>

      <div className="metric-note">{note}</div>

    </article>
  );
}

/* REUSABLE PANEL */

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
  children
}) {
  return (
    <section className={`panel ${className}`}>

      <div className="panel-head">

        <div className="panel-title-wrap">

          {Icon && (
            <span className="panel-icon">
              <Icon size={18} />
            </span>
          )}

          <div>
            <h3>{title}</h3>

            {subtitle && <p>{subtitle}</p>}
          </div>

        </div>

        {action && <div>{action}</div>}

      </div>

      {children}

    </section>
  );
}

function EmptyPanel({
  icon: Icon = Activity,
  title,
  description
}) {
  return (

    <div className="empty-panel">

      <div className="empty-icon">
        <Icon size={25} />
      </div>

      <strong>{title}</strong>

      <p>{description}</p>

    </div>

  );
}

/* PAGE 1 – OVERVIEW */

function Overview({
  history,
  modelReady,
  setPage
}) {

  const chartData = useMemo(() => {

    const days = [
      "Mon", "Tue", "Wed", "Thu",
      "Fri", "Sat", "Sun"
    ];

    return days.map((day, i) => {

      const rows = history.filter(
        (item) =>
          new Date(item.time).getDay() ===
          [1, 2, 3, 4, 5, 6, 0][i]
      );

      return {
        day,
        scam: rows.filter(
          (r) => r.risk !== "Low"
        ).length,

        genuine: rows.filter(
          (r) => r.risk === "Low"
        ).length
      };

    });

  }, [history]);

  const scamCount = history.filter(
    (x) => x.risk !== "Low"
  ).length;

  const genuineCount = history.length - scamCount;

  const pieData = history.length
    ? [
        {
          name: "Scam / suspicious",
          value: scamCount,
          color: "#8d7cff"
        },
        {
          name: "Likely genuine",
          value: genuineCount,
          color: "#45d6be"
        }
      ]
    : [];

  return (

    <>

      <PageHeading
        eyebrow="THREAT INTELLIGENCE / OVERVIEW"
        title="Overview"
        description="Monitor message analysis, probability signals and detection activity."
        action={
          <span className={`model-status ${
            modelReady ? "ready" : "pending"
          }`}>
            <i />
            {modelReady
              ? "MODEL ONLINE"
              : "MODEL NOT CONNECTED"
            }
          </span>
        }
      />

      <div className="metric-grid">

        <MetricCard
          icon={MessageSquareText}
          label="Total Messages Analysed"
          value={history.length}
          note="Messages checked in this browser session"
          tone="purple"
        />

        <MetricCard
          icon={ShieldAlert}
          label="Scam / Suspicious"
          value={scamCount}
          note="Medium and high-risk predictions"
          tone="red"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Likely Genuine"
          value={genuineCount}
          note="Low-risk predictions"
          tone="teal"
        />

        <MetricCard
          icon={Gauge}
          label="Model Availability"
          value={modelReady ? "Online" : "Pending"}
          note={
            modelReady
              ? "Local model loaded"
              : "Train and add model.json"
          }
          tone="amber"
        />

      </div>

      <div className="dashboard-grid">

        <Panel
          title="Detection Activity"
          subtitle="Actual predictions from this browser session"
          icon={Activity}
          className="activity-panel"
          action={
            <span className="panel-chip">
              SESSION DATA
            </span>
          }
        >

          {history.length ? (

            <div className="chart-box">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={chartData}>

                  <defs>

                    <linearGradient
                      id="scamFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8d7cff"
                        stopOpacity={0.32}
                      />
                      <stop
                        offset="100%"
                        stopColor="#8d7cff"
                        stopOpacity={0.01}
                      />
                    </linearGradient>

                    <linearGradient
                      id="genuineFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#45d6be"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#45d6be"
                        stopOpacity={0.01}
                      />
                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    strokeDasharray="4 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "var(--muted)",
                      fontSize: 11
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "var(--muted)",
                      fontSize: 11
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)"
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="scam"
                    name="Scam / suspicious"
                    stroke="#8d7cff"
                    fill="url(#scamFill)"
                    strokeWidth={2.5}
                  />

                  <Area
                    type="monotone"
                    dataKey="genuine"
                    name="Likely genuine"
                    stroke="#45d6be"
                    fill="url(#genuineFill)"
                    strokeWidth={2.5}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <EmptyPanel
              icon={Activity}
              title="No analysis activity yet"
              description="Run your first message analysis. Real session data will appear here automatically."
            />

          )}

          <div className="chart-legend">
            <span>
              <i className="legend-purple" />
              Scam / suspicious
            </span>

            <span>
              <i className="legend-teal" />
              Likely genuine
            </span>
          </div>

        </Panel>

        <Panel
          title="Classification Split"
          subtitle="Distribution of analysed messages"
          icon={ShieldCheck}
          className="split-panel"
        >

          {history.length ? (

            <>

              <div className="donut-wrap">

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius="68%"
                      outerRadius="91%"
                      paddingAngle={4}
                      stroke="none"
                    >

                      {pieData.map((x) => (
                        <Cell
                          key={x.name}
                          fill={x.color}
                        />
                      ))}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{history.length}</strong>
                  <span>analysed</span>
                </div>

              </div>

              <div className="split-legend">

                {pieData.map((x) => (

                  <div key={x.name}>

                    <span>
                      <i style={{ background: x.color }} />
                      {x.name}
                    </span>

                    <strong>{x.value}</strong>

                  </div>

                ))}

              </div>

            </>

          ) : (

            <EmptyPanel
              icon={ShieldCheck}
              title="Awaiting predictions"
              description="The chart will show the actual scam and genuine message split."
            />

          )}

        </Panel>

      </div>

      <div className="lower-grid">

        <Panel
          title="Recent Detections"
          subtitle="Latest messages analysed"
          icon={ScanSearch}
          action={
            <button
              className="text-action"
              onClick={() => setPage("detector")}
            >
              New analysis <ChevronRight size={14} />
            </button>
          }
        >

          {history.length ? (

            <div className="recent-list">

              {history.slice(0, 4).map((item) => (

                <div className="recent-row" key={item.id}>

                  <div className={`recent-symbol ${
                    item.risk.toLowerCase()
                  }`}>
                    <MessageSquareText size={16} />
                  </div>

                  <div className="recent-copy">

                    <strong>{item.preview}</strong>

                    <small>
                      {new Date(item.time).toLocaleString()}
                    </small>

                  </div>

                  <span className={`risk-tag ${
                    item.risk.toLowerCase()
                  }`}>
                    {item.risk}
                  </span>

                </div>

              ))}

            </div>

          ) : (

            <div className="compact-empty">
              No detections recorded yet.
            </div>

          )}

        </Panel>

        <Panel
          title="Detection Engine"
          subtitle="Current model configuration"
          icon={BrainCircuit}
        >

          <div className="engine-card">

            <div className="engine-logo">
              <BrainCircuit size={23} />
            </div>

            <div>
              <strong>Logistic Regression</strong>
              <span>TF-IDF text features · Binary classification</span>
            </div>

            <span className={`tiny-status ${
              modelReady ? "ready" : ""
            }`}>
              {modelReady ? "READY" : "PENDING"}
            </span>

          </div>

          <div className="engine-meta">
            <span>Inference</span>
            <strong>In-browser</strong>
          </div>

          <div className="engine-meta">
            <span>Output</span>
            <strong>Class probability</strong>
          </div>

          <div className="engine-meta">
            <span>Data handling</span>
            <strong>Local only</strong>
          </div>

        </Panel>

      </div>

    </>

  );
}

/* PROBABILITY RING */

function ProbabilityRing({ value, label, tone }) {

  const percent = Math.round(value * 100);

  return (

    <div
      className={`probability-ring ${tone}`}
      style={{
        "--progress": `${percent * 3.6}deg`
      }}
    >

      <div className="ring-inner">
        <strong>{percent}%</strong>
        <span>{label}</span>
      </div>

    </div>

  );
}

/* PAGE 2 – MESSAGE DETECTOR */

function Detector({
  model,
  modelReady,
  addHistory
}) {

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  function analyse() {

    setError("");
    setResult(null);

    if (!message.trim()) {
      setError("Enter a message before starting analysis.");
      return;
    }

    if (!modelReady) {
      setError(
        "The trained model is not available. Train the model first and add model.json to public/model/."
      );
      return;
    }

    try {

      const prediction = predictMessage(message, model);

      const record = {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toISOString(),
        preview: message.trim().replace(/\s+/g, " ").slice(0, 72),
        scamProbability: prediction.scamProbability,
        genuineProbability: prediction.genuineProbability,
        risk: prediction.risk
      };

      setResult(prediction);
      addHistory(record);

    } catch (e) {

      setError(e.message);

    }

  }

  return (

    <>

      <PageHeading
        eyebrow="OPERATIONS / MESSAGE INSPECTION"
        title="Message Detector"
        description="Submit a suspicious SMS, email or chat message for probabilistic analysis."
        action={
          <span className={`model-status ${
            modelReady ? "ready" : "pending"
          }`}>
            <i />
            {modelReady ? "MODEL ONLINE" : "MODEL NOT CONNECTED"}
          </span>
        }
      />

      <div className="detector-layout">

        <div className="detector-main">

          <Panel
            title="Message Analysis"
            subtitle="Paste the complete message content below"
            icon={ScanSearch}
            action={
              <button
                className="text-action"
                onClick={() => setShowExamples(!showExamples)}
              >
                Examples <ChevronDown size={14} />
              </button>
            }
          >

            {showExamples && (

              <div className="example-list">

                {sampleMessages.map((x) => (

                  <button
                    key={x.message}
                    onClick={() => {
                      setMessage(x.message);
                      setResult(null);
                    }}
                  >
                    {x.message}
                  </button>

                ))}

              </div>

            )}

            <label
              className="field-label"
              htmlFor="message-input"
            >
              MESSAGE CONTENT
            </label>

            <textarea
              id="message-input"
              className="message-input"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setResult(null);
              }}
              placeholder="Paste an SMS, email or chat message here..."
            />

            <div className="input-meta">

              <span>
                {message.length} characters · {
                  message.trim()
                    ? message.trim().split(/\s+/).length
                    : 0
                } words
              </span>

              <button
                className="clear-btn"
                onClick={() => {
                  setMessage("");
                  setResult(null);
                  setError("");
                }}
              >
                <X size={13} /> Clear
              </button>

            </div>

            {error && (

              <div className="inline-error">
                <AlertTriangle size={16} />
                {error}
              </div>

            )}

            <div className="analysis-actions">

              <div className="privacy-note">
                <LockKeyhole size={15} />
                Message is analysed locally in your browser.
              </div>

              <button
                className="primary-button"
                onClick={analyse}
                disabled={!message.trim()}
              >
                <ScanSearch size={17} />
                Analyse Message
              </button>

            </div>

          </Panel>

          {result ? (

            <Panel
              title="Probability Assessment"
              subtitle="Output from the Logistic Regression model"
              icon={Gauge}
              className="result-panel"
            >

              <div className="result-summary">

                <div>

                  <span className={`risk-tag large ${
                    result.risk.toLowerCase()
                  }`}>
                    {result.risk} RISK
                  </span>

                  <h2>
                    {result.risk === "High"
                      ? "Suspicious message detected"
                      : result.risk === "Medium"
                      ? "Potentially suspicious message"
                      : "Likely genuine message"
                    }
                  </h2>

                  <p>
                    Risk categories are project thresholds,
                    not a guarantee of safety.
                  </p>

                </div>

                <div className="score-pill">
                  <span>MODEL SCORE</span>
                  <strong>{result.score.toFixed(3)}</strong>
                </div>

              </div>

              <div className="probability-grid">

                <div className="probability-card">

                  <ProbabilityRing
                    value={result.scamProbability}
                    label="Scam probability"
                    tone="purple"
                  />

                  <strong>Scam / suspicious</strong>

                </div>

                <div className="probability-card">

                  <ProbabilityRing
                    value={result.genuineProbability}
                    label="Genuine probability"
                    tone="teal"
                  />

                  <strong>Likely genuine</strong>

                </div>

              </div>

              <div className="probability-bars">

                <div>
                  <span>Scam probability</span>
                  <strong>
                    {formatPercent(result.scamProbability)}
                  </strong>
                </div>

                <div className="progress-track">
                  <i
                    className="progress-scam"
                    style={{
                      width: formatPercent(result.scamProbability)
                    }}
                  />
                </div>

                <div>
                  <span>Genuine probability</span>
                  <strong>
                    {formatPercent(result.genuineProbability)}
                  </strong>
                </div>

                <div className="progress-track">
                  <i
                    className="progress-genuine"
                    style={{
                      width: formatPercent(result.genuineProbability)
                    }}
                  />
                </div>

              </div>

              <div className="indicator-box">

                <h4>
                  <Target size={16} />
                  Influential message terms
                </h4>

                {result.indicators.length ? (

                  <div className="indicator-tags">

                    {result.indicators.map((x) => (

                      <span key={x.token}>
                        {x.token}

                        <b>
                          {x.contribution > 0 ? "+" : ""}
                          {x.contribution.toFixed(3)}
                        </b>
                      </span>

                    ))}

                  </div>

                ) : (

                  <p>
                    No strong individual token contributions
                    were identified by this model.
                  </p>

                )}

              </div>

            </Panel>

          ) : (

            <Panel
              title="Prediction Output"
              subtitle="Your probability assessment will appear here"
              icon={Gauge}
            >

              <EmptyPanel
                icon={ShieldCheck}
                title="Ready for message analysis"
                description="Enter a message and select Analyse Message to view scam probability, genuine probability, risk level and influential terms."
              />

            </Panel>

          )}

        </div>

        <div className="detector-side">

          <Panel
            title="Analysis Pipeline"
            subtitle="How the message is processed"
            icon={Activity}
          >

            <div className="pipeline">

              {[
                "Message input",
                "Text tokenization",
                "TF-IDF feature extraction",
                "Logistic Regression",
                "Probability output"
              ].map((x, i) => (

                <div className="pipeline-step" key={x}>

                  <span>{i + 1}</span>

                  <strong>{x}</strong>

                  {i !== 4 && <i />}

                </div>

              ))}

            </div>

          </Panel>

          <Panel
            title="Risk Thresholds"
            subtitle="Project classification rules"
            icon={ShieldAlert}
          >

            <div className="threshold-row">
              <span className="risk-tag low">LOW</span>
              <strong>0% – 39.9%</strong>
            </div>

            <div className="threshold-row">
              <span className="risk-tag medium">MEDIUM</span>
              <strong>40% – 74.9%</strong>
            </div>

            <div className="threshold-row">
              <span className="risk-tag high">HIGH</span>
              <strong>75% – 100%</strong>
            </div>

            <p className="threshold-note">
              Thresholds are configurable project choices.
              They are not universal security standards.
            </p>

          </Panel>

          <div className="safety-note">

            <Info size={17} />

            <p>
              <strong>Important</strong> A low predicted risk
              does not prove a message is safe. Never share
              passwords, OTPs or payment details through
              unverified links.
            </p>

          </div>

        </div>

      </div>

    </>

  );
}

/* CONFUSION MATRIX */

function ConfusionMatrix({ matrix }) {

  if (!matrix) {

    return (
      <EmptyPanel
        icon={Target}
        title="Evaluation data unavailable"
        description="Train the model to generate the held-out test-set confusion matrix."
      />
    );

  }

  const cells = [
    {
      label: "True negative",
      value: matrix[0][0],
      cls: "tn"
    },
    {
      label: "False positive",
      value: matrix[0][1],
      cls: "fp"
    },
    {
      label: "False negative",
      value: matrix[1][0],
      cls: "fn"
    },
    {
      label: "True positive",
      value: matrix[1][1],
      cls: "tp"
    }
  ];

  return (

    <div className="matrix-wrap">

      <div className="matrix-axis">
        Predicted label
      </div>

      <div className="matrix-grid">

        <div className="matrix-y">
          Actual label
        </div>

        {cells.map((x) => (

          <div
            className={`matrix-cell ${x.cls}`}
            key={x.cls}
          >
            <strong>{x.value}</strong>
            <span>{x.label}</span>
          </div>

        ))}

      </div>

      <div className="matrix-legend">
        <span>Rows: actual class</span>
        <span>Columns: predicted class</span>
      </div>

    </div>

  );
}

/* PAGE 3 – ANALYTICS */

function Analytics({ model }) {

  const metrics = model?.metrics;
  const matrix = metrics?.confusion_matrix;
  const roc = model?.roc_curve || [];

  const barData = metrics
    ? [
        { name: "Accuracy", score: metrics.accuracy * 100 },
        { name: "Precision", score: metrics.precision * 100 },
        { name: "Recall", score: metrics.recall * 100 },
        { name: "F1-score", score: metrics.f1 * 100 }
      ]
    : [];

  return (

    <>

      <PageHeading
        eyebrow="INTELLIGENCE / MODEL EVALUATION"
        title="Analytics & Performance"
        description="Evaluate the trained classifier using held-out test data and standard classification metrics."
        action={
          <span className={`model-status ${
            metrics ? "ready" : "pending"
          }`}>
            <i />
            {metrics ? "TEST METRICS LOADED" : "AWAITING MODEL"}
          </span>
        }
      />

      {metrics ? (

        <>

          <div className="metric-grid four">

            <MetricCard
              icon={Target}
              label="Accuracy"
              value={formatPercent(metrics.accuracy)}
              note="Correct predictions / all predictions"
              tone="purple"
            />

            <MetricCard
              icon={CheckCircle2}
              label="Precision"
              value={formatPercent(metrics.precision)}
              note="Positive predictions that were correct"
              tone="teal"
            />

            <MetricCard
              icon={Activity}
              label="Recall"
              value={formatPercent(metrics.recall)}
              note="Actual scam cases identified"
              tone="amber"
            />

            <MetricCard
              icon={Gauge}
              label="F1-Score"
              value={formatPercent(metrics.f1)}
              note="Harmonic mean of precision and recall"
              tone="red"
            />

          </div>

          <div className="analytics-grid">

            <Panel
              title="Classification Metrics"
              subtitle="Scores on the locked test set"
              icon={BarChart3}
            >

              <div className="chart-box medium">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ left: 10, right: 25 }}
                  >

                    <CartesianGrid
                      stroke="var(--chart-grid)"
                      strokeDasharray="4 5"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{
                        fill: "var(--muted)",
                        fontSize: 10
                      }}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={75}
                      tick={{
                        fill: "var(--muted)",
                        fontSize: 11
                      }}
                    />

                    <Tooltip
                      formatter={(v) =>
                        `${Number(v).toFixed(1)}%`
                      }
                    />

                    <Bar
                      dataKey="score"
                      fill="#8d7cff"
                      radius={[0, 7, 7, 0]}
                      barSize={20}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </Panel>

            <Panel
              title="Confusion Matrix"
              subtitle="Actual vs predicted classifications"
              icon={Target}
            >

              <ConfusionMatrix matrix={matrix} />

            </Panel>

          </div>

          <Panel
            title="ROC Curve"
            subtitle={`Receiver Operating Characteristic · AUC ${Number(
              metrics.roc_auc
            ).toFixed(3)}`}
            icon={TrendingUp}
          >

            {roc.length ? (

              <div className="chart-box roc-chart">

                <ResponsiveContainer width="100%" height="100%">

                  <LineChart data={roc}>

                    <CartesianGrid
                      stroke="var(--chart-grid)"
                      strokeDasharray="4 5"
                    />

                    <XAxis
                      type="number"
                      dataKey="fpr"
                      domain={[0, 1]}
                      label={{
                        value: "False Positive Rate",
                        position: "insideBottom",
                        offset: -5,
                        fill: "var(--muted)"
                      }}
                      tick={{
                        fill: "var(--muted)",
                        fontSize: 10
                      }}
                    />

                    <YAxis
                      type="number"
                      dataKey="tpr"
                      domain={[0, 1]}
                      label={{
                        value: "True Positive Rate",
                        angle: -90,
                        position: "insideLeft",
                        fill: "var(--muted)"
                      }}
                      tick={{
                        fill: "var(--muted)",
                        fontSize: 10
                      }}
                    />

                    <Tooltip />

                    <Line
                      dataKey="tpr"
                      name="ROC"
                      stroke="#8d7cff"
                      strokeWidth={3}
                      dot={false}
                    />

                    <Line
                      data={roc.map((x) => ({
                        fpr: x.fpr,
                        baseline: x.fpr
                      }))}
                      dataKey="baseline"
                      name="Random baseline"
                      stroke="var(--muted)"
                      strokeDasharray="5 5"
                      dot={false}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <EmptyPanel
                icon={TrendingUp}
                title="ROC data not present"
                description="Retrain/export the model with ROC curve coordinates to display this chart."
              />

            )}

          </Panel>

          <div className="metrics-footnote">
            <Info size={16} />
            Results are measured on the held-out test split.
            Performance depends on dataset quality and may not
            generalize to every real-world message.
          </div>

        </>

      ) : (

        <div className="analytics-empty-grid">

          <Panel
            title="Model evaluation"
            subtitle="No trained model metrics found"
            icon={BarChart3}
          >

            <EmptyPanel
              icon={BrainCircuit}
              title="Connect the trained model"
              description="Run the training script, then place the generated model.json into public/model/. The page will load the actual evaluation metrics."
            />

          </Panel>

          <Panel
            title="Metrics guide"
            subtitle="What each measure tells us"
            icon={BookOpen}
          >

            <div className="metric-guide">

              <p>
                <strong>Accuracy</strong> — overall fraction
                of correct predictions.
              </p>

              <p>
                <strong>Precision</strong> — how many predicted
                scams were actually scams.
              </p>

              <p>
                <strong>Recall</strong> — how many actual scams
                were detected.
              </p>

              <p>
                <strong>F1-score</strong> — balance between
                precision and recall.
              </p>

              <p>
                <strong>ROC-AUC</strong> — ranking ability across
                classification thresholds.
              </p>

            </div>

          </Panel>

        </div>

      )}

    </>

  );

}

/* PAGE 4 – PAI CONCEPTS */

function Concepts() {

  const [selected, setSelected] = useState(0);

  const item = conceptItems[selected];

  return (

    <>

      <PageHeading
        eyebrow="INTELLIGENCE / PROBABILITY LEARNING"
        title="PAI Concepts & Model"
        description="Explore the probability and machine-learning ideas used in PhishGuard."
        action={
          <span className="panel-chip">
            CONCEPT LIBRARY
          </span>
        }
      />

      <div className="concept-layout">

        <Panel
          title="Course concepts"
          subtitle="Select a lesson to explore"
          icon={BookOpen}
          className="concept-nav-panel"
        >

          <div className="concept-nav-list">

            {conceptItems.map((x, i) => (

              <button
                key={x.title}
                onClick={() => setSelected(i)}
                className={
                  selected === i ? "concept-selected" : ""
                }
              >

                <span>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <strong>{x.title}</strong>

                <ChevronRight size={15} />

              </button>

            ))}

          </div>

        </Panel>

        <div className="concept-detail-column">

          <Panel
            title={item.title}
            subtitle="Concept explanation and project connection"
            icon={BrainCircuit}
            className="concept-detail"
          >

            <div className="concept-number-large">
              {String(selected + 1).padStart(2, "0")}

              <span>
                / {String(conceptItems.length).padStart(2, "0")}
              </span>
            </div>

            <p className="concept-description">
              {item.description}
            </p>

            <div className="formula-card">

              <span>KEY EXPRESSION</span>

              <strong>{item.formula}</strong>

            </div>

            <div className="application-card">

              <div>
                <Zap size={17} />
                APPLICATION IN PHISHGUARD
              </div>

              <p>{item.application}</p>

            </div>

            <div className="concept-controls">

              <button
                className="secondary-button"
                onClick={() =>
                  setSelected(Math.max(0, selected - 1))
                }
                disabled={selected === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span>
                Lesson {selected + 1} of {conceptItems.length}
              </span>

              <button
                className="primary-button compact"
                onClick={() =>
                  setSelected(
                    Math.min(
                      conceptItems.length - 1,
                      selected + 1
                    )
                  )
                }
                disabled={
                  selected === conceptItems.length - 1
                }
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>

          </Panel>

          <Panel
            title="Project model workflow"
            subtitle="From raw message to probability estimate"
            icon={Activity}
          >

            <div className="workflow-grid">

              {[
                "Input message",
                "Tokenization",
                "TF-IDF vector",
                "Logistic Regression",
                "Scam probability"
              ].map((x, i) => (

                <div className="workflow-step" key={x}>

                  <span>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <strong>{x}</strong>

                  {i < 4 && <ChevronRight size={15} />}

                </div>

              ))}

            </div>

          </Panel>

          <div className="model-note">

            <ShieldCheck size={18} />

            <p>
              <strong>Model selection:</strong> Logistic
              Regression is used because it is efficient,
              interpretable and produces class probabilities.
              Deep learning and LLMs are not required for
              this small project.
            </p>

          </div>

        </div>

      </div>

    </>

  );

}

/* MAIN APPLICATION */

export default function App() {

  const [dark, setDark] = useState(() => {

    const saved = localStorage.getItem("phishguard-theme");

    return saved ? saved === "dark" : true;

  });

  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [model, setModel] = useState(null);
  const [history, setHistory] = useState(initialHistory);
  const [searchOpen, setSearchOpen] = useState(false);

  /* Theme setting */

  useEffect(() => {

    localStorage.setItem(
      "phishguard-theme",
      dark ? "dark" : "light"
    );

    document.documentElement.dataset.theme =
      dark ? "dark" : "light";

  }, [dark]);

  /* Load trained model */

  useEffect(() => {

    fetch(
      `${import.meta.env.BASE_URL}model/model.json`
    )
      .then((response) =>
        response.ok ? response.json() : null
      )
      .then((data) => {
        if (data?.trained) {
          setModel(data);
        }
      })
      .catch(() => setModel(null));

  }, []);

  const modelReady = Boolean(model?.trained);

  const titles = {
    overview: "Overview",
    detector: "Message Detector",
    analytics: "Analytics",
    concepts: "PAI Concepts"
  };

  function addHistory(record) {

    setHistory((old) =>
      [record, ...old].slice(0, 100)
    );

  }

  const pageContent = {

    overview: (
      <Overview
        history={history}
        modelReady={modelReady}
        setPage={setPage}
      />
    ),

    detector: (
      <Detector
        model={model}
        modelReady={modelReady}
        addHistory={addHistory}
      />
    ),

    analytics: (
      <Analytics model={model} />
    ),

    concepts: <Concepts />

  };

  return (

    <div className={`app-shell ${
      dark ? "dark-theme" : "light-theme"
    }`}>

      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`main-area ${
        collapsed ? "main-collapsed" : ""
      }`}>

        <Topbar
          dark={dark}
          setDark={setDark}
          title={titles[page]}
          onSearch={() => setSearchOpen(!searchOpen)}
        />

        {searchOpen && (

          <div className="search-strip">

            <Search size={16} />

            <input
              autoFocus
              placeholder="Search is a visual shortcut in this prototype..."
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchOpen(false);
                }
              }}
            />

            <button onClick={() => setSearchOpen(false)}>
              <X size={16} />
            </button>

          </div>

        )}

        <div className="page-content">

          {pageContent[page]}

          <footer className="app-footer">

            <span>
              PHISHGUARD
              <i>·</i>
              PROBABILISTIC THREAT INTELLIGENCE
            </span>

            <span>
              LOCAL INFERENCE
              <i>·</i>
              LOGISTIC REGRESSION
            </span>

          </footer>

        </div>

      </main>

    </div>

  );

}