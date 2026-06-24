import React from 'react';

export default function Salons() {
  // Demo Data for UI
  const salons = [
    { id: '1', name: 'Elite Cuts', ownerName: 'John Doe', plan: 'Premium', status: 'ACTIVE', created: '2026-01-15' },
    { id: '2', name: 'Style Lounge', ownerName: 'Jane Smith', plan: 'Starter', status: 'PENDING', created: '2026-06-20' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Salon Directory</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          + Add Salon
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salon Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salons.map((salon) => (
              <tr key={salon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{salon.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{salon.ownerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{salon.plan}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${salon.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {salon.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{salon.created}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-blue-600 hover:text-blue-900 mr-4">Edit</a>
                  <a href="#" className="text-red-600 hover:text-red-900">Suspend</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
