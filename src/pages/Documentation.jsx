import React from "react";

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Feature Set</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>occlusion</strong></li>
          <li><strong>hazard</strong></li>
          <li><strong>operator</strong></li>
          <li><strong>operator_verified</strong></li>
          <li><strong>operator_command_label</strong></li>
        </ul>
      </section>
    </div>
  );
}
