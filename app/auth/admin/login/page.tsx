import { redirect } from 'next/navigation';

export default function AuthAdminLoginRedirect() {
  // Redirect server-side to the canonical admin login route
  redirect('/admin/login');
}
