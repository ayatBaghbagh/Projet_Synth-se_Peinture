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

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('products', ProductController::class);
Route::post('/products', [ProductController::class, 'store']);

Route::apiResource('clients', ClientController::class);
Route::apiResource('demande-devis', DemandeDevisController::class);
Route::apiResource('devis', DevisController::class);

// IMPORTANT : Routes spécifiques AVANT apiResource
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