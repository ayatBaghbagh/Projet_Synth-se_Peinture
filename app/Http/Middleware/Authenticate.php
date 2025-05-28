<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Pour les requêtes API, ne pas rediriger mais retourner null
        // Laravel retournera automatiquement une réponse JSON 401
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        // Pour les requêtes web, rediriger vers la page de login
        return route('login');
    }

    /**
     * Handle an unauthenticated user.
     */
    protected function unauthenticated($request, array $guards)
    {
        // Pour les requêtes API, retourner une réponse JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            abort(response()->json([
                'message' => 'Non authentifié.',
                'error' => 'Unauthenticated'
            ], 401));
        }

        // Pour les requêtes web, utiliser le comportement par défaut
        parent::unauthenticated($request, $guards);
    }
}