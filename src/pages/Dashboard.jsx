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

/* ---------------- MOCK DATA (Privacy-Preserving Attestation System) ---------------- */

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
    const visionFeature = Math.random();
    const motionFeature = Math.random();

    const agentId = agents[Math.floor(Math.random() * agents.length)];
    const signature = btoa(`${agentId}:${t}:${hazard}:${visionFeature}`).slice(0, 24);

    logs.push({
      timestamp: date.toISOString(),

      data: {
        identity: {
          agent_id: agentId,
          signature,
        },

        features: {
          vision_embedding_quality: visionFeature,
          motion_dynamics: motionFeature,
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
          triggered: hazard > 0.85,
          mode: "attestation-only",
        },
      },
    });
  }

  return logs;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selectedLog, setSelectedLog] = useState(null);
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
    const vision = log?.data?.features?.vision_embedding_quality ?? 0;
    const motion = log?.data?.features?.motion_dynamics ?? 0;
    const confidence = log?.data?.inference?.model_confidence ?? 0;
    const triggered = log?.data?.policy?.triggered ?? false;

    let risk =
      hazard * 0.4 +
      vision * 0.25 +
      motion * 0.25 +
      (triggered ? 0.3 : 0);

    let trust = (1 - risk) * 100 + confidence * 10;
    return Math.max(0, Math.min(100, Math.round(trust)));
  };

  /* ---------------- VERIFICATION LAYER (A) ---------------- */

  const verifyAttestation = (log) => {
    const valid =
      log?.data?.identity?.agent_id &&
      log?.data?.identity?.signature &&
      log?.data?.features &&
      log?.data?.inference;

    const hazard = log?.data?.inference?.hazard_score ?? 0;
    const vision = log?.data?.features?.vision_embedding_quality ?? 0;
    const motion = log?.data?.features?.motion_dynamics ?? 0;

    if (!valid) {
      return { status: "INVALID", reason: "missing fields" };
    }

    if (hazard > 0.95 || vision > 0.95 || motion > 0.95) {
      return { status: "DEGRADED", reason: "outlier feature values" };
    }

    return { status: "VERIFIED", reason: "consistent attestation" };
  };

  /* ---------------- DRIFT DETECTION (B) ---------------- */

  const computeDriftScore = (agentId) => {
    const logs = mockLogs.filter(
      (l) => l?.data?.identity?.agent_id === agentId
    );

    if (logs.length < 5) return 0;

    const score = (arr) =>
      arr.reduce((s, l) => s + computeTrustScore(l), 0) / arr.length;

    const recent = score(logs.slice(-5));
    const early = score(logs.slice(0, 5));

    return Math.round(Math.abs(recent - early));
  };

  /* ---------------- FILTERING ---------------- */

  const filteredLogs = useMemo(() => {
    let logs = mockLogs;

    switch (queryMode) {
      case "high_risk":
        logs = logs.filter((l) => computeTrustScore(l) < 50);
        break;

      case "low_trust_agents":
        logs = logs.filter((l) => {
          const agent = l.data.identity.agent_id;
          return computeDriftScore(agent) > 10;
        });
        break;

      case "anomalies":
        logs = logs.filter((l) => {
          const h = l.data.inference.hazard_score;
          const v = l.data.features.vision_embedding_quality;
          return h > 0.85 && v > 0.85;
        });
        break;

      default:
        break;
    }

    return logs;
  }, [queryMode]);

  /* ---------------- DATASET EXPORT (D) ---------------- */

  const exportDatasetSlice = (logs) => {
    return logs
      .filter((l) => computeTrustScore(l) > 70)
      .filter((l) => verifyAttestation(l).status === "VERIFIED")
      .map((l) => ({
        agent_id: l.data.identity.agent_id,
        timestamp: l.timestamp,
        features: l.data.features,
        inference: l.data.inference,
        label: computeTrustScore(l),
      }));
  };

  const queriedLogs = filteredLogs;

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

        {/* QUERY */}
        <div className="flex gap-3 mb-4">
          <select
            value={queryMode}
            onChange={(e) => setQueryMode(e.target.value)}
            className="border p-1"
          >
            <option value="all">All</option>
            <option value="high_risk">High Risk</option>
            <option value="low_trust_agents">Drifting Agents</option>
            <option value="anomalies">Anomalies</option>
          </select>
        </div>

        {/* SYSTEM PANEL */}
        <div className="mb-4 text-xs space-y-1">
          <div className="font-bold">System Intelligence Layer</div>
          <div>Exportable dataset: {exportDatasetSlice(queriedLogs).length}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* VOLUME */}
          <Card className="col-span-1 md:col-span-2 border border-black/15 bg-white/85">
            <CardContent>
              <h2 className="text-xl mb-4">Behavioral Stream Volume</h2>

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

          {/* STREAM */}
          <Card className="border border-black/15 bg-white/90">
            <CardContent>
              <h2 className="text-xl mb-4">Behavior Stream</h2>

              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
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
                          key={i}
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-white/40 cursor-pointer"
                        >
                          <td className="p-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>

                          <td className="p-2">
                            {hashDeviceId(log.data.identity.agent_id)}
                          </td>

                          <td className="p-2">{trust}</td>

                          <td className="p-2 text-xs">
                            {trust > 60 ? "CLEAR" : "FLAGGED"}
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
                <div className="text-sm space-y-3">

                  <div>
                    <div className="font-bold">Verification</div>
                    <div className="text-xs">
                      {verifyAttestation(selectedLog).status} —{" "}
                      {verifyAttestation(selectedLog).reason}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">Drift</div>
                    <div className="text-xs">
                      {computeDriftScore(
                        selectedLog.data.identity.agent_id
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">Trust</div>
                    <div className="text-xs">
                      event: {computeTrustScore(selectedLog)}
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
