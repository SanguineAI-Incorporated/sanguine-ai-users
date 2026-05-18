import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
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

    logs.push({
      timestamp: date.toISOString(),
      data: {
        device_id: devices[Math.floor(Math.random() * devices.length)],
        location_id: locations[Math.floor(Math.random() * locations.length)],
        vision: { occlusion: Math.random() },
        hazard_present: hazard,
        voice: {
          operator_command_label: hasCommand
            ? hazard > 0.75
              ? "STOP"
              : commands[Math.floor(Math.random() * commands.length)]
            : null,
        },
      },
    });
  }

  return logs;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [policyFilter, setPolicyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("24h");

  const hashDeviceId = (id = "") => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return "dev_" + Math.abs(hash).toString(16);
  };

  const checkPolicy = (log) => {
    const h = log?.data?.hazard_present ?? 0;
    const cmd = log?.data?.voice?.operator_command_label;
    const occlusion = log?.data?.vision?.occlusion ?? 0;

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
      rule: "no violations detected",
    };
  };

  const filteredLogs = useMemo(() => {
    const now = Date.now();

    let cutoff = -Infinity;
    if (dateFilter === "1h") cutoff = now - 3600000;
    if (dateFilter === "24h") cutoff = now - 86400000;
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

  const volumeData = useMemo(() => {
    const buckets = {};

    filteredLogs.forEach((log) => {
      const key = log.timestamp.slice(0, 13);
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets).map(([hour, count]) => ({
      hour,
      count,
    }));
  }, [filteredLogs]);

  return (
    <div className="min-h-screen bg-[#C8D8E4] text-black">

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-7 z-10 bg-[#C8D8E4]/80 backdrop-blur-xl border-b border-black/10">
        <div className="font-bold">SANGUINE AI</div>

        <div className="flex gap-6 text-[11px] uppercase">
          <Link to="/profile">PROFILE</Link>
          <Link to="/documentation">DOCUMENTATION</Link>
          <Link to="/engine-editor">ENGINE EDITOR</Link>
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
            <option value="1h">1 hour</option>
            <option value="24h">24 hours</option>
            <option value="3d">3 days</option>
            <option value="30d">30 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* VOLUME */}
          <Card className="col-span-1 md:col-span-2 border border-black/15 bg-white/85">
            <CardContent>
              <h2 className="text-xl mb-4">Volume</h2>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={volumeData}>
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2EC7FF" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* LOGS */}
          <Card className="border border-black/15 bg-white/90">
            <CardContent>
              <h2 className="text-xl mb-4">Logs</h2>

              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-black/15 bg-white/40">
                      <th className="p-2">Time</th>
                      <th className="p-2">Device</th>
                      <th className="p-2">Hazard</th>
                      <th className="p-2">Policy</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.map((log, i) => {
                      const policy = checkPolicy(log);

                      return (
                        <tr
                          key={log.timestamp + i}
                          onClick={() => setSelectedLog(log)}
                          className="border-b border-black/5 cursor-pointer hover:bg-white/40"
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
                          <td className="p-2 text-xs">
                            {policy.status}
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
<Card className="border border-black/15 bg-white/90">
  <CardContent>
    <h2 className="text-xl mb-4">Agent Attestation</h2>

    {selectedLog ? (
      <div className="text-sm space-y-4">

        {/* Identity + Signature Layer */}
        <div>
          <div className="font-bold">Cryptographic Identity</div>
          <div className="text-xs text-gray-600">
            agent_id: {hashDeviceId(selectedLog.data.device_id)}
          </div>
          <div className="text-xs text-gray-600">
            signature: sha256(attestation:{selectedLog.timestamp})
          </div>
        </div>

        {/* Behavioral Summary */}
        <div>
          <div className="font-bold">Behavioral Attestation</div>
          <div>status: {checkPolicy(selectedLog).status}</div>
          <div className="text-xs text-gray-600">
            rule: {checkPolicy(selectedLog).rule}
          </div>
          <div className="text-xs text-gray-600">
            hazard_score: {selectedLog.data.hazard_present.toFixed(3)}
          </div>
        </div>

        {/* Environmental Context */}
        <div>
          <div className="font-bold">Environmental Context</div>
          <div className="text-xs text-gray-600">
            location: {selectedLog.data.location_id}
          </div>
          <div className="text-xs text-gray-600">
            vision.occlusion: {selectedLog.data.vision.occlusion.toFixed(3)}
          </div>
        </div>

        {/* System Constraints */}
        <div>
          <div className="font-bold">System Constraints</div>
          <div className="text-xs text-gray-600">
            inference_mode: real-time-stream
          </div>
          <div className="text-xs text-gray-600">
            model_stack: CNN + Trajectory Encoder + Temporal Transformer
          </div>
        </div>

        {/* API Output */}
        <div>
          <div className="font-bold">API Output</div>
          <pre className="text-xs bg-black/5 p-2 rounded overflow-auto">
{JSON.stringify(
  {
    agent_id: hashDeviceId(selectedLog.data.device_id),
    timestamp: selectedLog.timestamp,
    hazard_score: selectedLog.data.hazard_present,
    occlusion: selectedLog.data.vision.occlusion,
    policy: checkPolicy(selectedLog).status,
    attestation_type: "signed_behavioral_metadata",
  },
  null,
  2
)}
          </pre>
        </div>

      </div>
    ) : (
      <p className="text-sm text-gray-500">Select a log</p>
    )}
  </CardContent>
</Card>

        </div>
      </div>
    </div>
  );
}
