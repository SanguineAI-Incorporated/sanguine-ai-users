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

/* ---------------- RAW LOGS (VOICE AGENT SIMULATION) ---------------- */

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

/* ---------------- INFERENCE: CONTINUOUS IDENTITY ASSURANCE ---------------- */

function infer(log) {
  const speaker_match_score = 0.75 + Math.random() * 0.25;
  const presence_score = 0.7 + Math.random() * 0.3;

  const synthetic_speech_risk = Math.random() * 0.2;
  const replay_attack_risk = Math.random() * 0.15;
  const voice_conversion_risk = Math.random() * 0.2;

  const identity_assurance_score =
    speaker_match_score * 0.5 +
    presence_score * 0.3 +
    (1 - synthetic_speech_risk) * 0.2;

  const session_integrity_score =
    1 -
    (synthetic_speech_risk +
      replay_attack_risk +
      voice_conversion_risk) /
      3;

  const autonomy_confidence =
    identity_assurance_score * session_integrity_score;

  const authorization_state =
    identity_assurance_score > 0.9
      ? "FULL"
      : identity_assurance_score > 0.75
      ? "LIMITED"
      : "CHALLENGE";

  return {
    identity: {
      user_id: "user_demo_001",
      session_id: "sess_" + Math.random().toString(16).slice(2),
      credential_status: "VERIFIED",
    },

    speaker_assurance: {
      speaker_match_score,
      speaker_continuity: 0.8 + Math.random() * 0.2,
      presence_score,
    },

    anti_spoofing: {
      synthetic_speech_risk,
      replay_attack_risk,
      voice_conversion_risk,
      audio_authenticity_score: 1 - synthetic_speech_risk,
    },

    continuous_assurance: {
      identity_assurance_score,
      session_integrity_score,
      autonomy_confidence,
    },

    authorization: {
      authorization_state,
      proof_of_control: true,
      action_approval: authorization_state !== "CHALLENGE",
    },

    attestation: {
      verified: true,
      signature: "sig_" + Math.random().toString(16).slice(2),
      hash: "hash_" + Math.random().toString(16).slice(2),
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
      ...infer(log),
    }));
  }, []);

  const volumeData = useMemo(() => {
    return episodes.map((e, i) => ({
      index: i,
      identity: e.continuous_assurance.identity_assurance_score,
      integrity: e.continuous_assurance.session_integrity_score,
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

        {/* KPI STRIP */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <div className="text-xs text-gray-500">Identity Assurance</div>
            <div className="text-3xl font-bold">94%</div>
          </CardContent></Card>

          <Card><CardContent className="p-5">
            <div className="text-xs text-gray-500">Presence Score</div>
            <div className="text-3xl font-bold">91%</div>
          </CardContent></Card>

          <Card><CardContent className="p-5">
            <div className="text-xs text-gray-500">Session Integrity</div>
            <div className="text-3xl font-bold">96%</div>
          </CardContent></Card>

          <Card><CardContent className="p-5">
            <div className="text-xs text-gray-500">Synthetic Speech Risk</div>
            <div className="text-3xl font-bold">3%</div>
          </CardContent></Card>
        </div>

        {/* SIGNALS CHART */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Continuous Assurance Signals</h2>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={volumeData}>
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="identity" stroke="#2EC7FF" />
                  <Line type="monotone" dataKey="integrity" stroke="#22c55e" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* EPISODES */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Identity Assurance Events</h2>

            <div className="space-y-2 max-h-96 overflow-auto">
              {episodes.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelected(e)}
                  onMouseEnter={() => setHovered(e)}
                  onMouseLeave={() => setHovered(null)}
                  className="p-3 border cursor-pointer hover:bg-white/50"
                >
                  <div className="flex justify-between text-sm">
                    <span>{e.id}</span>

                    <div className="flex gap-2 items-center">
                      <span
                        className={
                          e.authorization.authorization_state === "CHALLENGE"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {e.authorization.authorization_state}
                      </span>

                      <span className="text-blue-600 text-xs">
                        VERIFIED
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    identity:{" "}
                    {(e.continuous_assurance.identity_assurance_score * 100).toFixed(0)}%
                    {" | "}
                    integrity:{" "}
                    {(e.continuous_assurance.session_integrity_score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DETAIL */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Event Detail</h2>

            {selected ? (
              <div className="text-sm space-y-4">

                <div>
                  <b>Identity</b>
                  <div>User: {selected.identity.user_id}</div>
                  <div>Credential: {selected.identity.credential_status}</div>
                  <div>Session: {selected.identity.session_id}</div>
                </div>

                <div>
                  <b>Speaker Assurance</b>
                  <div>
                    Match: {(selected.speaker_assurance.speaker_match_score * 100).toFixed(0)}%
                  </div>
                  <div>
                    Presence: {(selected.speaker_assurance.presence_score * 100).toFixed(0)}%
                  </div>
                  <div>
                    Continuity: {(selected.speaker_assurance.speaker_continuity * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <b>Anti-Spoofing</b>
                  <div>Synthetic: {(selected.anti_spoofing.synthetic_speech_risk * 100).toFixed(1)}%</div>
                  <div>Replay: {(selected.anti_spoofing.replay_attack_risk * 100).toFixed(1)}%</div>
                  <div>Voice Conversion: {(selected.anti_spoofing.voice_conversion_risk * 100).toFixed(1)}%</div>
                </div>

                <div>
                  <b>Continuous Assurance</b>
                  <div>
                    Identity: {(selected.continuous_assurance.identity_assurance_score * 100).toFixed(0)}%
                  </div>
                  <div>
                    Integrity: {(selected.continuous_assurance.session_integrity_score * 100).toFixed(0)}%
                  </div>
                  <div>
                    Autonomy: {(selected.continuous_assurance.autonomy_confidence * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <b>Authorization</b>
                  <div>State: {selected.authorization.authorization_state}</div>
                  <div>Proof: {String(selected.authorization.proof_of_control)}</div>
                  <div>Approval: {String(selected.authorization.action_approval)}</div>
                </div>

              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an event</p>
            )}
          </CardContent>
        </Card>

        {/* EXPORT */}
        <Card>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl">Trust Event Export</h2>
                <p className="text-sm text-gray-600">
                  Export cryptographically signed identity assurance events as JSONL.
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

      {/* HOVER INSPECTOR */}
      {hovered && (
        <div className="fixed right-6 top-24 w-[420px] max-h-[70vh] overflow-auto bg-[#C8D8E4] text-black text-[10px] p-3 border border-black/10 shadow-xl z-50 rounded-lg backdrop-blur-xl">
          <div className="mb-2 font-bold">Event JSON</div>
          <pre className="whitespace-pre-wrap text-black/80">
            {JSON.stringify(hovered, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
