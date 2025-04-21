import { Head } from '@inertiajs/react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bed, Users, DollarSign, BarChart2 } from 'lucide-react'; // Lucide icons

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

// Dummy data
const stats = [
  { label: 'Total Rooms', value: 42, icon: <Bed size={24} />, color: 'bg-indigo-500' },
  { label: 'Occupied Rooms', value: 27, icon: <Users size={24} />, color: 'bg-green-500' },
  { label: 'Vacant Rooms', value: 15, icon: <Bed size={24} />, color: 'bg-red-500' },
  { label: 'Active Bookings', value: 24, icon: <BarChart2 size={24} />, color: 'bg-yellow-500' },
  { label: 'Today Revenue', value: '₱18,500', icon: <DollarSign size={24} />, color: 'bg-blue-500' },
  { label: 'Monthly Revenue', value: '₱152,000', icon: <DollarSign size={24} />, color: 'bg-teal-500' },
];

const bookingsBarData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Bookings',
      data: [5, 8, 6, 10, 12, 7, 9],
      backgroundColor: '#4f46e5',
      borderRadius: 8,
    },
  ],
};

const occupancyDoughnutData = {
  labels: ['Occupied', 'Vacant'],
  datasets: [
    {
      data: [27, 15],
      backgroundColor: ['#16a34a', '#d1d5db'],
      borderWidth: 1,
    },
  ],
};

export default function Dashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-6 p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-between ${stat.color} dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-6 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl text-white">{stat.icon}</div>
                <div className="text-sm text-white">{stat.label}</div>
              </div>
              <div className="text-2xl font-semibold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bookings Bar Chart */}
          <div className="col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Bookings This Week</h3>
            <Bar data={bookingsBarData} />
          </div>

          {/* Occupancy Doughnut Chart */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Room Occupancy</h3>
            <Doughnut data={occupancyDoughnutData} />
          </div>
        </div>

        {/* Recent Bookings Table (Dummy UI) */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-neutral-700 text-left">
                  <th className="p-2 font-medium">Room</th>
                  <th className="p-2 font-medium">Tenant</th>
                  <th className="p-2 font-medium">Check-In</th>
                  <th className="p-2 font-medium">Check-Out</th>
                  <th className="p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    room: '101',
                    tenant: 'Juan Dela Cruz',
                    checkin: 'April 20, 2025',
                    checkout: 'April 21, 2025',
                    status: 'Active',
                  },
                  {
                    room: '102',
                    tenant: 'Maria Santos',
                    checkin: 'April 19, 2025',
                    checkout: 'April 20, 2025',
                    status: 'Completed',
                  },
                  {
                    room: '103',
                    tenant: 'Pedro Reyes',
                    checkin: 'April 21, 2025',
                    checkout: 'April 23, 2025',
                    status: 'Upcoming',
                  },
                ].map((item, i) => (
                  <tr key={i} className="border-b dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                    <td className="p-2">{item.room}</td>
                    <td className="p-2">{item.tenant}</td>
                    <td className="p-2">{item.checkin}</td>
                    <td className="p-2">{item.checkout}</td>
                    <td className="p-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
