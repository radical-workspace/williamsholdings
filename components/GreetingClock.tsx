'use client';
import { useEffect, useState } from 'react';

export default function GreetingClock({ name }: { name?: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const h = now.getHours();
  const period = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="flex items-start justify-between">
      <div><div className="muted">Good {period}</div><div className="text-xl font-semibold">{name || 'there'}</div></div>
      <div className="text-right"><div className="font-mono">{time}</div><div className="muted text-xs">{date}</div></div>
    </div>
  );
}
