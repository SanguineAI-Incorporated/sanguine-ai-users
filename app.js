function App() {
  const { useState, useMemo } = React;

  const mockLogs = (() => {
    const devices = ["robot-1", "robot-2", "robot-3"];
    const locations = ["zone-a", "zone-b", "zone-c"];
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
        commandConfidence,
      });
    }

    return logs;
  })();

  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "triggered") {
      return mockLogs.filter((l) => l.hazard > 0.8);
    }
    return mockLogs;
  }, [filter]);

  const avgHazard =
    filtered.reduce((a, b) => a + b.hazard, 0) / filtered.length;

  return (
    <div style={{ fontFamily: "Arial", padding: 20, background: "#C8D8E4", minHeight: "100vh" }}>

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
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.1)"
      }}>
        <div><b>SANGUINE AI</b></div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="#">PROFILE</a>
          <a href="#">DOCUMENTATION</a>
        </div>
      </div>

      <div style={{ marginTop: 80 }}>

        {/* FILTER */}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Logs</option>
          <option value="triggered">Triggered Only</option>
        </select>

        {/* METRIC */}
        <h3>Average Hazard: {avgHazard.toFixed(2)}</h3>

        {/* TABLE */}
        <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%" }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Device</th>
              <th>Hazard</th>
              <th>Command</th>
              <th>Confidence</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((log, i) => (
              <tr key={i}>
                <td>{log.timestamp}</td>
                <td>{log.device}</td>
                <td>{log.hazard.toFixed(2)}</td>
                <td>{log.command || "—"}</td>
                <td>
                  {log.commandConfidence ? log.commandConfidence.toFixed(2) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
