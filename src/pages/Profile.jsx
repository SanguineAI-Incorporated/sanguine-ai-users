import React from "react";

export default function Profile() {
  // Mock B2B data (replace later with API)
  const account = {
    user: {
      name: "Anna Mercer",
      email: "anna@acme-robotics.com",
      role: "Operations Manager",
    },
    org: {
      name: "Acme Robotics",
      plan: "Enterprise",
      status: "Active",
      region: "US-East",
    },
    usage: {
      apiCallsToday: 12482,
      limit: 50000,
    },
    apiKeys: [
      { id: "key_1", name: "Production Key", lastUsed: "2 hours ago" },
      { id: "key_2", name: "Staging Key", lastUsed: "3 days ago" },
    ],
  };

  const usagePercent =
    (account.usage.apiCallsToday / account.usage.limit) * 100;

  return (
    <div className="min-h-screen bg-[#C8D8E4] p-6 text-black">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Account Dashboard</h1>
          <p className="text-sm text-gray-600">
            Manage your organization, usage, and access credentials
          </p>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* USER */}
          <div className="bg-white/90 border border-black/10 p-5 rounded-lg">
            <h2 className="font-semibold mb-3">User</h2>
            <p className="text-sm text-gray-500">Name</p>
            <p className="mb-2">{account.user.name}</p>

            <p className="text-sm text-gray-500">Email</p>
            <p className="mb-2">{account.user.email}</p>

            <p className="text-sm text-gray-500">Role</p>
            <p>{account.user.role}</p>
          </div>

          {/* ORGANIZATION */}
          <div className="bg-white/90 border border-black/10 p-5 rounded-lg">
            <h2 className="font-semibold mb-3">Organization</h2>

            <p className="text-sm text-gray-500">Company</p>
            <p className="mb-2">{account.org.name}</p>

            <p className="text-sm text-gray-500">Plan</p>
            <p className="mb-2">{account.org.plan}</p>

            <p className="text-sm text-gray-500">Region</p>
            <p>{account.org.region}</p>
          </div>

          {/* STATUS */}
          <div className="bg-white/90 border border-black/10 p-5 rounded-lg">
            <h2 className="font-semibold mb-3">Status</h2>

            <p className="text-sm text-gray-500">Account Status</p>
            <p className="text-green-600 font-medium mb-3">
              {account.org.status}
            </p>

            <p className="text-sm text-gray-500">API Usage</p>

            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <p className="text-xs text-gray-600 mt-2">
              {account.usage.apiCallsToday.toLocaleString()} /{" "}
              {account.usage.limit.toLocaleString()} calls today
            </p>
          </div>
        </div>

        {/* API KEYS */}
        <div className="bg-white/90 border border-black/10 p-5 rounded-lg">
          <h2 className="font-semibold mb-4">API Keys</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-black/10">
                <th className="py-2">Name</th>
                <th className="py-2">Key ID</th>
                <th className="py-2">Last Used</th>
              </tr>
            </thead>

            <tbody>
              {account.apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-black/5">
                  <td className="py-2">{key.name}</td>
                  <td className="py-2 text-gray-600">{key.id}</td>
                  <td className="py-2 text-gray-600">{key.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
