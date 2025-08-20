import React from 'react';

export default function Toast({ message, open }: { message: string | null; open: boolean }) {
  if (!open || !message) return null;

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-50">
      <div className="bg-black text-white px-4 py-2 rounded shadow">{message}</div>
    </div>
  );
}
