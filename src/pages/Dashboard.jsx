import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

/* ---------------- MOCK ATTESTATION LOGS ---------------- */

const mockLogs = (() => {
  const agents = ["robot-alpha", "robot-beta", "robot-gamma"];
  const sessions = ["sess-1", "sess-2", "sess-3"];

  const logs = [];
  const start = new Date("2025-04-27T08:00:00Z").getTime();
  const end = new Date("2025-04-27T12:00:00Z").getTime();

  let seq = 0;

  for (let t = start; t <= end; t += 1000 * 30) {
    if (Math.random() < 0.6) continue;

    const agent = agents[Math.floor(Math.random() * agents.length)];
    const session = sessions[Math.floor(Math.random() * sessions.length)];

    const hazard = Math.random();
    const trust = Math.max(
      0,
      Math.min(100, (1 - hazard) * 100 + (Math.random() * 10 - 5))
    );

    logs.push({
      timestamp: new Date(t).toISOString(),
      data: {
        attestation: {
          agent_id: agent,
          session_id: session,
          sequence_id: seq++,
        },

        signals: {
          vision: { occlusion: Math.random() },
          motion: { velocity: Math.random() },
          audio: {
            operator_command_label:
              Math.random() > 0.7 ? (hazard > 0.7 ? "STOP" : "MOVE") : null,
          },
        },

        inference: {
          hazard_score: hazard,
          trust_score: trust,
        },

        provenance: {
          model_version: "mock-v1",
          signed: true,
        },
      },
    });
  }

  return logs;
})();

/* ---------------- HELPERS ---------------- */

