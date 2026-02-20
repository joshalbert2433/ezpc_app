import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminPage() {
  const session = await getSession();

  // Serverside check just in case middleware is bypassed
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <LogoutButton />
        </header>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Admin Access Granted</h2>
          <p className="text-gray-600 mb-4">
            Welcome back, <span className="font-bold">{session.name}</span>!
          </p>
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700">Admin Privileges:</h3>
            <ul className="list-disc ml-5 mt-2 text-gray-600">
              <li>Manage all users</li>
              <li>View system logs</li>
              <li>Configure application settings</li>
              <li>Manage products</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
