function App() {
  const { useState, useMemo } = React;

  const [filter, setFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);

  // -----------------------------
  // MOCK DATA (IMPROVED)
  // -----------------------------
  const mockLogs = (() => {
    const devices = ["robot-1", "robot-2", "robot-3"];
    const commands = ["MOVE", "STOP"];

    const logs = [];
    const start = new Date("2026-04-01T00:00:00Z").getTime();
    const end = new Date("2026-04-29T23:00:00Z").getTime();

    for (let t = start; t <= end; t += 1000 * 60 * 60) {
      const date = new Date(t);
      const hour = date.getHours();

      // realistic activity curve
      const activity = hour > 8 && hour < 18 ? 1.6 : 0.6;

      const hazard = Math.min(Math.random() * activity, 1);
      const hasCommand = Math.random() < 0.6;

      logs.push({
        timestamp: date.toISOString(),
        device: devices[Math.floor(Math.random() * devices.length)],
        hazard,
        command: hasCommand
          ? hazard > 0.75
            ? "STOP"
            : commands[Math.floor(Math.random() * commands.length)]
          : null,
        commandConfidence: hasCommand ? 0.5 + Math.random() * 0.5 : null
      });
    }

    return logs;
  })();

  // -----------------------------
  // FILTER
  // -----------------------------
  const filtered = useMemo(() => {
    if (filter === "triggered") {
      return mockLogs.filter(l => l.hazard > 0.8);
    }
    return mockLogs;
  }, [filter]);

  // -----------------------------
  // VOLUME (SORTED TIME SERIES)
  // -----------------------------
  const volume = useMemo(() => {
    const buckets = {};

    filtered.forEach(l => {
      const hour = l.timestamp.slice(0, 13);
      buckets[hour] = (buckets[hour] || 0) + 1;
    });

    return Object.entries(buckets)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-30)
      .map(([hour, count]) => ({ hour, count }));
  }, [filtered]);

  const maxVolume = Math.max(...volume.map(v => v.count), 1);

  const avgHazard =
    filtered.reduce((a, b) => a + b.hazard, 0) / filtered.length;

  const getPolicy = (log) => {
    if (!log) return "";
    if (log.hazard > 0.9) return "EMERGENCY STOP";
    if (log.hazard > 0.8 && log.command === "STOP") return "OPERATOR OVERRIDE";
    return "CLEAR";
  };

  // -----------------------------
  // CHART PATH (SVG LINE)
  // -----------------------------
  const chartWidth = 300;
  const chartHeight = 180;

  const points = volume.map((v, i) => {
    const x = (i / (volume.length - 1)) * chartWidth;
    const y = chartHeight - (v.count / maxVolume) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{
      fontFamily: "Arial",
      background: "#C8D8E4",
      minHeight: "100vh"
    }}>

      {/* NAV */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        background: "rgba(255,255,255,0.7)",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        zIndex: 10
      }}>
        <b>SANGUINE AI</b>
        <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
          <a href="#">PROFILE</a>
          <a href="#">DOCUMENTATION</a>
        </div>
      </div>

      {/* FILTER */}
      <div style={{ padding: 20, paddingTop: 90 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Logs</option>
          <option value="triggered">Triggered Only</option>
        </select>

        <span style={{ marginLeft: 20 }}>
          Avg Hazard: <b>{avgHazard.toFixed(2)}</b>
        </span>
      </div>

      {/* GRID */}
      <div style={{
        padding: 20,
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: 20
      }}>

        {/* LOGS */}
        <div style={{ background: "white", padding: 15, borderRadius: 8 }}>
          <h3>Logs</h3>

          <div style={{
            maxHeight: 500,
            overflowY: "auto",
            border: "1px solid #eee",
            marginTop: 10
          }}>
            <table width="100%" cellPadding="6" style={{ fontSize: 12 }}>
              <thead style={{ position: "sticky", top: 0, background: "white" }}>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>Hazard</th>
                  <th>Command</th>
                  <th>Conf</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((l, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedLog(l)}
                    style={{
                      cursor: "pointer",
                      background: selectedLog === l ? "#e6f7ff" : "transparent"
                    }}
                  >
                    <td>{l.timestamp.slice(11, 19)}</td>
                    <td>{l.device}</td>
                    <td>{l.hazard.toFixed(2)}</td>
                    <td>{l.command || "—"}</td>
                    <td>{l.commandConfidence?.toFixed(2) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* INSPECT */}
        <div style={{ background: "white", padding: 15, borderRadius: 8 }}>
          <h3>Inspect</h3>

          {selectedLog ? (
            <div style={{ fontSize: 12 }}>
              <div><b>Time:</b> {selectedLog.timestamp}</div>
              <div><b>Device:</b> {selectedLog.device}</div>
              <div><b>Hazard:</b> {selectedLog.hazard.toFixed(2)}</div>
              <div><b>Command:</b> {selectedLog.command || "—"}</div>
              <div><b>Confidence:</b> {selectedLog.commandConfidence?.toFixed(2) || "—"}</div>
              <div style={{ marginTop: 10 }}>
                <b>Policy:</b> {getPolicy(selectedLog)}
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.5 }}>Select a log</div>
          )}
        </div>

        {/* VOLUME CHART (UPGRADED) */}
        <div style={{ background: "white", padding: 15, borderRadius: 8 }}>
          <h3>Volume</h3>

          <svg width="100%" height="200" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* grid lines */}
            {[0.25, 0.5, 0.75].map((g, i) => (
              <line
                key={i}
                x1="0"
                x2={chartWidth}
                y1={chartHeight * g}
                y2={chartHeight * g}
                stroke="#eee"
              />
            ))}

            {/* line */}
            <polyline
              fill="none"
              stroke="#2EC7FF"
              strokeWidth="2"
              points={points}
            />
          </svg>
        </div>

        {/* POLICIES */}
        <div style={{
          gridColumn: "1 / 4",
          background: "white",
          padding: 15,
          borderRadius: 8
        }}>
          <h3>Policies</h3>

          <pre style={{
            background: "#f4f4f4",
            padding: 12,
            fontSize: 12
          }}>
{`if (hazard > 0.9) {
  EMERGENCY_STOP();
}

if (hazard > 0.8 && command === "STOP") {
  OVERRIDE_OPERATOR();
}

if (vision.occlusion > 0.8) {
  SAFE_MODE();
}`}
          </pre>
        </div>

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
