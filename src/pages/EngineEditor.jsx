import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleCondition, setNewRuleCondition] = useState("");

  const addRule = () => {
    if (!newRuleName.trim()) return;

    const newRule = {
      id: Date.now(),
      name: newRuleName,
      condition: newRuleCondition || "true",
      enabled: true,
    };

    setRules((prev) => [...prev, newRule]);
    setNewRuleName("");
    setNewRuleCondition("");
  };

  const deleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#C8D8E4] text-black p-6 pt-24">
      <h1 className="text-xl font-bold mb-6">Engine Editor</h1>

      {/* Add Rule */}
      <div className="max-w-3xl mb-6 p-4 bg-white/80 border rounded">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Rule name"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
          />
          <Input
            placeholder="Condition (e.g. hazard > 0.5)"
            value={newRuleCondition}
            onChange={(e) => setNewRuleCondition(e.target.value)}
          />
          <Button onClick={addRule}>Add</Button>
        </div>
      </div>

      <div className="grid gap-4 max-w-3xl">
        {rules.map((rule) => (
          <Card key={rule.id} className="border border-black/15 bg-white/90">
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{rule.name}</div>
                <div className="flex gap-3 items-center">
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
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
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
