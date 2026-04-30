import React from "react";

export default function Profile() {
  // Mock B2B user (replace later with real API data)
  const user = {
    name: "Alex Mercer",
    role: "Operations Manager",
    company: "Sanguine Systems",
    email: "alex@sanguine.ai",
    plan: "Enterprise",
    status: "Active",
  };

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {/* USER CARD */}
        <div className="bg-white/90 border border-black/10 rounded-lg p-6 space-y-4">

          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p>{user.role}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p>{user.company}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{user.email}</p>
          </div>

          <div className="flex gap-6 pt-2">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="font-medium">{user.plan}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-green-600 font-medium">{user.status}</p>
            </div>
          </div>

        </div>

        {/* FUTURE SECTION */}
        <div className="mt-6 text-sm text-gray-600">
          <p>Future: API keys, usage analytics, and access controls.</p>
        </div>

      </div>
    </div>
  );
}
