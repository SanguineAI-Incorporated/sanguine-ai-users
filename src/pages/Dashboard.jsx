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

/* ---------------- FEATURE STREAM SIMULATION ---------------- */

const streams = (() => {
  const data = [];
  const now = Date.now();

  const points = 200;

  let streamId = null;
  let ttl = 0;

  const makeStreamId = () =>
    "stream_" + Math.random().toString(16).slice(2, 10);

  const rand = (a, b) => Math.random() * (b - a) + a;

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(
      now - (points - i) * 20 * 60 * 1000
    ).toISOString();

    if (ttl <= 0) {
      streamId = makeStreamId();
      ttl = 15 + Math.floor(Math.random() * 30);
    }
    ttl--;

    const embedding_quality = rand(0.6, 0.99);
    const acoustic_quality = rand(0.55, 0.98);
    const temporal_stability = rand(0.6, 0.99);

    const noise_level = rand(0, 0.3);
    const signal_variance = rand(0.05, 0.4);

    const feature_quality_index =
      (embedding_quality + acoustic_quality + temporal_stability) /
        3 -
      noise_level * 0.5;

    data.push({
      timestamp,
      stream_id: streamId,

      embedding_quality,
      acoustic_quality,
      temporal_stability,
      noise_level,
      signal_variance,
      feature_quality_index,
    });
  }

  return data;
})();

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [hovered, setHovered] = useState(null);

  /* ---------------- FEATURE EVENT RATE ---------------- */

  const chartData = useMemo(() => {
    const map = new Map();

    streams.forEach((s) => {
      const t = s.timestamp;

      if (!map.has(t)) {
        map.set(t, {
          time: t,
          feature_event_rate: 0,
          samples: [],
        });
      }

      const entry = map.get(t);
      entry.feature_event_rate += 1;
      entry.samples.push(s);
    });

    return Array.from(map.values());
  }, []);

  /* ---------------- FEATURE SAMPLE DEBUGGER ---------------- */

  const Inspector = ({ data }) => {
    if (!data) {
      return (
        <div className="text-sm text-gray-500">
          Hover over the timeline to inspect voice feature streams
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[420px] overflow-auto text-xs font-mono">

        {/* HEADER */}
        <div className="p-2 bg-black text-white flex justify-between">
          <span>{data.time}</span>
          <span>feature events: {data.feature_event_rate}</span>
        </div>

        {/* SAMPLES */}
        {data.samples.slice(0, 10).map((s, i) => (
          <div key={i} className="border p-2 bg-white">

            <div className="flex justify-between">
              <span className="text-gray-600">
                {s.stream_id}
              </span>

              <span className="text-blue-600">
                quality: {s.feature_quality_index.toFixed(2)}
              </span>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                embedding: {s.embedding_quality.toFixed(2)}
              </div>
              <div>
                acoustic: {s.acoustic_quality.toFixed(2)}
              </div>
              <div>
                temporal: {s.temporal_stability.toFixed(2)}
              </div>
              <div>
                noise: {s.noise_level.toFixed(2)}
              </div>
            </div>

            <div className="text-[10px] text-gray-500 mt-1">
              signal variance: {s.signal_variance.toFixed(2)}
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
        <div className="font-bold">VOICE AI LAB</div>

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
              Voice Feature Observability
            </h2>

            <p className="text-sm text-gray-600">
              Monitoring feature quality and data integrity for voice model training pipelines
            </p>
          </CardContent>
        </Card>

        {/* GRAPH */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Feature Event Rate Over Time
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
                    dataKey="feature_event_rate"
                    stroke="#2EC7FF"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* FEATURE INSPECTOR */}
        <Card>
          <CardContent>
            <h2 className="text-xl mb-4">
              Feature Sample Debugger
            </h2>

            <Inspector data={hovered} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
