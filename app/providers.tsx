"use client";
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Use the CSS variable provided by next/font/google (see app/layout.tsx)
const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#4F46E5' } },
  shape: { borderRadius: 12 },
  typography: { fontFamily: "var(--font-inter), Inter, sans-serif" },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
