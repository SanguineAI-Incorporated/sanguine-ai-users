import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function EngineEditor() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Emergency Stop",
      condition: "hazard > 0.9 || occlusion > 0.9",
      enabled: true,
    },
    {
      id: 2,
      name: "Stop Command Override",
      condition: "hazard > 0.8 && command === 'STOP'",
      enabled: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-[#C8D8E4] text-black p-6 pt-24">
      
      <h1 className="text-xl font-bold mb-6">Engine Editor</h1>

      <div className="grid gap-4 max-w-3xl">

        {rules.map((rule) => (
          <Card key={rule.id} className="border border-black/15 bg-white/90">
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{rule.name}</div>
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() =>
                    setRules((prev) =>
                      prev.map((r) =>
                        r.id === rule.id
                          ? { ...r, enabled: !r.enabled }
                          : r
                      )
                    )
                  }
                />
              </div>

              <pre className="text-xs bg-white/60 p-2 border rounded">
                {rule.condition}
              </pre>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  );
}
