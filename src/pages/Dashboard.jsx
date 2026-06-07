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

/* ---------------- RAW LOGS ---------------- */

const rawLogs = (() => {
  const logs = [];
  const start = Date.now() - 1000 * 60 * 60 * 6;

  for (let i = 0; i < 60; i++) {
    logs.push({
      timestamp: new Date(start + i * 60000).toISOString(),
      raw: {
        audio: {
          duration: Math.floor(Math.random() * 30) + 5,
          speaker_active: Math.random() > 0.1,
        },
      },
    });
  }

  return logs;
})();

/* ---------------- INFERENCE ---------------- */

function infer() {
  const speaker_match_score = 0.75 + Math.random() * 0.25;
  const presence_score = 0.7 + Math.random() * 0.3;

  const synthetic_speech_risk = Math.random() * 0.2;
  const replay_attack_risk = Math.random() * 0.15;

  const identity_assurance_score =
    speaker_match_score * 0.5 +
    presence_score * 0.3 +
    (1 - synthetic_speech_risk) * 0.2;

  const session_integrity_score =
    1 - (synthetic_speech_risk + replay_attack_risk) / 2;

  return {
    identity: {
      user_id: "user_demo_001",
      session_id:
        "sess_" + Math.random().toString(16).slice(2),
      credential_status: "VERIFIED",
    },

    speaker_assurance: {
      speaker_match_score,
      presence_score,
      speaker_continuity: 0.8 + Math.random() * 0.2,
    },

    anti_spoofing: {
      synthetic_speech_risk,
      replay_attack_risk,
      audio_authenticity_score: 1 - synthetic_speech_risk,
    },

    continuous_assurance: {
      identity_assurance_score,
      session_integrity_score,
      autonomy_confidence:
        identity_assurance_score * session_integrity_score,
    },

    authorization: {
      authorization_state:
        identity_assurance_score > 0.9
          ? "FULL"
          : identity_assurance_score > 0.75
          ? "LIMITED"
          : "CHALLENGE",
      proof_of_control: true,
      action_approval: identity_assurance_score > 0.75,
    },

    attestation: {
      verified: true,
      signature:
        "sig_" + Math.random().toString(16).slice(2),
      hash:
        "hash_" + Math.random().toString(16).slice(2),
    },
  };
}

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const episodes = useMemo(() => {
    return rawLogs.map((log, i) => ({
      id: `ep-${i}`,
      timestamp: log.timestamp,
      raw: log.raw,
      ...infer(),
    }));
  }, []);

  /* ---------------- SESSION AGGREGATION ---------------- */

  const sessionData = useMemo(() => {
    const map = new Map();

    episodes.forEach((e) => {
      const sid = e.identity.session_id;

      if (!map.has(sid)) {
        map.set(sid, {
          session: sid,
          identity_sum: 0,
          integrity_sum: 0,
          min_identity: 1,
          risk_sum: 0,
          count: 0,
        });
      }

      const s = map.get(sid);

      const identity =
        e.continuous_assurance.identity_assurance_score;

      const integrity =
        e.continuous_assurance.session_integrity_score;

      const risk =
        e.anti_spoofing.synthetic_speech_risk;

      s.identity_sum += identity;
      s.integrity_sum += integrity;
      s.risk_sum += risk;
      s.count += 1;

      s.min_identity = Math.min(s.min_identity, identity);
    });

    return Array.from(map.values()).map((s, i) => ({
      session: `Session ${i + 1}`,
      identity: s.identity_sum / s.count,
      integrity: s.integrity_sum / s.count,
      min_identity: s.min_identity,
      synthetic_risk: s.risk_sum / s.count,
    }));
  }, [episodes]);

  const exportJSONL = () => {
    const jsonl = episodes.map((e) => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonl], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "identity_assurance_events.jsonl";
    a.click();

    URL.revokeObjectURL(url);
  };

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

      <div className="pt-24 p-6 max-w-7xl mx-auto space-y-6">

        {/* SYSTEM HEADER */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">
              Continuous Identity Assurance
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Cryptographic proof of control combined with passive voice-based presence verification.
            </p>

            <div className="mt-3 text-xs font-mono text-black/70">
              Identity → Presence → Trust → Authorization
            </div>
          </CardContent>
        </Card>

        {/* SESSION METRICS CHART */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Session-Level Identity Continuity
            </h2>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={sessionData}>
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="identity"
                    stroke="#2EC7FF"
                  />

                  <Line
                    type="monotone"
                    dataKey="integrity"
                    stroke="#22c55e"
                  />

                  <Line
                    type="monotone"
                    dataKey="min_identity"
                    stroke="#ef4444"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs text-gray-600 mt-2">
              Blue = average identity · Green = session integrity · Red = weakest identity point
            </div>
          </CardContent>
        </Card>

        {/* SESSION LIST */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Sessions</h2>

            <div className="space-y-2 max-h-96 overflow-auto">
              {sessionData.map((s, i) => (
                <div
                  key={i}
                  className="p-3 border hover:bg-white/50"
                >
                  <div className="flex justify-between text-sm">
                    <span>{s.session}</span>

                    <span className={
                      s.identity > 0.9
                        ? "text-green-600"
                        : s.identity > 0.75
                        ? "text-yellow-600"
                        : "text-red-600"
                    }>
                      {s.identity > 0.9
                        ? "FULL"
                        : s.identity > 0.75
                        ? "LIMITED"
                        : "CHALLENGE"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600">
                    identity {(s.identity * 100).toFixed(0)}% ·
                    integrity {(s.integrity * 100).toFixed(0)}% ·
                    min {(s.min_identity * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DETAIL PANEL */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Session Detail (Select for expansion)
            </h2>

            <p className="text-sm text-gray-500">
              Session-level drilldown can extend into per-event identity traces.
            </p>
          </CardContent>
        </Card>

        {/* EXPORT */}
        <Card>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl">Trust Event Export</h2>
                <p className="text-sm text-gray-600">
                  Export cryptographically signed identity assurance events.
                </p>
              </div>

              <button
                onClick={exportJSONL}
                className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
              >
                Export JSONL
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
