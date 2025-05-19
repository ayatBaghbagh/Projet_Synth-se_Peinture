<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // ATTENTION: Ceci est uniquement pour les tests et ne devrait pas être utilisé en production
        'api/*',
        'sanctum/csrf-cookie',
    ];
}