import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------- MOCK DATA ---------------- */

const mockLogs = (() => {
  const devices = ["robot-1", "robot-2", "robot-3"];
  const locations = ["zone-a", "zone-b", "zone-c"];
  const commands = ["MOVE", "STOP"];

  const logs = [];
  const start = new Date("2025-04-27T08:00:00Z").getTime();
  const end = new Date("2026-04-29T18:00:00Z").getTime();

  for (let t = start; t <= end; t += 1000 * 60 * 5) {
    const date = new Date(t);
    const hour = date.getUTCHours();

    if (!(hour === 10 || hour === 14) && Math.random() < 0.7) continue;

    const hazard = Math.random();
    const hasCommand = Math.random() < 0.6;

    const command = hasCommand
      ? hazard > 0.75
        ? "STOP"
        : commands[Math.floor(Math.random() * commands.length)]
      : null;

    logs.push({
      timestamp: date.toISOString(),
      data: {
        device_id: devices[Math.floor(Math.random() * devices.length)],
        location_id: locations[Math.floor(Math.random() * locations.length)],
        vision: { occlusion: Math.random() },
        hazard_present: hazard,
        voice: {
          operator_command_label: command,
          command_confidence: hasCommand ? Math.random() : null,
          operator_verified: hasCommand ? Math.random() : null,
        },
      },
    });
  }

  return logs;
})();

/* ---------------- APP ---------------- */

export default function App() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [policyFilter, setPolicyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30d");

  const hashDeviceId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return "dev_" + Math.abs(hash).toString(16);
  };

  /* ---------------- POLICY LOGIC ---------------- */

  const checkPolicy = (log) => {
    const h = log.data.hazard_present;
    const cmd = log.data.voice.operator_command_label;
    const occlusion = log.data.vision.occlusion;

    if (h > 0.9 || occlusion > 0.9) {
      return {
        status: "EMERGENCY STOP",
        rule: "hazard > 0.9 OR occlusion > 0.9",
      };
    }

    if (h > 0.8 && cmd === "STOP") {
      return {
        status: "EMERGENCY STOP",
        rule: "hazard > 0.8 AND STOP command",
      };
    }

    return {
      status: "CLEAR",
      rule: "no policy violations",
    };
  };

  /* ---------------- FILTERING ---------------- */

  const filteredLogs = useMemo(() => {
    const now = Date.now();

    let cutoff = -Infinity;
    if (dateFilter === "3d") cutoff = now - 3 * 86400000;
    if (dateFilter === "30d") cutoff = now - 30 * 86400000;

    let logs = mockLogs.filter(
      (l) => new Date(l.timestamp).getTime() >= cutoff
    );

    if (policyFilter === "triggered") {
      logs = logs.filter((l) => checkPolicy(l).status !== "CLEAR");
    }

    if (policyFilter === "clear") {
      logs = logs.filter((l) => checkPolicy(l).status === "CLEAR");
    }

    return logs;
  }, [policyFilter, dateFilter]);

  /* ---------------- VOLUME ---------------- */

  const volumeData = useMemo(() => {
    const buckets = {};

    filteredLogs.forEach((log) => {
      const key = log.timestamp.slice(0, 13);
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([hour, count]) => ({ hour, count }));
  }, [filteredLogs]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#C8D8E4] text-black">

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-7 z-10 bg-white/60 backdrop-blur-xl border-b">
        <div className="font-bold">SANGUINE AI</div>

        <div className="flex gap-6 text-[11px] uppercase">
          <a href="/profile">PROFILE</a>
          <a href="/docs">DOCUMENTATION</a>
        </div>
      </div>

      <div className="pt-24 p-6 max-w-7xl mx-auto">

        {/* FILTERS */}
        <div className="flex gap-3 mb-4">
          <select
            value={policyFilter}
            onChange={(e) => setPolicyFilter(e.target.value)}
            className="border p-1"
          >
            <option value="all">All</option>
            <option value="triggered">Triggered</option>
            <option value="clear">Clear</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border p-1"
          >
            <option value="3d">Last 3 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LOGS */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl mb-4">Logs</h2>

              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Time</th>
                      <th className="p-2">Device</th>
                      <th className="p-2">Hazard</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.map((log, i) => {
                      const policy = checkPolicy(log);

                      return (
                        <tr
                          key={log.timestamp + i}
                          className="border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="p-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2">
                            {hashDeviceId(log.data.device_id)}
                          </td>
                          <td className="p-2">
                            {log.data.hazard_present.toFixed(2)}
                          </td>
                          <td className="p-2">
                            <span
                              className={
                                policy.status === "EMERGENCY STOP"
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600"
                              }
                            >
                              {policy.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* DETAILS */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl mb-4">Log Details</h2>

              {selectedLog ? (
                <div className="text-sm space-y-3">

                  <div>
                    <div className="font-bold">Metadata</div>
                    <div>Time: {selectedLog.timestamp}</div>
                    <div>Device: {hashDeviceId(selectedLog.data.device_id)}</div>
                    <div>Location: {selectedLog.data.location_id}</div>
                  </div>

                  <div>
                    <div className="font-bold">Vision</div>
                    <div>Occlusion: {selectedLog.data.vision.occlusion.toFixed(2)}</div>
                  </div>

                  <div>
                    <div className="font-bold">Voice</div>
                    <div>
                      Command: {selectedLog.data.voice.operator_command_label || "None"}
                    </div>
                  </div>

                  {/* ✅ ORIGINAL POLICY SECTION (VISIBLE + FIXED) */}
                  <div className="mt-6 border-t pt-4">
                    <div className="font-bold text-sm mb-2">
                      Policy Engine
                    </div>

                    <pre className="text-xs bg-white/60 p-2 rounded border overflow-x-auto">
{`function checkPolicy(log) {
  const h = log.hazard;
  const cmd = log.command;
  const occlusion = log.occlusion;

  if (h > 0.9 || occlusion > 0.9)
    return "EMERGENCY STOP";

  if (h > 0.8 && cmd === "STOP")
    return "EMERGENCY STOP";

  return "CLEAR";
}`}
                    </pre>

                    {selectedLog && (
                      <div className="mt-2 text-sm">
                        <div>
                          <b>Result:</b>{" "}
                          {checkPolicy(selectedLog).status}
                        </div>
                        <div>
                          <b>Rule:</b>{" "}
                          {checkPolicy(selectedLog).rule}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a log</p>
              )}
            </CardContent>
          </Card>

          {/* VOLUME */}
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="p-4">
              <h2 className="text-xl mb-4">Volume</h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={volumeData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2EC7FF" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
