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
            <li><strong>occlusion</strong> — Visual obstruction detection layer</li>
            <li><strong>hazard</strong> — Risk signal classification system</li>
            <li><strong>operator</strong> — Primary execution entity</li>
            <li><strong>operator_verified</strong> — Validated operator status flag</li>
            <li><strong>operator_command_label</strong> — Command classification output layer</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
