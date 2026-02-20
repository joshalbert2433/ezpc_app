import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <LogoutButton />
        </header>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">User Access</h2>
          <p className="text-gray-600 mb-4">
            Welcome back, <span className="font-bold">{session.name}</span>!
          </p>
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700">Your Account:</h3>
            <p className="mt-2 text-gray-600">
              Email: {session.email}
            </p>
            <p className="text-gray-600">
              Role: {session.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
