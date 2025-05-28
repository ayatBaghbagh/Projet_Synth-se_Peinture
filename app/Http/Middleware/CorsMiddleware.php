<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS requests
        if ($request->getMethod() === "OPTIONS") {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN, Accept, Origin')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        // Process the request
        $response = $next($request);

        // Add CORS headers to all responses
        return $response
            ->header('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN, Accept, Origin')
            ->header('Access-Control-Allow-Credentials', 'true');
    }

    /**
     * Get the allowed origin based on the request
     */
    private function getAllowedOrigin(Request $request): string
    {
        $origin = $request->header('Origin');
        
        // Liste des origines autorisées (ajustez selon vos besoins)
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://localhost:8080',
        ];

        // Si l'origine est dans la liste autorisée, la retourner
        if ($origin && in_array($origin, $allowedOrigins)) {
            return $origin;
        }

        // En développement, autoriser localhost par défaut
        if (app()->environment('local') && $origin && str_contains($origin, 'localhost')) {
            return $origin;
        }

        // Fallback
        return 'http://localhost:3000';
    }
}