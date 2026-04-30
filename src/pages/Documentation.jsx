import React from "react";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-sm text-gray-600">
            System feature definitions and operational model overview
          </p>
        </div>

        {/* FEATURE SET CARD */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Feature Set</h2>

          <ul className="space-y-2 text-sm">

            {/* Core Identity + State */}
            <li><strong>entity_id</strong> — Unique tracked object identifier</li>
            <li><strong>operator_id</strong> — Human operator identifier (optional)</li>
            <li><strong>state</strong> — Operational state (idle, moving, operating, anomaly)</li>
            <li><strong>pose</strong> — Spatial position and orientation</li>
            <li><strong>velocity</strong> — Motion vector of entity</li>
            <li><strong>confidence_entity</strong> — Entity detection confidence score</li>

            {/* Events */}
            <li><strong>event_type</strong> — Collision, drop, speech, machine anomaly</li>
            <li><strong>event_subtype</strong> — Event-specific refinement label</li>
            <li><strong>timestamp_start</strong> — Event start time</li>
            <li><strong>timestamp_end</strong> — Event end time</li>
            <li><strong>confidence_event</strong> — Event detection confidence</li>

            {/* Audio Layer */}
            <li><strong>speech_detected</strong> — Speech activity detection signal</li>
            <li><strong>speaker_location</strong> — Estimated spatial origin of speech</li>
            <li><strong>audio_event_type</strong> — Classified acoustic event type</li>

            {/* Safety Layer */}
            <li><strong>hazard_score</strong> — Risk severity estimate</li>
            <li><strong>hazard_confidence</strong> — Confidence in hazard prediction</li>
            <li><strong>occlusion_level</strong> — Degree of visual obstruction</li>

            {/* Cross-Modal Consistency */}
            <li><strong>agreement_score</strong> — Cross-sensor consistency metric</li>
            <li><strong>localization_consistency</strong> — Agreement of spatial estimates</li>

            {/* World Model (NEW) */}
            <li><strong>predicted_entity_trajectory</strong> — Future motion prediction of entities</li>
            <li><strong>predicted_scene_state</strong> — Forecasted environment state</li>
            <li><strong>event_probabilities</strong> — Likelihood of future events</li>

            <li><strong>state_if_action_taken</strong> — Counterfactual world state simulation</li>
            <li><strong>risk_reduction_by_action</strong> — Safety impact of potential actions</li>
            <li><strong>action_value_estimates</strong> — Utility scores for candidate actions</li>

            <li><strong>world_model_uncertainty</strong> — Model confidence in predictions</li>
            <li><strong>rollout_variance</strong> — Stability of simulated futures</li>
            <li><strong>prediction_stability</strong> — Temporal consistency of predictions</li>

            <li><strong>cause_of_event</strong> — Inferred causal attribution</li>
            <li><strong>interaction_graph</strong> — Entity interaction structure</li>

            <li><strong>predicted_human_intent</strong> — Forecasted human behavioral intent</li>
            <li><strong>interaction_outcome_probability</strong> — Likelihood of interaction success/failure</li>

            <li><strong>hazard_trajectory</strong> — Risk evolution over time</li>
            <li><strong>time_to_critical_risk</strong> — Time until unsafe threshold</li>

            <li><strong>future_sensor_agreement</strong> — Predicted cross-modal consistency</li>
            <li><strong>predicted_modal_conflict</strong> — Expected sensor disagreement</li>

            {/* System */}
            <li><strong>timestamp</strong> — System-wide event timestamp</li>

          </ul>
        </div>

      </div>
    </div>
  );
}
