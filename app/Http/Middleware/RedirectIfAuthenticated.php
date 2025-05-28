<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Pour les requêtes API, retourner une réponse JSON
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'message' => 'Déjà authentifié.',
                        'user' => Auth::guard($guard)->user()
                    ], 200);
                }

                // Pour les requêtes web, rediriger vers le dashboard
                return redirect(RouteServiceProvider::HOME ?? '/dashboard');
            }
        }

        return $next($request);
    }
}