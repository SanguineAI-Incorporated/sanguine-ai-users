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

/* ---------------- HIGH-FIDELITY SIMULATION ---------------- */

const sessions = (() => {
  const data = [];
  const now = Date.now();

  const points = 200; // fewer timestamps, more volume per timestamp

  let sessionId = null;
  let ttl = 0;

  const makeSessionId = () =>
    "sess_" + Math.random().toString(16).slice(2, 10);

  const rand = (min, max) =>
    Math.random() * (max - min) + min;

  for (let i = 0; i < points; i++) {
    const baseTime = new Date(
      now - (points - i) * 20 * 60 * 1000
    ).toISOString();

    if (ttl <= 0) {
      sessionId = makeSessionId();
      ttl = 15 + Math.floor(Math.random() * 30);
    }
    ttl--;

    // 🔥 10+ events per timestamp (realistic concurrency)
    const eventCount = 10 + Math.floor(Math.random() * 6);

    for (let j = 0; j < eventCount; j++) {
      const speaker_match_score = rand(0.65, 0.99);
      const presence_score = rand(0.6, 0.98);

      const synthetic_speech_risk = rand(0, 0.25);
      const replay_attack_risk = rand(0, 0.2);

      const identity_assurance_score =
        speaker_match_score * 0.5 +
        presence_score * 0.3 +
        (1 - synthetic_speech_risk) * 0.2;

      const session_integrity_score =
        1 - (synthetic_speech_risk + replay_attack_risk) / 2;

      const request_id =
        "req_" + Math.random().toString(16).slice(2, 10);

      data.push({
        timestamp: baseTime,
        session_id: sessionId,
        request_id,

        identity_assurance_score,
        session_integrity_score,
        synthetic_speech_risk,
        replay_attack_risk,

        request: {
          audio_chunk: "base64_audio_mock",
          agent_id: sessionId,
        },

        response: {
          status:
            identity_assurance_score > 0.9
              ? "ALLOW"
              : identity_assurance_score > 0.75
              ? "CHALLENGE"
              : "DENY",
        },
      });
    }
  }

  return data;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [hovered, setHovered] = useState(null);

  /* ---------------- AGGREGATED VOLUME ---------------- */

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

  /* ---------------- Sumo Logic–style log view ---------------- */

  const Inspector = ({ data }) => {
    if (!data) {
      return (
        <div className="text-sm text-gray-500">
          Hover over a point to inspect live authentication logs
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[420px] overflow-auto text-xs font-mono">

        {/* SUMMARY BAR */}
        <div className="p-2 bg-black text-white flex justify-between">
          <span>{data.time}</span>
          <span>events: {data.volume}</span>
        </div>

        {/* STREAM */}
        {data.samples.slice(0, 12).map((s, i) => (
          <div key={i} className="border p-2 bg-white">

            <div className="flex justify-between">
              <span className="text-gray-600">
                {s.request_id}
              </span>

              <span
                className={
                  s.identity_assurance_score > 0.9
                    ? "text-green-600"
                    : s.identity_assurance_score > 0.75
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {s.response.status}
              </span>
            </div>

            <div className="mt-1 text-gray-700">
              session: {s.session_id}
            </div>

            <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                identity:{" "}
                {s.identity_assurance_score.toFixed(2)}
              </div>
              <div>
                integrity:{" "}
                {s.session_integrity_score.toFixed(2)}
              </div>
              <div>
                spoof risk:{" "}
                {s.synthetic_speech_risk.toFixed(2)}
              </div>
              <div>
                replay risk:{" "}
                {s.replay_attack_risk.toFixed(2)}
              </div>
            </div>

            <div className="mt-2 text-[10px] text-gray-500">
              req: {JSON.stringify(s.request)} <br />
              res: {JSON.stringify(s.response)}
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

        {/* HEADER */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">
              Identity Telemetry Stream
            </h2>
            <p className="text-sm text-gray-600">
              High-volume continuous authentication logs (10–16 events per timestamp)
            </p>
          </CardContent>
        </Card>

        {/* GRAPH */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Authentication Volume Over Time
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

        {/* SUMO-STYLE INSPECTOR */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Live Authentication Log Stream
            </h2>

            <Inspector data={hovered} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
