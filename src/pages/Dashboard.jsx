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

/* ---------------- MOCK DATA (Agent Attestation API Schema) ---------------- */

const mockLogs = (() => {
  const agents = ["agent-alpha", "agent-beta", "agent-gamma"];
  const locations = ["zone-a", "zone-b", "zone-c"];

  const logs = [];
  const start = new Date("2025-04-27T08:00:00Z").getTime();
  const end = new Date("2026-04-29T18:00:00Z").getTime();

  for (let t = start; t <= end; t += 1000 * 60 * 30) {
    const date = new Date(t);

    if (Math.random() < 0.75) continue;

    const hazard = Math.random();
    const occlusion = Math.random();
    const trajectoryRisk = Math.random();

    const agentId = agents[Math.floor(Math.random() * agents.length)];
    const signature = btoa(`${agentId}:${t}:${hazard}:${occlusion}`).slice(0, 24);

    logs.push({
      timestamp: date.toISOString(),
      data: {
        identity: {
          agent_id: agentId,
          signature,
        },

        sensors: {
          vision: {
            occlusion,
            confidence: 0.85 + Math.random() * 0.1,
          },
          audio: {
            speech_detected: Math.random() < 0.3,
            command_confidence: Math.random(),
          },
          trajectory: {
            risk_score: trajectoryRisk,
            velocity: Math.random() * 2,
            direction_change: Math.random(),
          },
        },

        environment: {
          location_id: locations[Math.floor(Math.random() * locations.length)],
          lighting_condition: Math.random() > 0.5 ? "normal" : "low_light",
        },

        inference: {
          hazard_score: hazard,
          model_confidence: 0.8 + Math.random() * 0.2,
        },

        policy: {
          triggered: hazard > 0.85 || occlusion > 0.9,
          mode: "real-time-attestation",
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
  const [queryMode, setQueryMode] = useState("all");

  const hashDeviceId = (id = "") => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return "dev_" + Math.abs(hash).toString(16);
  };

  /* ---------------- TRUST SCORE ---------------- */

  const computeTrustScore = (log) => {
    const hazard = log?.data?.inference?.hazard_score ?? 0;
    const occlusion = log?.data?.sensors?.vision?.occlusion ?? 0;
    const trajectory = log?.data?.sensors?.trajectory?.risk_score ?? 0;
    const confidence = log?.data?.inference?.model_confidence ?? 0;
    const triggered = log?.data?.policy?.triggered ?? false;

    let risk =
      hazard * 0.4 +
      occlusion * 0.25 +
      trajectory * 0.25 +
      (triggered ? 0.3 : 0);

    let trust = (1 - risk) * 100 + confidence * 10;
    trust = Math.max(0, Math.min(100, trust));

    return Math.round(trust);
  };

  /* ---------------- AGENT TRUST MAP ---------------- */

  const agentTrustMap = useMemo(() => {
    const map = new Map();

    mockLogs.forEach((log) => {
      const agentId = log?.data?.identity?.agent_id;
      const trust = computeTrustScore(log);

      if (!map.has(agentId)) {
        map.set(agentId, { total: 0, count: 0 });
      }

      const entry = map.get(agentId);
      entry.total += trust;
      entry.count += 1;
    });

    const result = {};
    map.forEach((value, key) => {
      result[key] = {
        avgTrust: Math.round(value.total / value.count),
        count: value.count,
      };
    });

    return result;
  }, []);

  /* ---------------- FILTERED LOGS ---------------- */

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
      logs = logs.filter((l) => computeTrustScore(l) < 60);
    }

    if (policyFilter === "clear") {
      logs = logs.filter((l) => computeTrustScore(l) >= 60);
    }

    return logs;
  }, [policyFilter, dateFilter]);

  /* ---------------- QUERY ENGINE (DATASET EXPLORER) ---------------- */

  const queriedLogs = useMemo(() => {
    let logs = filteredLogs;

    switch (queryMode) {
      case "high_risk":
        logs = logs.filter((l) => computeTrustScore(l) < 50);
        break;

      case "low_trust_agents":
        logs = logs.filter((l) => {
          const agent = l?.data?.identity?.agent_id;
          return (agentTrustMap[agent]?.avgTrust ?? 100) < 60;
        });
        break;

      case "anomalies":
        logs = logs.filter((l) => {
          const h = l?.data?.inference?.hazard_score ?? 0;
          const o = l?.data?.sensors?.vision?.occlusion ?? 0;
          return h > 0.85 && o > 0.85;
        });
        break;

      default:
        break;
    }

    return logs;
  }, [filteredLogs, queryMode, agentTrustMap]);

  /* ---------------- VOLUME ---------------- */

  const volumeData = useMemo(() => {
    const buckets = {};

    queriedLogs.forEach((log) => {
      const key = log.timestamp.slice(0, 13);
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets).map(([hour, count]) => ({
      hour,
      count,
    }));
  }, [queriedLogs]);

  /* ---------------- UI ---------------- */

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

          <select
            value={queryMode}
            onChange={(e) => setQueryMode(e.target.value)}
            className="border p-1"
          >
            <option value="all">All Data</option>
            <option value="high_risk">High Risk Events</option>
            <option value="low_trust_agents">Low Trust Agents</option>
            <option value="anomalies">Anomalies</option>
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
              <h2 className="text-xl mb-4">Behavioral Stream</h2>

              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-black/15 bg-white/40">
                      <th className="p-2">Time</th>
                      <th className="p-2">Agent</th>
                      <th className="p-2">Trust</th>
                      <th className="p-2">Policy</th>
                    </tr>
                  </thead>

                  <tbody>
                    {queriedLogs.map((log, i) => {
                      const trust = computeTrustScore(log);

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
                            <div className="flex flex-col">
                              <span>
                                {hashDeviceId(log.data.identity.agent_id)}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                trust:{" "}
                                {agentTrustMap[log.data.identity.agent_id]
                                  ?.avgTrust ?? "—"}
                              </span>
                            </div>
                          </td>

                          <td className="p-2">{trust}</td>

                          <td className="p-2 text-xs">
                            {trust < 60 ? "FLAGGED" : "CLEAR"}
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

                  <div>
                    <div className="font-bold">Identity</div>
                    <div className="text-xs text-gray-600">
                      agent: {hashDeviceId(selectedLog.data.identity.agent_id)}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">Trust Score</div>
                    <div className="text-xs text-gray-600">
                      event trust: {computeTrustScore(selectedLog)}
                    </div>
                    <div className="text-xs text-gray-600">
                      agent avg:{" "}
                      {agentTrustMap[
                        selectedLog.data.identity.agent_id
                      ]?.avgTrust ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">Environment</div>
                    <div className="text-xs text-gray-600">
                      location: {selectedLog.data.environment.location_id}
                    </div>
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
