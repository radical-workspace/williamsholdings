import { sbServer } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const sb = sbServer();
  const { data: { user } } = await sb.auth.getUser();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="card">
        <div className="card-header">Email</div>
        <div className="font-medium">{user?.email}</div>
      </div>
      <a href="/auth/pin-setup" className="btn btn-primary block text-center">Change PIN</a>
    </div>
  );
}
