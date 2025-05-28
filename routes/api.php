<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DemandeDevisController;
use App\Http\Controllers\DevisController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\API\CommentaireController;
use App\Http\Controllers\API\PaysController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientAuthController;

// Route pour CSRF token - accessible depuis le frontend
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set'], 200)
        ->withCookie(cookie('XSRF-TOKEN', csrf_token(), 0, '/', null, false, false));
});

// Routes d'authentification SANS middleware auth (pour registration/login)
Route::post('/clients', [ClientController::class, 'store']); // Registration
Route::post('/auth/login', [AuthController::class, 'login']); // Login
Route::post('/client/login', [ClientAuthController::class, 'login']); // Client Login

// Routes protégées avec Sanctum pour les clients
Route::middleware('auth:sanctum')->group(function () {
    // Informations du profil client
    Route::get('/client/profile', [ClientAuthController::class, 'profile']);
    
    // Déconnexion du client
    Route::post('/client/logout', [ClientAuthController::class, 'logout']);
    
    // Autres routes protégées pour les clients
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Route OPTIONS spécifique pour /clients
Route::options('/clients', [ClientController::class, 'options']);

// Routes API avec middleware Sanctum pour les utilisateurs authentifiés (admin)
Route::middleware(['auth:sanctum'])->group(function () {
    // Logout admin
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// Routes API publiques (sans authentification obligatoire)
Route::apiResource('products', ProductController::class);
Route::apiResource('clients', ClientController::class)->except(['store']); // Exclude store car déjà défini
Route::apiResource('demande-devis', DemandeDevisController::class);
Route::apiResource('devis', DevisController::class);

// Routes projets - IMPORTANT : Routes spécifiques AVANT apiResource
Route::get('/projets/favoris', [ProjetController::class, 'favoris']);
Route::post('/projets/{projet}/toggle-favori', [ProjetController::class, 'toggleFavori']);
Route::get('/projets/favoris-complet', [ProjetController::class, 'allFavoris']);
Route::apiResource('projets', ProjetController::class);

Route::apiResource('commentaires', CommentaireController::class);
Route::get('commentaires-favoris', [CommentaireController::class, 'favoris']);
Route::get('commentaires/favoris/{type_client}', [CommentaireController::class, 'favorisParType']);

Route::get('/nations', [PaysController::class, 'nations']);
Route::get('/villes', [PaysController::class, 'villes']);

Route::apiResource('contacts', ContactController::class)->only(['store']);

// Route de test pour vérifier la connectivité
Route::get('/test', function() {
    return response()->json([
        'message' => 'API Laravel fonctionnelle',
        'timestamp' => now(),
        'cors_headers' => [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With'
        ]
    ]);
});