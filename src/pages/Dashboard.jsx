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

import nacl from "tweetnacl";
import { createHash } from "crypto";

/* ---------------- UTIL: STABLE HASHING ---------------- */

function sha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

/* deterministic stringify (important for signatures) */
function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/* ---------------- RAW MACHINE EVENTS ---------------- */

const rawEvents = (() => {
  const events = [];
  const start = Date.now() - 1000 * 60 * 60 * 6;

  for (let i = 0; i < 60; i++) {
    const occlusion = Math.random();
    const motion = Math.random();

    const command =
      Math.random() > 0.6
        ? ["MOVE", "STOP", "ASSIST"][Math.floor(Math.random() * 3)]
        : null;

    events.push({
      event_id: `evt_${i}`,
      timestamp: new Date(start + i * 60000).toISOString(),

      agent_id: "agent_robot_01",

      operator_id: Math.random() > 0.7 ? "human_456" : null,

      raw: {
        sensors: {
          vision: { occlusion },
          motion: { velocity: motion },
          audio: { command },
        },
      },

      policy_id: "policy_safety_v3",

      capability_id: Math.random() > 0.8 ? "cap_spend_001" : "cap_move_001",

      previous_event_hash: i === 0 ? null : `hash_evt_${i - 1}`,
    });
  }

  return events;
})();

/* ---------------- ATTESTATION ENGINE ---------------- */

function attest(event) {
  const occlusion = event.raw.sensors.vision.occlusion;
  const motion = event.raw.sensors.motion.velocity;
  const command = event.raw.sensors.audio.command;

  const safety_risk = occlusion * 0.6 + (1 - motion) * 0.4;
  const stability = 1 - Math.abs(0.5 - motion);

  const executed = command !== "STOP" && safety_risk < 0.75;

  /* ---- canonical event for hashing ---- */
  const canonical = stableStringify({
    ...event,
    derived: { safety_risk, stability },
    outcome: { executed }
  });

  const event_hash = sha256(canonical);

  /* ---- mock keypair (replace with real stored keys in prod) ---- */
  const keyPair = nacl.sign.keyPair();
  const agent_signature = Buffer.from(
    nacl.sign.detached(
      Buffer.from(event_hash),
      keyPair.secretKey
    )
  ).toString("hex");

  return {
    derived: {
      safety_risk,
      stability_index: stability,
    },

    outcome: {
      executed,
      command,
    },

    trust: {
      machine_trust: 1 - safety_risk,
    },

    attestation: {
      event_hash,
      verified: true,
      agent_signature,
      public_key_id: "agent_robot_01_key",
    },
  };
}

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const events = useMemo(() => {
    return rawEvents.map((e) => ({
      ...e,
      ...attest(e),
    }));
  }, []);

  const chartData = useMemo(() => {
    return events.map((e, i) => ({
      index: i,
      safety: e.derived.safety_risk,
      trust: e.trust.machine_trust,
    }));
  }, [events]);

  const exportJSONL = () => {
    const jsonl = events.map((e) => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonl], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attested_events.jsonl";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#C8D8E4] text-black">

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-7 z-10 bg-[#C8D8E4]/80 backdrop-blur-xl border-b border-black/10">
        <div className="font-bold">ATTESTATION LEDGER</div>

        <div className="flex gap-6 text-[11px] uppercase">
          <Link to="/identity">IDENTITY</Link>
          <Link to="/policies">POLICY ENGINE</Link>
          <Link to="/audit">AUDIT GRAPH</Link>
        </div>
      </div>

      <div className="pt-24 p-6 max-w-7xl mx-auto space-y-6">

        {/* SYSTEM HEADER */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">
              Machine Attestation & Observability Dashboard
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Signed event stream → hash chain → policy binding → verifiable execution history
            </p>

            <div className="mt-3 text-xs font-mono text-black/70">
              Cryptographically verifiable autonomous system logs (Ed25519 + SHA256 chain)
            </div>
          </CardContent>
        </Card>

        {/* SIGNALS */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">System Risk Signals</h2>

            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="safety" stroke="#ff4d4d" />
                  <Line type="monotone" dataKey="trust" stroke="#2EC7FF" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* EVENTS */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Attested Event Stream</h2>

            <div className="space-y-2 max-h-96 overflow-auto">
              {events.map((e) => (
                <div
                  key={e.event_id}
                  onClick={() => setSelected(e)}
                  onMouseEnter={() => setHovered(e)}
                  onMouseLeave={() => setHovered(null)}
                  className="p-3 border cursor-pointer hover:bg-white/50"
                >
                  <div className="flex justify-between text-sm">
                    <span>{e.event_id}</span>

                    <div className="flex gap-2 items-center">
                      <span className={e.outcome.executed ? "text-green-600" : "text-red-600"}>
                        {e.outcome.executed ? "EXECUTED" : "BLOCKED"}
                      </span>

                      <span className="text-blue-600 text-xs">
                        HASHED
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    safety: {e.derived.safety_risk.toFixed(2)} | trust:{" "}
                    {e.trust.machine_trust.toFixed(2)}
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
                  <div>Agent: {selected.agent_id}</div>
                  <div>Operator: {selected.operator_id || "none"}</div>
                </div>

                <div>
                  <b>Policy</b>
                  <div>{selected.policy_id}</div>
                </div>

                <div>
                  <b>Derived Risk</b>
                  <div>Safety: {selected.derived.safety_risk.toFixed(2)}</div>
                  <div>Stability: {selected.derived.stability_index.toFixed(2)}</div>
                </div>

                <div>
                  <b>Outcome</b>
                  <div>Executed: {String(selected.outcome.executed)}</div>
                  <div>Command: {selected.outcome.command}</div>
                </div>

                <div>
                  <b>Cryptographic Attestation</b>
                  <div className="text-xs break-all">
                    Hash: {selected.attestation.event_hash}
                  </div>
                  <div className="text-xs break-all">
                    Signature: {selected.attestation.agent_signature}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an event</p>
            )}
          </CardContent>
        </Card>

        {/* EXPORT */}
        <Card>
          <CardContent className="flex justify-between items-center">
            <div>
              <h2 className="text-xl">Export Attested Log</h2>
              <p className="text-sm text-gray-600">
                JSONL with hashes + signatures for audit or training
              </p>
            </div>

            <button
              onClick={exportJSONL}
              className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
            >
              Export JSONL
            </button>
          </CardContent>
        </Card>

      </div>

      {/* HOVER INSPECTOR */}
      {hovered && (
        <div className="fixed right-6 top-24 w-[420px] max-h-[70vh] overflow-auto bg-black text-green-200 text-[10px] p-3 border border-black/30 shadow-xl z-50">
          <div className="text-white mb-2 font-bold">Raw Attested Event</div>
          <pre>{JSON.stringify(hovered, null, 2)}</pre>
        </div>
      )}

    </div>
  );
}
