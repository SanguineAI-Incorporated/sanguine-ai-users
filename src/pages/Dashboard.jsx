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

      agent_identity: {
        agent_id: "agent_robot_01",
        version: "1.4.2",
        public_key_id: "fleet_key_01",
      },

      operator_identity: {
        operator_id: Math.random() > 0.7 ? "human_456" : null,
      },

      raw: {
        sensors: {
          vision: { occlusion },
          motion: { velocity: motion },
          audio: { command },
        },
      },

      policy_snapshot: {
        policy_id: "safety_v3",
        decision: Math.random() > 0.1 ? "allow" : "deny",
      },

      capability_scope: {
        can_move: true,
        can_stop: true,
        can_spend: Math.random() > 0.8,
      },
    });
  }

  return events;
})();

/* ---------------- ATTESTATION ENGINE ---------------- */

function attest(event) {
  const occlusion = event.raw.sensors.vision.occlusion;
  const motion = event.raw.sensors.motion.velocity;
  const command = event.raw.sensors.audio.command;

  // safety + compliance separation (important upgrade)
  const safety_risk = occlusion * 0.6 + (1 - motion) * 0.4;
  const compliance_risk =
    event.policy_snapshot.decision === "deny" ? 1 : 0;

  const stability = 1 - Math.abs(0.5 - motion);

  const executed = event.policy_snapshot.decision !== "deny";

  return {
    derived: {
      safety_risk,
      compliance_risk,
      stability_index: stability,
    },

    outcome: {
      executed,
      command,
      stopped: command === "STOP",
    },

    trust: {
      machine_trust: 1 - safety_risk,
      policy_trust: executed ? 1 : 0,
    },

    attestation: {
      verified: true,
      signature: "sig_" + event.event_id,
      hash: "hash_" + event.timestamp,
      chain_id: "chain_fleet_01",
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
      compliance: e.derived.compliance_risk,
    }));
  }, [events]);

  const exportJSONL = () => {
    const jsonl = events.map((e) => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonl], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attested_machine_events.jsonl";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#C8D8E4] text-black">

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-7 z-10 bg-[#C8D8E4]/80 backdrop-blur-xl border-b border-black/10">
        <div className="font-bold">ATTESTATION SYSTEM</div>

        <div className="flex gap-6 text-[11px] uppercase">
          <Link to="/profile">IDENTITY</Link>
          <Link to="/policies">POLICIES</Link>
          <Link to="/audit">AUDIT LOG</Link>
        </div>
      </div>

      <div className="pt-24 p-6 max-w-7xl mx-auto space-y-6">

        {/* SYSTEM HEADER */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">
              Agent Attestation & Observability Layer
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Signed machine events → policy evaluation → execution trace → audit graph
            </p>

            <div className="mt-3 text-xs font-mono text-black/70">
              Cryptographically verifiable telemetry for autonomous systems
            </div>
          </CardContent>
        </Card>

        {/* SIGNALS */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Risk & Trust Signals</h2>

            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="safety" stroke="#ff4d4d" />
                  <Line type="monotone" dataKey="trust" stroke="#2EC7FF" />
                  <Line type="monotone" dataKey="compliance" stroke="#8B5CF6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* EVENTS */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Attested Machine Events</h2>

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

                      <span className={e.attestation.verified ? "text-blue-600 text-xs" : "text-yellow-600 text-xs"}>
                        {e.attestation.verified ? "ATTESTED" : "UNVERIFIED"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    safety: {e.derived.safety_risk.toFixed(2)} | trust:{" "}
                    {e.trust.machine_trust.toFixed(2)} | compliance:{" "}
                    {e.derived.compliance_risk.toFixed(2)}
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
                  <div>Agent: {selected.agent_identity.agent_id}</div>
                  <div>Operator: {selected.operator_identity.operator_id || "none"}</div>
                </div>

                <div>
                  <b>Policy</b>
                  <div>Decision: {selected.policy_snapshot.decision}</div>
                </div>

                <div>
                  <b>Derived Risk</b>
                  <div>Safety: {selected.derived.safety_risk.toFixed(2)}</div>
                  <div>Compliance: {selected.derived.compliance_risk.toFixed(2)}</div>
                </div>

                <div>
                  <b>Outcome</b>
                  <div>Executed: {String(selected.outcome.executed)}</div>
                  <div>Command: {selected.outcome.command}</div>
                </div>

                <div>
                  <b>Attestation</b>
                  <div>Verified: {String(selected.attestation.verified)}</div>
                  <div>Chain: {selected.attestation.chain_id}</div>
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
              <h2 className="text-xl">Export Attestation Log</h2>
              <p className="text-sm text-gray-600">
                JSONL of signed machine events for audit + ML
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
          <div className="text-white mb-2 font-bold">Raw Event</div>
          <pre>{JSON.stringify(hovered, null, 2)}</pre>
        </div>
      )}

    </div>
  );
}
