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

/* ---------------- 3-DAY CONTINUOUS SIMULATION ---------------- */

const sessions = (() => {
  const data = [];
  const now = Date.now();

  const points = 432; // 3 days @ 10-min resolution

  let sessionCounter = 0;
  let sessionTTL = 0;

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(
      now - (points - i) * 10 * 60 * 1000
    ).toISOString();

    // session boundaries
    if (sessionTTL <= 0) {
      sessionCounter++;
      sessionTTL = 20 + Math.floor(Math.random() * 40);
    }
    sessionTTL--;

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

    const autonomy_confidence =
      identity_assurance_score * session_integrity_score;

    data.push({
      timestamp,
      session_id: `session_${sessionCounter}`,

      identity_assurance_score,
      session_integrity_score,
      autonomy_confidence,

      synthetic_speech_risk,
      replay_attack_risk,
    });
  }

  return data;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selectedSession, setSelectedSession] = useState(null);

  /* ---------------- CHART DATA ---------------- */

  const chartData = useMemo(() => {
    return sessions.map((d) => ({
      time: d.timestamp,
      session_id: d.session_id,
      identity: d.identity_assurance_score,
      integrity: d.session_integrity_score,
      risk: d.synthetic_speech_risk,
    }));
  }, []);

  /* ---------------- SESSION GROUPING ---------------- */

  const sessionsMap = useMemo(() => {
    const map = new Map();

    chartData.forEach((d) => {
      if (!map.has(d.session_id)) {
        map.set(d.session_id, []);
      }
      map.get(d.session_id).push(d);
    });

    return Array.from(map.entries());
  }, [chartData]);

  const getOpacity = (sessionId) => {
    if (!selectedSession) return 1;
    return sessionId === selectedSession ? 1 : 0.12;
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

        {/* HEADER CARD */}
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

        {/* SESSION OVERLAY SELECTOR */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-3">Session Overlay Mode</h2>

            <div className="flex flex-wrap gap-2">
              {[...new Set(sessions.map((s) => s.session_id))].map((id) => (
                <button
                  key={id}
                  onClick={() =>
                    setSelectedSession(
                      selectedSession === id ? null : id
                    )
                  }
                  className={`px-3 py-1 text-xs border rounded ${
                    selectedSession === id
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  {id}
                </button>
              ))}

              <button
                onClick={() => setSelectedSession(null)}
                className="px-3 py-1 text-xs border rounded bg-gray-100"
              >
                Clear
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Click a session to isolate its identity trajectory across 3 days
            </p>
          </CardContent>
        </Card>

        {/* TIMELINE CHART */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              3-Day Identity Continuity Timeline
            </h2>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart>
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
                  <Tooltip
                    labelFormatter={(t) =>
                      new Date(t).toLocaleString()
                    }
                  />

                  {sessionsMap.map(([sessionId, points]) => {
                    const opacity = getOpacity(sessionId);

                    return (
                      <React.Fragment key={sessionId}>
                        <Line
                          data={points}
                          type="monotone"
                          dataKey="identity"
                          stroke="#2EC7FF"
                          strokeOpacity={opacity}
                          dot={false}
                        />

                        <Line
                          data={points}
                          type="monotone"
                          dataKey="integrity"
                          stroke="#22c55e"
                          strokeOpacity={opacity}
                          dot={false}
                        />

                        <Line
                          data={points}
                          type="monotone"
                          dataKey="risk"
                          stroke="#ef4444"
                          strokeOpacity={opacity}
                          dot={false}
                        />
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs text-gray-600 mt-2">
              Blue = identity assurance · Green = session integrity · Red = spoofing risk · faded = inactive sessions
            </div>
          </CardContent>
        </Card>

        {/* SESSION LIST */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Sessions</h2>

            <div className="space-y-2 max-h-96 overflow-auto">
              {[...new Set(sessions.map((s) => s.session_id))].map((id) => {
                const subset = sessions.filter((s) => s.session_id === id);

                const avgIdentity =
                  subset.reduce((a, b) => a + b.identity_assurance_score, 0) /
                  subset.length;

                const avgIntegrity =
                  subset.reduce((a, b) => a + b.session_integrity_score, 0) /
                  subset.length;

                return (
                  <div
                    key={id}
                    onClick={() =>
                      setSelectedSession(
                        selectedSession === id ? null : id
                      )
                    }
                    className="p-3 border cursor-pointer hover:bg-white/50"
                  >
                    <div className="flex justify-between text-sm">
                      <span>{id}</span>

                      <span
                        className={
                          avgIdentity > 0.9
                            ? "text-green-600"
                            : avgIdentity > 0.75
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {avgIdentity > 0.9
                          ? "FULL"
                          : avgIdentity > 0.75
                          ? "LIMITED"
                          : "CHALLENGE"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      identity {(avgIdentity * 100).toFixed(0)}% ·
                      integrity {(avgIntegrity * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
