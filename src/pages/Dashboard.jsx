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

/* ---------------- SIMULATION ---------------- */

const sessions = (() => {
  const data = [];
  const now = Date.now();

  const points = 200;

  let sessionId = null;
  let ttl = 0;

  const makeSessionId = () =>
    "sess_" + Math.random().toString(16).slice(2, 10);

  const rand = (a, b) => Math.random() * (b - a) + a;

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(
      now - (points - i) * 20 * 60 * 1000
    ).toISOString();

    if (ttl <= 0) {
      sessionId = makeSessionId();
      ttl = 15 + Math.floor(Math.random() * 30);
    }
    ttl--;

    const speaker_match_score = rand(0.7, 0.99);
    const presence_score = rand(0.65, 0.98);

    const synthetic_speech_risk = rand(0, 0.25);
    const replay_attack_risk = rand(0, 0.2);

    const voice_identity_score =
      speaker_match_score * 0.6 + presence_score * 0.4;

    const cryptographic_control = rand(0, 1) > 0.08; // mostly verified

    const identity_confidence =
      voice_identity_score * 0.6 +
      (1 - synthetic_speech_risk) * 0.25 +
      (cryptographic_control ? 0.15 : 0);

    const presence_stability =
      1 - (synthetic_speech_risk + replay_attack_risk) / 2;

    data.push({
      timestamp,
      session_id: sessionId,

      voice_identity_score,
      cryptographic_control,
      identity_confidence,
      presence_stability,

      synthetic_speech_risk,
      replay_attack_risk,
    });
  }

  return data;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [hovered, setHovered] = useState(null);

  /* ---------------- TIME SERIES ---------------- */

  const chartData = useMemo(() => {
    const map = new Map();

    sessions.forEach((s) => {
      const t = s.timestamp;

      if (!map.has(t)) {
        map.set(t, {
          time: t,
          volume: 0,
          samples: [],
        });
      }

      const entry = map.get(t);
      entry.volume += 1;
      entry.samples.push(s);
    });

    return Array.from(map.values());
  }, []);

  /* ---------------- IDENTITY HEADER (KEY PRODUCT LAYER) ---------------- */

  const identityHeader = useMemo(() => {
    const all = sessions;

    const avg = (key) =>
      all.reduce((a, b) => a + (b[key] || 0), 0) / all.length;

    const identity = avg("identity_confidence");
    const voice = avg("voice_identity_score");
    const presence = avg("presence_stability");

    const cryptoVerified =
      all.filter((s) => s.cryptographic_control).length /
        all.length >
      0.9;

    const risk =
      all.reduce(
        (a, b) =>
          a + (b.synthetic_speech_risk + b.replay_attack_risk) / 2,
        0
      ) / all.length;

    const status =
      identity > 0.9 && cryptoVerified && risk < 0.2
        ? "AUTHORIZED"
        : identity > 0.75
        ? "CHALLENGE"
        : "BLOCKED";

    return {
      identity,
      voice,
      presence,
      cryptoVerified,
      risk,
      status,
    };
  }, []);

  /* ---------------- INSPECTOR ---------------- */

  const Inspector = ({ data }) => {
    if (!data) {
      return (
        <div className="text-sm text-gray-500">
          Hover over timeline to inspect identity verification stream
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[420px] overflow-auto text-xs font-mono">

        <div className="p-2 bg-black text-white flex justify-between">
          <span>{data.time}</span>
          <span>events: {data.volume}</span>
        </div>

        {data.samples.slice(0, 10).map((s, i) => (
          <div key={i} className="border p-2 bg-white">

            <div className="flex justify-between">
              <span className="text-gray-600">
                {s.session_id}
              </span>

              <span
                className={
                  s.identity_confidence > 0.9
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {s.cryptographic_control
                  ? "CRYPTO OK"
                  : "NO CRYPTO"}
              </span>
            </div>

            <div className="mt-1 text-xs">
              identity: {s.identity_confidence.toFixed(2)} · voice:{" "}
              {s.voice_identity_score.toFixed(2)} · presence:{" "}
              {s.presence_stability.toFixed(2)}
            </div>

            <div className="text-[10px] text-gray-500 mt-1">
              spoof risk:{" "}
              {s.synthetic_speech_risk.toFixed(2)} | replay risk:{" "}
              {s.replay_attack_risk.toFixed(2)}
            </div>

          </div>
        ))}
      </div>
    );
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

        {/* 🔴 IDENTITY DECISION HEADER (NEW CORE LAYER) */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">
              Identity Decision Layer
            </h2>

            <div className="grid grid-cols-5 gap-4 mt-3 text-xs">

              <div>
                Identity Confidence
                <div className="font-bold">
                  {(identityHeader.identity * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                Voice Match
                <div className="font-bold">
                  {(identityHeader.voice * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                Presence Stability
                <div className="font-bold">
                  {(identityHeader.presence * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                Crypto Control
                <div className="font-bold">
                  {identityHeader.cryptoVerified
                    ? "VERIFIED"
                    : "UNVERIFIED"}
                </div>
              </div>

              <div>
                Decision
                <div
                  className={`font-bold ${
                    identityHeader.status === "AUTHORIZED"
                      ? "text-green-600"
                      : identityHeader.status === "CHALLENGE"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {identityHeader.status}
                </div>
              </div>

            </div>

            <div className="text-xs text-gray-600 mt-3">
              Unified real-time identity verdict across voice biometrics + cryptographic proof + behavioral signals
            </div>
          </CardContent>
        </Card>

        {/* GRAPH */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Authentication Volume Stream
            </h2>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  onMouseMove={(state) => {
                    if (state?.activePayload?.[0]) {
                      setHovered(state.activePayload[0].payload);
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                >
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) =>
                      new Date(t).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#2EC7FF"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* INSPECTOR */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Identity Verification Stream
            </h2>

            <Inspector data={hovered} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
