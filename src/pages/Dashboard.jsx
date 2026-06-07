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

/* ---------------- 3-DAY SESSION SIMULATION ---------------- */

const sessions = (() => {
  const data = [];
  const now = Date.now();

  const points = 432;

  let sessionId = null;
  let ttl = 0;

  let sessionStart = null;

  const makeSessionId = () =>
    "sess_" + Math.random().toString(16).slice(2, 10);

  const pickTerminationReason = () => {
    const r = Math.random();
    if (r < 0.6) return "timeout";
    if (r < 0.85) return "re_auth";
    return "risk";
  };

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(
      now - (points - i) * 10 * 60 * 1000
    ).toISOString();

    if (ttl <= 0) {
      sessionId = makeSessionId();
      sessionStart = timestamp;
      ttl = 20 + Math.floor(Math.random() * 40);
    }

    ttl--;

    const isSessionEnd = ttl === 0;

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
      session_start: sessionStart,
      session_end: isSessionEnd ? timestamp : null,
      termination_reason: isSessionEnd ? pickTerminationReason() : null,

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
  const [selectedSession, setSelectedSession] = useState(null);

  /* ---------------- TIME SERIES ---------------- */

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

  const sessionMeta = useMemo(() => {
    const map = new Map();

    sessions.forEach((s) => {
      if (!map.has(s.session_id)) {
        map.set(s.session_id, {
          session_id: s.session_id,
          count: 0,
          identity_sum: 0,
          integrity_sum: 0,
          termination_reason: null,
        });
      }

      const m = map.get(s.session_id);

      m.count++;
      m.identity_sum += s.identity_assurance_score;
      m.integrity_sum += s.session_integrity_score;

      if (s.session_end) {
        m.termination_reason = s.termination_reason;
      }
    });

    return Array.from(map.values()).map((m) => ({
      session_id: m.session_id,
      avg_identity: m.identity_sum / m.count,
      avg_integrity: m.integrity_sum / m.count,
      termination_reason: m.termination_reason,
    }));
  }, []);

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

  const getOpacity = (id) => {
    if (!selectedSession) return 1;
    return selectedSession === id ? 1 : 0.12;
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

        {/* SESSION OVERLAY */}
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
                  {id.slice(0, 10)}...
                </button>
              ))}

              <button
                onClick={() => setSelectedSession(null)}
                className="px-3 py-1 text-xs border rounded bg-gray-100"
              >
                Clear
              </button>
            </div>
          </CardContent>
        </Card>

        {/* TIMELINE */}
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
                  <Tooltip />

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
              Blue = identity · Green = integrity · Red = spoof risk · faded = inactive sessions
            </div>
          </CardContent>
        </Card>

        {/* SESSION LIST */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Sessions</h2>

            <div className="space-y-2 max-h-96 overflow-auto">
              {sessionMeta.map((s) => (
                <div
                  key={s.session_id}
                  onClick={() =>
                    setSelectedSession(
                      selectedSession === s.session_id
                        ? null
                        : s.session_id
                    )
                  }
                  className="p-3 border cursor-pointer hover:bg-white/50"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-xs">
                      {s.session_id}
                    </span>

                    <span
                      className={
                        s.avg_identity > 0.9
                          ? "text-green-600"
                          : s.avg_identity > 0.75
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {s.avg_identity > 0.9
                        ? "FULL"
                        : s.avg_identity > 0.75
                        ? "LIMITED"
                        : "CHALLENGE"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600">
                    identity {(s.avg_identity * 100).toFixed(0)}% ·
                    integrity {(s.avg_integrity * 100).toFixed(0)}%
                  </div>

                  {s.termination_reason && (
                    <div className="text-[10px] mt-1 uppercase text-gray-500">
                      terminated: {s.termination_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
