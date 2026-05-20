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

/* ---------------- RAW SENSOR LOGS (mock) ---------------- */

const rawLogs = (() => {
  const logs = [];
  const start = Date.now() - 1000 * 60 * 60 * 6;

  for (let i = 0; i < 60; i++) {
    const occlusion = Math.random();
    const motion = Math.random();
    const command =
      Math.random() > 0.6
        ? ["MOVE", "STOP", "ASSIST"][Math.floor(Math.random() * 3)]
        : null;

    logs.push({
      timestamp: new Date(start + i * 60000).toISOString(),
      raw: {
        sensors: {
          vision: { occlusion },
          motion: { velocity: motion },
          audio: { command },
        },
      },
    });
  }

  return logs;
})();

/* ---------------- INFERENCE STACK ---------------- */

function infer(log) {
  const occlusion = log.raw.sensors.vision.occlusion;
  const motion = log.raw.sensors.motion.velocity;
  const command = log.raw.sensors.audio.command;

  const hazard_score = occlusion * 0.6 + (1 - motion) * 0.4;
  const trust_score = 1 - occlusion * 0.5;
  const stability_index = 1 - Math.abs(0.5 - motion);

  const task_success = command === "ASSIST" && hazard_score < 0.6;
  const safety_event = hazard_score > 0.75;

  return {
    derived_features: {
      hazard_score,
      trust_score,
      stability_index,
    },

    outcomes: {
      task_success,
      safety_event,
    },

    reward_proxies: {
      safety_reward: 1 - hazard_score,
      task_reward: task_success ? 1 : 0,
      comfort_reward: stability_index,
    },

    attestation: {
      verified: Math.random() > 0.2,
      signature: "sig_" + Math.random().toString(16).slice(2),
      hash: "hash_" + Math.random().toString(16).slice(2),
      public_key_id: "key_robotics_fleet_01",
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
      hazard: e.derived_features.hazard_score,
      trust: e.derived_features.trust_score,
    }));
  }, [episodes]);

  /* ---------------- EXPORT ---------------- */

  const exportJSONL = () => {
    const jsonl = episodes.map((e) => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonl], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "behavioral_dataset.jsonl";
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
              Behavioral Dataset Engine
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Raw sensor logs → structured behavioral records → probabilistic inference → training-ready episodes
            </p>

            <div className="mt-3 text-xs font-mono text-black/70">
              Signed behavioral datasets for robotics and multimodal agent platforms
            </div>
          </CardContent>
        </Card>

        {/* SIGNALS */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">System Signals</h2>

            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={volumeData}>
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hazard" stroke="#ff4d4d" />
                  <Line type="monotone" dataKey="trust" stroke="#2EC7FF" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* EPISODES */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Behavioral Episodes</h2>

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
                          e.outcomes.safety_event
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {e.outcomes.safety_event ? "RISK" : "SAFE"}
                      </span>

                      <span
                        className={
                          e.attestation.verified
                            ? "text-blue-600 text-xs"
                            : "text-yellow-600 text-xs"
                        }
                      >
                        {e.attestation.verified ? "VERIFIED" : "UNVERIFIED"}
                      </span>

                    </div>

                  </div>

                  <div className="text-xs text-gray-600">
                    hazard: {e.derived_features.hazard_score.toFixed(2)} | trust:{" "}
                    {e.derived_features.trust_score.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DETAIL PANEL */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Episode Detail</h2>

            {selected ? (
              <div className="text-sm space-y-4">

                <div>
                  <b>Derived Features</b>
                  <div>Hazard: {selected.derived_features.hazard_score.toFixed(2)}</div>
                  <div>Trust: {selected.derived_features.trust_score.toFixed(2)}</div>
                  <div>Stability: {selected.derived_features.stability_index.toFixed(2)}</div>
                </div>

                <div>
                  <b>Outcomes</b>
                  <div>Success: {String(selected.outcomes.task_success)}</div>
                  <div>Safety Event: {String(selected.outcomes.safety_event)}</div>
                </div>

                <div>
                  <b>Reward Proxies</b>
                  <div>Safety: {selected.reward_proxies.safety_reward.toFixed(2)}</div>
                  <div>Task: {selected.reward_proxies.task_reward.toFixed(2)}</div>
                  <div>Comfort: {selected.reward_proxies.comfort_reward.toFixed(2)}</div>
                </div>

                <div>
                  <b>Attestation</b>
                  <div>Verified: {String(selected.attestation.verified)}</div>
                  <div>Public Key: {selected.attestation.public_key_id}</div>
                  <div className="text-xs text-gray-600">
                    Signature: {selected.attestation.signature}
                  </div>
                  <div className="text-xs text-gray-600">
                    Hash: {selected.attestation.hash}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an episode</p>
            )}
          </CardContent>
        </Card>

        {/* EXPORT */}
        <Card>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl">Dataset Export</h2>
                <p className="text-sm text-gray-600">
                  Export signed behavioral episodes as JSONL for ML training
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
          
          <div className="mb-2 font-bold text-black">
            Episode JSON
          </div>
      
          <pre className="whitespace-pre-wrap text-black/80">
            {JSON.stringify(hovered, null, 2)}
          </pre>
      
        </div>
      )}

    </div>
  );
}
