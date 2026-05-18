import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

/* ---------------- MOCK LOGS ---------------- */

const mockLogs = (() => {
  const devices = ["robot-1", "robot-2", "robot-3"];
  const locations = ["zone-a", "zone-b", "zone-c"];

  const logs = [];
  const start = new Date("2025-04-27T08:00:00Z").getTime();
  const end = new Date("2026-04-29T18:00:00Z").getTime();

  for (let t = start; t <= end; t += 1000 * 60 * 5) {
    const date = new Date(t);

    if (Math.random() < 0.7) continue;

    const hazard = Math.random();

    logs.push({
      timestamp: date.toISOString(),
      data: {
        identity: {
          agent_id: devices[Math.floor(Math.random() * devices.length)],
          signature: "sig_" + Math.random().toString(16).slice(2),
        },
        location_id: locations[Math.floor(Math.random() * locations.length)],
        inference: {
          hazard_score: hazard,
        },
      },
    });
  }

  return logs;
})();

/* ---------------- HELPERS ---------------- */

const computeTrustScore = (log) => {
  const h = log?.data?.inference?.hazard_score ?? 0;
  return Math.max(0, Math.round((1 - h) * 100));
};

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [replayStep, setReplayStep] = useState(0);

  const [compareMode, setCompareMode] = useState(false);
  const [compareIndexA, setCompareIndexA] = useState(0);
  const [compareIndexB, setCompareIndexB] = useState(1);

  /* ---------------- EPISODE BUILDING ---------------- */

  const buildEpisodes = (logs) => {
    const episodes = [];
    let current = [];
    let lastAgent = null;

    logs.forEach((log) => {
      const agent = log?.data?.identity?.agent_id;

      if (lastAgent && agent !== lastAgent) {
        episodes.push(current);
        current = [];
      }

      current.push(log);
      lastAgent = agent;
    });

    if (current.length) episodes.push(current);

    return episodes;
  };

  const summarizeEpisode = (episode) => {
    const trusts = episode.map(computeTrustScore);
    const hazards = episode.map((l) => l?.data?.inference?.hazard_score ?? 0);

    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

    const avgTrust = avg(trusts);
    const avgHazard = avg(hazards);

    const volatility = avg(trusts.map((t) => Math.abs(t - avgTrust)));

    const label =
      avgTrust > 70
        ? "GOOD_EPISODE"
        : avgTrust > 50
        ? "MIXED_EPISODE"
        : "FAILURE_EPISODE";

    return {
      avgTrust,
      avgHazard,
      trustVolatility: volatility,
      label,
    };
  };

  /* ---------------- FAILURE BOUNDARY ---------------- */

  const detectFailureBoundary = (episode) => {
    for (let i = 1; i < episode.length; i++) {
      const prev = computeTrustScore(episode[i - 1]);
      const curr = computeTrustScore(episode[i]);

      const hazardPrev = episode[i - 1]?.data?.inference?.hazard_score ?? 0;
      const hazardCurr = episode[i]?.data?.inference?.hazard_score ?? 0;

      if (prev - curr > 15 || hazardCurr - hazardPrev > 0.25 || curr < 50) {
        return i;
      }
    }
    return null;
  };

  /* ---------------- DATASET ---------------- */

  const episodeDataset = useMemo(() => {
    const episodes = buildEpisodes(mockLogs);

    return episodes.map((ep) => ({
      episode_id: ep[0]?.data?.identity?.signature,
      trajectory: ep.map((l) => ({
        trust: computeTrustScore(l),
        hazard: l?.data?.inference?.hazard_score,
      })),
      raw: ep,
      metrics: summarizeEpisode(ep),
      failureBoundary: detectFailureBoundary(ep),
    }));
  }, []);

  const clusteredEpisodes = useMemo(() => {
    return episodeDataset.map((ep) => {
      const v = ep.metrics;

      const score =
        v.avgTrust +
        (100 - v.trustVolatility) -
        v.avgHazard * 50;

      let cluster = "FAILURE_PRONE";
      if (score > 120) cluster = "STABLE_HIGH_TRUST";
      else if (score > 90) cluster = "MODERATE_STABLE";
      else if (score > 60) cluster = "DRIFTING_UNSTABLE";

      return { ...ep, cluster, vector: v };
    });
  }, [episodeDataset]);

  /* ---------------- SELECTION ---------------- */

  const activeEpisode = clusteredEpisodes[selectedEpisodeIndex];

  const activeFrame =
    activeEpisode?.trajectory?.[replayStep] ?? null;

  /* ---------------- COMPARISON ---------------- */

  const episodeA = clusteredEpisodes[compareIndexA];
  const episodeB = clusteredEpisodes[compareIndexB];

  const divergence = episodeA && episodeB
    ? {
        trustGap: episodeA.vector.avgTrust - episodeB.vector.avgTrust,
        hazardGap: episodeA.vector.avgHazard - episodeB.vector.avgHazard,
      }
    : null;

  /* ---------------- EMBEDDING ---------------- */

  const embeddedEpisodes = useMemo(() => {
    return clusteredEpisodes.map((ep) => ({
      x: ep.vector.avgTrust,
      y: ep.vector.trustVolatility + ep.vector.avgHazard * 50,
      cluster: ep.cluster,
    }));
  }, [clusteredEpisodes]);

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Behavioral Intelligence Dashboard</h1>
        <p className="text-sm text-gray-600">
          Episode-based autonomous system dataset generation
        </p>
      </div>

      {/* REPLAY */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="font-bold mb-2">Episode Replay</h2>

          <select
            value={selectedEpisodeIndex}
            onChange={(e) => {
              setSelectedEpisodeIndex(Number(e.target.value));
              setReplayStep(0);
            }}
            className="border p-1 w-full mb-2"
          >
            {clusteredEpisodes.map((ep, i) => (
              <option key={i} value={i}>
                {ep.cluster} — {ep.metrics.avgTrust.toFixed(1)}
              </option>
            ))}
          </select>

          <input
            type="range"
            min="0"
            max={activeEpisode?.trajectory.length - 1 || 0}
            value={replayStep}
            onChange={(e) => setReplayStep(Number(e.target.value))}
            className="w-full"
          />

          <div className="mt-2 text-xs">
            Trust: {activeFrame?.trust} | Hazard: {activeFrame?.hazard}
          </div>

          {activeEpisode?.failureBoundary !== null && (
            <div className="text-red-600 text-xs mt-2">
              Failure boundary at step {activeEpisode.failureBoundary}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CLUSTERS */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="font-bold mb-2">Behavioral Clusters</h2>

          {["STABLE_HIGH_TRUST","MODERATE_STABLE","DRIFTING_UNSTABLE","FAILURE_PRONE"].map(c => (
            <div key={c} className="flex justify-between text-sm">
              <span>{c}</span>
              <span>
                {clusteredEpisodes.filter(e => e.cluster === c).length}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* COMPARISON */}
      <Card className="mb-4">
        <CardContent>
          <h2 className="font-bold mb-2">Episode Comparison</h2>

          <label>
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
            /> Enable
          </label>

          {compareMode && (
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <select value={compareIndexA} onChange={e=>setCompareIndexA(Number(e.target.value))}>
                {clusteredEpisodes.map((e,i)=><option key={i} value={i}>A {e.cluster}</option>)}
              </select>

              <select value={compareIndexB} onChange={e=>setCompareIndexB(Number(e.target.value))}>
                {clusteredEpisodes.map((e,i)=><option key={i} value={i}>B {e.cluster}</option>)}
              </select>

              {divergence && (
                <div className="col-span-2 mt-2">
                  Trust Gap: {divergence.trustGap.toFixed(2)} <br/>
                  Hazard Gap: {divergence.hazardGap.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EMBEDDING */}
      <Card>
        <CardContent>
          <h2 className="font-bold mb-2">Behavior Embedding Space</h2>

          <div className="relative h-64 bg-white border">
            {embeddedEpisodes.map((p,i)=>(
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-500"
                style={{
                  left: `${p.x}%`,
                  top: `${Math.min(100,p.y)}%`
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
