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

/* ---------------- MOCK RAW SENSOR LOGS ---------------- */

const rawLogs = (() => {
  const devices = ["robot-alpha", "robot-beta"];
  const locations = ["home-1", "home-2"];
  const commands = ["MOVE", "STOP", "ASSIST"];

  const logs = [];
  const start = new Date("2026-05-17T00:00:00Z").getTime();
  const end = new Date("2026-05-18T00:00:00Z").getTime();

  for (let t = start; t <= end; t += 1000 * 60 * 10) {
    const date = new Date(t);

    const occlusion = Math.random();
    const hazard = Math.random();
    const motion = Math.random();

    logs.push({
      timestamp: date.toISOString(),

      raw: {
        sensors: {
          vision: { occlusion },
          motion: { velocity: motion },
          audio: {
            command:
              Math.random() > 0.6
                ? commands[Math.floor(Math.random() * commands.length)]
                : null,
          },
        },
      },
    });
  }

  return logs;
})();

/* ---------------- INFERENCE LAYER ---------------- */

function infer(log) {
  const occlusion = log.raw.sensors.vision.occlusion;
  const motion = log.raw.sensors.motion.velocity;
  const command = log.raw.sensors.audio.command;

  const hazard = occlusion * 0.6 + (1 - motion) * 0.4;

  const stability = 1 - Math.abs(0.5 - motion);

  const trust = 1 - occlusion * 0.5;

  const taskSuccess = command === "ASSIST" && hazard < 0.6;

  return {
    derived_features: {
      hazard_score: hazard,
      stability_index: stability,
      trust_score: trust,
    },
    outcomes: {
      task_success: taskSuccess,
      safety_event: hazard > 0.75,
    },
    reward_proxies: {
      safety_reward: 1 - hazard,
      task_reward: taskSuccess ? 1 : 0,
      comfort_reward: stability,
    },
  };
}

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selected, setSelected] = useState(null);

  const episodes = useMemo(() => {
    return rawLogs.map((log, i) => {
      const inference = infer(log);

      return {
        id: `ep-${i}`,
        raw: log.raw,
        timestamp: log.timestamp,
        ...inference,
      };
    });
  }, []);

  const volumeData = useMemo(() => {
    return episodes.map((e, i) => ({
      index: i,
      hazard: e.derived_features.hazard_score,
      trust: e.derived_features.trust_score,
    }));
  }, [episodes]);

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

        {/* SYSTEM VIEW */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Behavioral Inference System</h2>
            <p className="text-sm text-gray-600">
              Raw sensor logs → structured behavioral records → probabilistic inference → training-ready episodes
            </p>
          </CardContent>
        </Card>

        {/* SIGNAL OVERVIEW */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">System Signals</h2>

            <div style={{ width: "100%", height: 250 }}>
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

        {/* EPISODE LIST */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">Behavioral Episodes</h2>

            <div className="space-y-2 max-h-96 overflow-auto">
              {episodes.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="p-3 border cursor-pointer hover:bg-white/50"
                >
                  <div className="flex justify-between text-sm">
                    <span>{e.id}</span>

                    <span
                      className={
                        e.outcomes.safety_event
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {e.outcomes.safety_event ? "RISK" : "SAFE"}
                    </span>
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
              <div className="text-sm space-y-3">

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

              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an episode</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