const computeTrust = (log) =>
  log?.data?.inference?.trust_score ??
  Math.max(0, (1 - (log?.data?.inference?.hazard_score ?? 0)) * 100);

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [replayStep, setReplayStep] = useState(0);

  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState(0);
  const [compareB, setCompareB] = useState(1);

  /* ---------------- EPISODE BUILDER ---------------- */

  const buildEpisodes = (logs) => {
    const episodes = [];
    let current = [];
    let lastSession = null;

    logs.forEach((l) => {
      const session = l?.data?.attestation?.session_id;

      if (lastSession && session !== lastSession) {
        episodes.push(current);
        current = [];
      }

      current.push(l);
      lastSession = session;
    });

    if (current.length) episodes.push(current);

    return episodes;
  };

  /* ---------------- METRICS ---------------- */

  const summarize = (ep) => {
    const trust = ep.map(computeTrust);
    const hazard = ep.map((l) => l.data.inference.hazard_score);

    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

    return {
      avgTrust: avg(trust),
      avgHazard: avg(hazard),
      trustVolatility: avg(trust.map((t) => Math.abs(t - avg(trust)))),
    };
  };

  /* ---------------- FAILURE BOUNDARY ---------------- */

  const detectFailureBoundary = (ep) => {
    for (let i = 1; i < ep.length; i++) {
      const prev = computeTrust(ep[i - 1]);
      const curr = computeTrust(ep[i]);

      const hPrev = ep[i - 1].data.inference.hazard_score;
      const hCurr = ep[i].data.inference.hazard_score;

      if (prev - curr > 15 || hCurr - hPrev > 0.25 || curr < 50) {
        return i;
      }
    }
    return null;
  };

  /* ---------------- DATASET ---------------- */

  const episodeDataset = useMemo(() => {
    const episodes = buildEpisodes(mockLogs);

    return episodes.map((ep) => ({
      episode_id: ep[0]?.data?.attestation?.session_id,
      agent_id: ep[0]?.data?.attestation?.agent_id,
      trajectory: ep.map((l) => ({
        trust: computeTrust(l),
        hazard: l.data.inference.hazard_score,
      })),
      metrics: summarize(ep),
      failureBoundary: detectFailureBoundary(ep),
    }));
  }, []);

  const clusteredEpisodes = useMemo(() => {
    return episodeDataset.map((ep) => {
      const m = ep.metrics;

      const score =
        m.avgTrust +
        (100 - m.trustVolatility) -
        m.avgHazard * 50;

      let cluster = "FAILURE_PRONE";
      if (score > 120) cluster = "STABLE_HIGH_TRUST";
      else if (score > 90) cluster = "MODERATE_STABLE";
      else if (score > 60) cluster = "DRIFTING_UNSTABLE";

      return { ...ep, cluster };
    });
  }, [episodeDataset]);

  const activeEpisode = clusteredEpisodes[selectedEpisodeIndex];
  const activeFrame = activeEpisode?.trajectory?.[replayStep];

  const A = clusteredEpisodes[compareA];
  const B = clusteredEpisodes[compareB];

  const divergence =
    A && B
      ? {
          trustGap: A.metrics.avgTrust - B.metrics.avgTrust,
          hazardGap: A.metrics.avgHazard - B.metrics.avgHazard,
        }
      : null;

  const embedded = useMemo(() => {
    return clusteredEpisodes.map((ep) => ({
      x: ep.metrics.avgTrust,
      y: ep.metrics.trustVolatility + ep.metrics.avgHazard * 50,
      cluster: ep.cluster,
    }));
  }, [clusteredEpisodes]);

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">

      {/* ---------------- NAV ---------------- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Behavioral Dataset Engine (Mock)
        </h1>

        <div className="flex gap-6 text-[11px] uppercase tracking-wide">
          <Link to="/profile" className="hover:underline">
            Profile
          </Link>

          <Link to="/documentation" className="hover:underline">
            Documentation
          </Link>

          <Link to="/engine-editor" className="hover:underline">
            Engine Editor
          </Link>
        </div>
      </div>

      {/* ---------------- REPLAY ---------------- */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="font-bold mb-2">Episode Replay</h2>

          <select
            className="border p-1 w-full"
            value={selectedEpisodeIndex}
            onChange={(e) => {
              setSelectedEpisodeIndex(Number(e.target.value));
              setReplayStep(0);
            }}
          >
            {clusteredEpisodes.map((e, i) => (
              <option key={i} value={i}>
                {e.cluster} | trust {e.metrics.avgTrust.toFixed(1)}
              </option>
            ))}
          </select>

          <input
            type="range"
            className="w-full mt-2"
            min="0"
            max={activeEpisode?.trajectory.length - 1 || 0}
            value={replayStep}
            onChange={(e) => setReplayStep(Number(e.target.value))}
          />

          <div className="text-xs mt-2">
            Trust: {activeFrame?.trust} | Hazard: {activeFrame?.hazard}
          </div>

          {activeEpisode?.failureBoundary !== null && (
            <div className="text-red-600 text-xs mt-1">
              Failure at step {activeEpisode.failureBoundary}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- CLUSTERS ---------------- */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="font-bold">Clusters</h2>

          {[
            "STABLE_HIGH_TRUST",
            "MODERATE_STABLE",
            "DRIFTING_UNSTABLE",
            "FAILURE_PRONE",
          ].map((c) => (
            <div key={c} className="flex justify-between text-sm">
              <span>{c}</span>
              <span>{clusteredEpisodes.filter((e) => e.cluster === c).length}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---------------- COMPARISON ---------------- */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="font-bold">Comparison</h2>

          <label className="text-xs">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
            />{" "}
            Enable
          </label>

          {compareMode && (
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <select
                value={compareA}
                onChange={(e) => setCompareA(Number(e.target.value))}
              >
                {clusteredEpisodes.map((e, i) => (
                  <option key={i} value={i}>
                    A {e.cluster}
                  </option>
                ))}
              </select>

              <select
                value={compareB}
                onChange={(e) => setCompareB(Number(e.target.value))}
              >
                {clusteredEpisodes.map((e, i) => (
                  <option key={i} value={i}>
                    B {e.cluster}
                  </option>
                ))}
              </select>

              {divergence && (
                <div className="col-span-2 mt-2">
                  Trust Gap: {divergence.trustGap.toFixed(2)} <br />
                  Hazard Gap: {divergence.hazardGap.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- EMBEDDING ---------------- */}
      <Card>
        <CardContent>
          <h2 className="font-bold">Behavior Space</h2>

          <div className="relative h-64 bg-white border">
            {embedded.map((p, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${Math.min(100, p.y)}%`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
