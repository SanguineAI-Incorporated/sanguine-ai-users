import React from "react";

export default function Documentation() {
  const featureGroups = {
    core: [
      { name: "occlusion", desc: "Degree to which the entity is visually obstructed from sensors" },
      { name: "hazard", desc: "Aggregated risk signal derived from multi-modal inputs" },
      { name: "operator", desc: "Primary human or system agent controlling actions" },
      { name: "operator_verified", desc: "Indicates whether the operator identity has been verified" },
      { name: "operator_command_label", desc: "Classified command issued by the operator" },
    ],
    voice: [
      { name: "command_onehot", desc: "One-hot encoded representation of detected command" },
      { name: "command_confidence", desc: "Confidence score for command classification" },
      { name: "command_timestamp", desc: "Timestamp of detected command" },
    ],
    speaker: [
      { name: "speaker_verified", desc: "Indicates whether the speaker identity is verified" },
      { name: "speaker_confidence", desc: "Confidence score of speaker identification" },
      { name: "operator_id", desc: "Identifier linking speaker to known operator" },
    ],
    hazard: [
      { name: "hazard_flag", desc: "Binary indicator of hazard presence" },
      { name: "hazard_class", desc: "Categorization of hazard type" },
      { name: "hazard_confidence", desc: "Confidence score of hazard detection" },
    ],
    motion: [
      { name: "velocity_linear", desc: "Linear velocity of the entity" },
      { name: "velocity_angular", desc: "Angular velocity (rotation)" },
      { name: "is_moving", desc: "Boolean indicating whether the entity is in motion" },
      { name: "motion_state", desc: "Discrete motion state (idle, moving, accelerating, etc.)" },
    ],
    safety: [
      { name: "obstacle_distance", desc: "Distance to nearest detected obstacle" },
      { name: "collision_flag", desc: "Indicates whether a collision has occurred or is imminent" },
      { name: "emergency_stop", desc: "Trigger indicating emergency halt condition" },
    ],
    history: [
      { name: "last_action", desc: "Last executed action by the system or operator" },
    ],
  };

  const detailedFeatures = [
    ["entity_id", "Unique tracked object identifier"],
    ["operator_id", "Human operator identifier (optional)"],
    ["state", "Operational state (idle, moving, operating, anomaly)"],
    ["pose", "Spatial position and orientation"],
    ["velocity", "Motion vector of entity"],
    ["confidence_entity", "Confidence score for entity detection"],

    ["event_type", "High-level classification of event (collision, speech, anomaly)"],
    ["event_subtype", "More specific event classification"],
    ["timestamp_start", "Start time of event"],
    ["timestamp_end", "End time of event"],
    ["confidence_event", "Confidence score of detected event"],

    ["speech_detected", "Indicates presence of speech signal"],
    ["speaker_location", "Estimated origin location of speaker"],
    ["audio_event_type", "Classification of acoustic event"],

    ["hazard_score", "Estimated severity of risk"],
    ["hazard_confidence", "Confidence in hazard prediction"],
    ["occlusion_level", "Degree of visual obstruction"],

    ["agreement_score", "Cross-sensor consistency metric"],
    ["localization_consistency", "Agreement of spatial estimates across sensors"],

    ["predicted_entity_trajectory", "Predicted future path of entity"],
    ["predicted_scene_state", "Forecasted state of environment"],
    ["event_probabilities", "Likelihood distribution over possible events"],

    ["state_if_action_taken", "Simulated future state given an action"],
    ["risk_reduction_by_action", "Estimated reduction in risk from action"],
    ["action_value_estimates", "Utility score assigned to possible actions"],

    ["world_model_uncertainty", "Confidence level of world model predictions"],
    ["rollout_variance", "Variance across simulated future trajectories"],
    ["prediction_stability", "Temporal consistency of predictions"],

    ["cause_of_event", "Inferred causal source of event"],
    ["interaction_graph", "Graph representation of entity interactions"],

    ["predicted_human_intent", "Estimated future intent of human agents"],
    ["interaction_outcome_probability", "Probability of interaction success or failure"],

    ["hazard_trajectory", "Projected evolution of risk over time"],
    ["time_to_critical_risk", "Time until system reaches unsafe threshold"],

    ["future_sensor_agreement", "Predicted agreement between sensors"],
    ["predicted_modal_conflict", "Expected disagreement across modalities"],

    ["timestamp", "Global system timestamp"],
  ];

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-sm text-gray-600">
            Feature schema and system definitions
          </p>
        </div>

        {/* DETAILED FEATURES */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Feature Definitions</h2>
          <ul className="space-y-2 text-sm">
            {detailedFeatures.map(([name, desc]) => (
              <li key={name}>
                <strong>{name}</strong> — {desc}
              </li>
            ))}
          </ul>
        </div>

        {/* GROUPED FEATURES */}
        {Object.entries(featureGroups).map(([group, list]) => (
          <div
            key={group}
            className="bg-white/90 border border-black/10 rounded-lg p-5"
          >
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {group}
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
