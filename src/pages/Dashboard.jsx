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

  const points = 432;

  let sessionId = null;
  let ttl = 0;

  const makeSessionId = () =>
    "sess_" + Math.random().toString(16).slice(2, 10);

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(
      now - (points - i) * 10 * 60 * 1000
    ).toISOString();

    if (ttl <= 0) {
      sessionId = makeSessionId();
      ttl = 20 + Math.floor(Math.random() * 40);
    }
    ttl--;

    const speaker_match_score = 0.7 + Math.random() * 0.3;
    const presence_score = 0.65 + Math.random() * 0.35;

    const synthetic_speech_risk = Math.random() * 0.2;
    const replay_attack_risk = Math.random() * 0.15;

    const identity_assurance_score =
      speaker_match_score * 0.5 +
      presence_score * 0.3 +
      (1 - synthetic_speech_risk) * 0.2;

    const session_integrity_score =
      1 - (synthetic_speech_risk + replay_attack_risk) / 2;

    data.push({
      timestamp,
      session_id: sessionId,

      identity_assurance_score,
      session_integrity_score,
      synthetic_speech_risk,
      replay_attack_risk,
    });
  }

  return data;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  /* ---------------- AGGREGATE: SESSION VOLUME OVER TIME ---------------- */

  const chartData = useMemo(() => {
    const map = new Map();

    sessions.forEach((s) => {
      const t = s.timestamp;

      if (!map.has(t)) {
        map.set(t, {
          time: t,
          volume: 0,
          sessions: new Set(),
          sample: null,
        });
      }

      const entry = map.get(t);
      entry.volume += 1;
      entry.sessions.add(s.session_id);
      entry.sample = s;
    });

    return Array.from(map.values()).map((d) => ({
      time: d.time,
      volume: d.volume,
      session_id: Array.from(d.sessions)[0],
      sample: d.sample,
    }));
  }, []);

  /* ---------------- MOCK REQUEST/RESPONSE ---------------- */

  const buildRequest = (sample) => ({
    agent_id: sample?.session_id,
    input: {
      audio_stream: "base64:mock_audio_chunk",
      timestamp: sample?.timestamp,
    },
    context: {
      speaker_match_score: sample?.identity_assurance_score,
      presence_score: sample?.session_integrity_score,
    },
  });

  const buildResponse = (sample) => ({
    identity_assurance_score: sample?.identity_assurance_score,
    session_integrity_score: sample?.session_integrity_score,
    anti_spoofing: {
      synthetic_speech_risk: sample?.synthetic_speech_risk,
      replay_attack_risk: sample?.replay_attack_risk,
    },
    authorization: {
      status:
        sample?.identity_assurance_score > 0.9
          ? "FULL"
          : "LIMITED",
    },
  });

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
              Continuous Identity Telemetry
            </h2>
            <p className="text-sm text-gray-600">
              Session activity volume + forensic identity inspection layer
            </p>
          </CardContent>
        </Card>

        {/* GRAPH */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Session Volume (3-Day Timeline)
            </h2>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  onMouseMove={(state) => {
                    if (state?.activePayload?.[0]) {
                      setHoveredPoint(
                        state.activePayload[0].payload
                      );
                    }
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
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

        {/* REQUEST / RESPONSE INSPECTOR */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Live Session Inspector
            </h2>

            {hoveredPoint ? (
              <div className="grid grid-cols-2 gap-4 text-xs">

                <div>
                  <b>Request JSON</b>
                  <pre className="mt-2 bg-white p-2 border overflow-auto">
                    {JSON.stringify(
                      buildRequest(hoveredPoint.sample),
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div>
                  <b>Response JSON</b>
                  <pre className="mt-2 bg-white p-2 border overflow-auto">
                    {JSON.stringify(
                      buildResponse(hoveredPoint.sample),
                      null,
                      2
                    )}
                  </pre>
                </div>

              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Hover over the timeline to inspect session telemetry
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
