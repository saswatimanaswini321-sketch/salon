import React from 'react';

export default function Subscriptions() {
  const plans = [
    { id: '1', name: 'Free', price: '$0/mo', barbers: 2, aiConsults: 20 },
    { id: '2', name: 'Starter', price: '$29/mo', barbers: 5, aiConsults: 100 },
    { id: '3', name: 'Premium', price: '$99/mo', barbers: 20, aiConsults: 1000 },
    { id: '4', name: 'Enterprise', price: 'Custom', barbers: 'Unlimited', aiConsults: 'Unlimited' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
            </div>
            
            <ul className="space-y-3 flex-grow mb-6">
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {plan.barbers} Barbers
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {plan.aiConsults} AI Consultations
              </li>
            </ul>
            
            <button className="w-full bg-gray-100 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-200 transition">
              Edit Limits
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
