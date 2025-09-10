@echo off
cd apps\web
if exist .next rmdir /s /q .next
npm run build
