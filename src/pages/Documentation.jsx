import React from "react";

export default function Documentation() {
  const featureGroups = {
    identity_layer: [
      {
        name: "identity.user_id",
        desc: "Cryptographically anchored user identifier",
      },
      {
        name: "identity.session_id",
        desc: "Unique session identifier linking trust events over time",
      },
      {
        name: "identity.signature",
        desc: "Signed proof-of-control generated from a trusted credential",
      },
      {
        name: "identity.credential_status",
        desc: "Verification status of the associated passkey or device credential",
      },
    ],

    speaker_assurance: [
      {
        name: "speaker_match_score",
        desc: "Similarity score between the active speaker and enrolled voice profile",
      },
      {
        name: "speaker_continuity",
        desc: "Confidence that the same speaker remains present throughout the session",
      },
      {
        name: "presence_score",
        desc: "Estimated confidence that the authenticated user is actively participating",
      },
    ],

    anti_spoofing: [
      {
        name: "synthetic_speech_risk",
        desc: "Likelihood that speech was generated or modified by AI systems",
      },
      {
        name: "replay_attack_risk",
        desc: "Likelihood that recorded audio is being replayed",
      },
      {
        name: "voice_conversion_risk",
        desc: "Likelihood of real-time voice transformation or impersonation",
      },
      {
        name: "audio_authenticity_score",
        desc: "Overall confidence that speech originated from a live human source",
      },
    ],

    trust_engine: [
      {
        name: "identity_assurance_score",
        desc: "Composite confidence score across biometric and cryptographic signals",
      },
      {
        name: "session_integrity_score",
        desc: "Confidence that session ownership has not changed over time",
      },
      {
        name: "agent_trust_score",
        desc: "Overall trust level used by autonomous agents for decision making",
      },
    ],

    authorization: [
      {
        name: "authorization_state",
        desc: "Current permission level available to the autonomous agent",
      },
      {
        name: "action_approval",
        desc: "Verification status for sensitive actions requiring user approval",
      },
      {
        name: "proof_of_control",
        desc: "Cryptographic confirmation that the credential holder authorized an action",
      },
    ],

    drift_detection: [
      {
        name: "behavioral_shift",
        desc: "Deviation from historical interaction patterns",
      },
      {
        name: "trust_drift_score",
        desc: "Longitudinal change in trust signals across sessions",
      },
      {
        name: "speaker_profile_drift",
        desc: "Observed evolution of speaker characteristics over time",
      },
    ],
  };

  const datasetSchema = [
    ["timestamp", "Time-aligned trust event timestamp"],
    ["user_id", "Cryptographically anchored identity"],
    ["session_id", "Continuous assurance session identifier"],
    ["speaker_match_score", "Voice identity similarity score"],
    ["presence_score", "Estimated user presence confidence"],
    ["synthetic_speech_risk", "AI-generated speech likelihood"],
    ["replay_attack_risk", "Recorded audio replay likelihood"],
    ["identity_assurance_score", "Composite trust score"],
    ["authorization_state", "Current agent permission level"],
    ["proof_of_control", "Cryptographic authorization status"],
  ];

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">
            Continuous Identity Assurance
          </h1>

          <p className="text-sm text-gray-700 mt-1">
            For Autonomous Voice Agents
          </p>

          <p className="text-sm text-gray-600 mt-3 max-w-3xl">
            Cryptographic proof of control combined with passive
            voice-based presence verification.
          </p>
        </div>

        {/* OVERVIEW */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5 text-sm">
          <p>
            Traditional authentication verifies identity once and assumes
            trust indefinitely. Autonomous voice agents require continuous
            assurance that the authorized user remains present and in
            control of the session.
          </p>

          <p className="mt-3">
            Our platform combines cryptographic credentials, passive
            speaker verification, anti-spoofing analysis, and session
            integrity monitoring to continuously evaluate whether an
            agent should continue acting on behalf of a user.
          </p>
        </div>

        {/* ARCHITECTURE */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">
            Assurance Architecture
          </h2>

          <div className="text-sm space-y-2 font-mono">
            <div>Identity</div>
            <div>↓</div>
            <div>Presence</div>
            <div>↓</div>
            <div>Trust</div>
            <div>↓</div>
            <div>Authorization</div>
          </div>
        </div>

        {/* DATASET SCHEMA */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">
            Dataset Export Schema
          </h2>

          <ul className="space-y-2 text-sm">
            {datasetSchema.map(([name, desc]) => (
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
              {list.map((feature) => (
                <li key={feature.name}>
                  <strong>{feature.name}</strong> — {feature.desc}
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
    </div>
  );
}
