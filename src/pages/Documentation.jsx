import React from "react";

export default function Documentation() {
  const featureGroups = {
    core_attestation: [
      {
        name: "identity.agent_id",
        desc: "Cryptographically linked autonomous agent identifier",
      },
      {
        name: "identity.signature",
        desc: "Signed attestation hash verifying event authenticity",
      },
      {
        name: "policy.triggered",
        desc: "Indicates whether safety or runtime policy was triggered",
      },
      {
        name: "policy.mode",
        desc: "Attestation generation mode (e.g., real-time, batch, offline)",
      },
    ],

    derived_features: [
      {
        name: "features.vision_embedding_quality",
        desc: "Derived visual feature confidence from encoded perception pipeline",
      },
      {
        name: "features.motion_dynamics",
        desc: "Encoded representation of spatial movement and trajectory stability",
      },
      {
        name: "features.audio_event_score",
        desc: "Derived acoustic activity signal from local audio feature extraction",
      },
    ],

    inference_layer: [
      {
        name: "inference.hazard_score",
        desc: "Multi-modal risk estimate derived from fused feature space",
      },
      {
        name: "inference.model_confidence",
        desc: "Confidence score of inference pipeline across modalities",
      },
    ],

    verification_layer: [
      {
        name: "attestation_status",
        desc: "Verification state of a behavioral record (VERIFIED, DEGRADED, INVALID)",
      },
      {
        name: "verification_reason",
        desc: "Explanation of why an attestation passed or failed validation checks",
      },
    ],

    trust_system: [
      {
        name: "trust_score",
        desc: "Aggregated reliability score computed from hazard, motion, and vision signals",
      },
      {
        name: "agent_trust_avg",
        desc: "Historical average trust score across all attestations for an agent",
      },
    ],

    drift_system: [
      {
        name: "drift_score",
        desc: "Magnitude of behavioral change in agent trust over time",
      },
      {
        name: "behavioral_shift",
        desc: "Indicator of deviation between historical and recent agent behavior",
      },
    ],

    environment: [
      {
        name: "environment.location_id",
        desc: "Spatial or operational zone identifier",
      },
      {
        name: "environment.lighting_condition",
        desc: "Contextual environmental condition affecting perception quality",
      },
    ],
  };

  const dataset_schema = [
    ["timestamp", "Time-aligned attestation event time"],
    ["agent_id", "Unique autonomous system identifier"],
    ["features", "Derived multimodal behavioral feature vector"],
    ["inference", "Fused model outputs (risk + confidence)"],
    ["trust_score", "Computed reliability score per event"],
    ["label", "Training-grade trust label for dataset export"],
  ];

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Agent Attestation Documentation</h1>
          <p className="text-sm text-gray-600">
            Privacy-preserving behavioral intelligence schema for autonomous systems
          </p>
        </div>

        {/* SYSTEM OVERVIEW */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5 text-sm">
          <p>
            The Agent Attestation system converts multimodal sensor inputs into
            structured, time-aligned behavioral metadata. Instead of storing raw
            perception data, the system exports derived features, inference outputs,
            and cryptographically signed attestations for verification, trust scoring,
            and downstream dataset generation.
          </p>
        </div>

        {/* DATASET SCHEMA */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Dataset Export Schema</h2>
          <ul className="space-y-2 text-sm">
            {dataset_schema.map(([name, desc]) => (
              <li key={name}>
                <strong>{name}</strong> — {desc}
              </li>
            ))}
          </ul>
        </div>

        {/* FEATURE GROUPS */}
        {Object.entries(featureGroups).map(([group, list]) => (
          <div
            key={group}
            className="bg-white/90 border border-black/10 rounded-lg p-5"
          >
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {group.replaceAll("_", " ")}
            </h2>

            <ul className="space-y-2 text-sm">
              {list.map((f) => (
                <li key={f.name}>
                  <strong>{f.name}</strong> — {f.desc}
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
    </div>
  );
}
