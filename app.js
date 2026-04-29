function App() {
  const { useState, useMemo } = React;

  const [filter, setFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);

  // -----------------------------
  // MOCK DATA
  // -----------------------------
  const mockLogs = (() => {
    const devices = ["robot-1", "robot-2", "robot-3"];
    const commands = ["MOVE", "STOP"];

    const logs = [];
    const start = new Date("2025-04-27T08:00:00Z").getTime();
    const end = new Date("2026-04-29T18:00:00Z").getTime();

    for (let t = start; t <= end; t += 1000 * 60 * 30) {
      const date = new Date(t);

      const hazard = Math.random();
      const hasCommand = Math.random() < 0.6;

      const command = hasCommand
        ? hazard > 0.75
          ? "STOP"
          : commands[Math.floor(Math.random() * commands.length)]
        : null;

      const commandConfidence = hasCommand
        ? 0.5 + Math.random() * 0.5
        : null;

      logs.push({
        timestamp: date.toISOString(),
        device: devices[Math.floor(Math.random() * devices.length)],
        hazard,
        command,
        commandConfidence
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
  // VOLUME
  // -----------------------------
  const volume = useMemo(() => {
    const buckets = {};

    filtered.forEach(l => {
      const hour = new Date(l.timestamp).toISOString().slice(0, 13);
      buckets[hour] = (buckets[hour] || 0) + 1;
    });

    return Object.entries(buckets).slice(0, 12).map(([hour, count]) => ({
      hour,
      count
    }));
  }, [filtered]);

  const maxVolume = Math.max(...volume.map(v => v.count), 1);

  const avgHazard =
    filtered.reduce((a, b) => a + b.hazard, 0) / filtered.length;

  // -----------------------------
  // POLICY CHECK
  // -----------------------------
  const getPolicyResult = (log) => {
    if (!log) return "";
    if (log.hazard > 0.9) return "EMERGENCY STOP";
    if (log.hazard > 0.8 && log.command === "STOP") return "OPERATOR OVERRIDE";
    return "CLEAR";
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{
      fontFamily: "Arial",
      background: "#C8D8E4",
      minHeight: "100vh",
      overflowY: "auto"
    }}>

      {/* NAVBAR */}
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
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(10px)",
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

      {/* DASHBOARD GRID */}
      <div style={{
        padding: 20,
        paddingTop: 0,
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "auto auto",
        gap: 20
      }}>

        {/* LOGS PANEL */}
        <div style={{
          background: "white",
          borderRadius: 8,
          padding: 15
        }}>
          <h3>Logs</h3>

          <div style={{
            maxHeight: 480,
            overflowY: "auto",
            border: "1px solid #eee",
            marginTop: 10
          }}>
            <table width="100%" cellPadding="6" style={{ fontSize: 12 }}>
              <thead style={{
                position: "sticky",
                top: 0,
                background: "white"
              }}>
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
                    <td>{l.commandConfidence ? l.commandConfidence.toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LOG DETAILS */}
          <div style={{
            marginTop: 12,
            padding: 10,
            border: "1px solid #eee",
            background: "#fafafa",
            fontSize: 12
          }}>
            <b>Log Details</b>

            {selectedLog ? (
              <div style={{ marginTop: 8 }}>
                <div><b>Time:</b> {selectedLog.timestamp}</div>
                <div><b>Device:</b> {selectedLog.device}</div>
                <div><b>Hazard:</b> {selectedLog.hazard.toFixed(2)}</div>
                <div><b>Command:</b> {selectedLog.command || "—"}</div>
                <div>
                  <b>Confidence:</b>{" "}
                  {selectedLog.commandConfidence
                    ? selectedLog.commandConfidence.toFixed(2)
                    : "—"}
                </div>
                <div style={{ marginTop: 6 }}>
                  <b>Policy Result:</b> {getPolicyResult(selectedLog)}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 8, opacity: 0.5 }}>
                Click a log row to inspect details
              </div>
            )}
          </div>
        </div>

        {/* VOLUME PANEL */}
        <div style={{
          background: "white",
          borderRadius: 8,
          padding: 15
        }}>
          <h3>Volume</h3>

          <div style={{
            display: "flex",
            alignItems: "flex-end",
            height: 260,
            gap: 6,
            marginTop: 10,
            border: "1px solid #eee",
            padding: 10
          }}>
            {volume.map((v, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: Math.max((v.count / maxVolume) * 220, 4),
                  background: "#2EC7FF"
                }}
              />
            ))}
          </div>
        </div>

        {/* POLICIES PANEL */}
        <div style={{
          gridColumn: "1 / 3",
          background: "white",
          borderRadius: 8,
          padding: 15
        }}>
          <h3>Policies</h3>

          <pre style={{
            background: "#f4f4f4",
            padding: 12,
            fontSize: 12,
            overflowX: "auto"
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
