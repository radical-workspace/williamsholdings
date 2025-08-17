@echo off
title WilliamsHoldings - Local Dev
where node >NUL 2>&1 || (echo Please install Node.js LTS from https://nodejs.org/ & pause & exit /B 1)
if not exist ".env.local" (
  copy ".env.local.example" ".env.local" >NUL
  echo Open .env.local and paste your Supabase keys, then return here.
  pause
)
call npm install
call npm run dev
pause
