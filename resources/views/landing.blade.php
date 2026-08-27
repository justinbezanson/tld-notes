<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="preconnect" href="https://googleapis.com">
        <link rel="preconnect" href="https://gstatic.com" crossorigin>
        <link href="https://googleapis.com/css2?family=Oswald:wght@300;400;700&display=swap" rel="stylesheet">


        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts
        @vite(['resources/css/app.css'])
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen flex flex-col items-center justify-center text-center text-white">
            <h1 class="text-4xl font-bold uppercase">Bush Pilot's Guide</h1>
            <p>An Unofficial Companion for The Long Dark</p>
            <p>
                @if ($user)
                    <a href="{{ route('dashboard') }}" class="text-blue-500 hover:underline">Go to Dashboard</a>
                @else
                    <a href="{{ route('login') }}" class="text-blue-500 hover:underline">Login</a> or
                    <a href="{{ route('register') }}" class="text-blue-500 hover:underline">Register</a> to get started.
                @endif
            </p>
        </div>
    </body>
</html>