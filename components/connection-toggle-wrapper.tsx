'use client';

import dynamic from 'next/dynamic';

// Dynamically import the connection toggle with ssr: false in a client component
const SupabaseConnectionToggle = dynamic(
  () => import('@/components/supabase-connection-toggle'),
  { ssr: false }
);

export default function ConnectionToggleWrapper() {
  return <SupabaseConnectionToggle />;
}
