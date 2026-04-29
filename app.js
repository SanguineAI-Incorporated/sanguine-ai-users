function App() {
  const { useState, useMemo } = React;

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

  const [filter, setFilter] = useState("all");

  // -----------------------------
  // FILTERED LOGS
  // -----------------------------
  const filtered = useMemo(() => {
    if (filter === "triggered") {
      return mockLogs.filter(l => l.hazard > 0.8);
    }
    return mockLogs;
  }, [filter]);

  // -----------------------------
  // VOLUME DATA (HOURLY BUCKETS)
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

  // -----------------------------
  // POLICY CHECK
  // -----------------------------
  const policyCheck = (log) => {
    if (log.hazard > 0.9) return "EMERGENCY STOP (HIGH HAZARD)";
    if (log.hazard > 0.8 && log.command === "STOP") return "EMERGENCY STOP (OPERATOR)";
    return "CLEAR";
  };

  const avgHazard =
    filtered.reduce((a, b) => a + b.hazard, 0) / filtered.length;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ fontFamily: "Arial", background: "#C8D8E4", minHeight: "100vh" }}>

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
        borderBottom: "1px solid rgba(0,0,0,0.1)"
      }}>
        <b>SANGUINE AI</b>

        <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
          <a href="#">PROFILE</a>
          <a href="#">DOCUMENTATION</a>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ padding: 20, paddingTop: 90 }}>

        {/* FILTER */}
        <div style={{ marginBottom: 20 }}>
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
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20
        }}>

          {/* LOGS TABLE */}
          <div style={{
            background: "white",
            padding: 15,
            borderRadius: 8
          }}>
            <h3>Logs</h3>
            <table width="100%" cellPadding="6" style={{ fontSize: 12 }}>
              <thead>
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
                  <tr key={i}>
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

          {/* VOLUME CHART (PURE HTML) */}
          <div style={{
            background: "white",
            padding: 15,
            borderRadius: 8
          }}>
            <h3>Volume</h3>

            <div style={{
              display: "flex",
              alignItems: "flex-end",
              height: 200,
              gap: 6,
              marginTop: 10
            }}>
              {volume.map((v, i) => (
                <div key={i} style={{
                  width: 20,
                  height: `${(v.count / maxVolume) * 180}px`,
                  background: "#2EC7FF"
                }} />
              ))}
            </div>
          </div>

          {/* POLICIES */}
          <div style={{
            gridColumn: "1 / span 2",
            background: "white",
            padding: 15,
            borderRadius: 8
          }}>
            <h3>Policies</h3>

            <pre style={{
              background: "#f4f4f4",
              padding: 10,
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
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
