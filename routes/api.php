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
use App\Http\Controllers\ListeDemandeDevisController;
use App\Http\Controllers\ProjetAutoController;
use App\Http\Controllers\TacheProjetController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\UtilisateursController;
use App\Http\Controllers\PeintreController;

Route::prefix('admin')->group(function () {
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::put('/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
    Route::post('/users/{id}/toggle-block', [UserManagementController::class, 'toggleBlock']);

});

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

    // Informations du profil client
    Route::get('/client/profile', [ClientAuthController::class, 'profile']);
    
    // Déconnexion du client
    Route::post('/client/logout', [ClientAuthController::class, 'logout']);
    
    // Autres routes protégées pour les clients
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
Route::middleware('auth:sanctum')->group(function () {});

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
Route::apiResource('contactss', ContactController::class);

Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);

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

Route::get('/test-mail', function () {
    try {
        Mail::raw('Ceci est un test', function ($message) {
            $message->to('ayabaghbagh@gmail.com')
                    ->subject('Test Mail');
        });
        return 'Mail envoyé';
    } catch (\Exception $e) {
        return 'Erreur: ' . $e->getMessage();
    }
});

/*
|--------------------------------------------------------------------------
| Routes Admin
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::get('/demandes-devis', [ListeDemandeDevisController::class, 'index']);
    Route::post('/demandes-devis/{demande}/creer-devis', [ListeDemandeDevisController::class, 'creerDevis']);
});

/*
|--------------------------------------------------------------------------
| Routes Client
|--------------------------------------------------------------------------
*/
Route::prefix('client')->group(function () {
    Route::get('/devis', [App\Http\Controllers\Client\DevisController::class, 'index']);
    Route::post('/devis/{id}/accepter', [App\Http\Controllers\Client\DevisController::class, 'accepter']);
    Route::post('/devis/{id}/refuser', [App\Http\Controllers\Client\DevisController::class, 'refuser']);
});

// routes/api.php

// Espace gérant

Route::post('/admin/demandes-devis/{id}/creer-devis', [DevisController::class, 'createDevis']);

// Espace client
Route::get('/client/mes-devis', [ClientController::class, 'getMesDevis']);
Route::put('/client/devis/{id}/status', [ClientController::class, 'updateDevisStatus']);

Route::post('register', [ClientAuthController::class, 'register']);
Route::post('login', [ClientAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [ClientAuthController::class, 'profile']);
    Route::post('logout', [ClientAuthController::class, 'logout']);
    Route::apiResource('demandes', DemandeDevisController::class);
   
});
Route::post('demandes/{id}/creer-devis', [DemandeDevisController::class, 'creerDevis']);
Route::apiResource('devis', DevisController::class)->only(['index', 'show', 'destroy']);
Route::middleware('auth:sanctum')->prefix('client')->group(function () {
    Route::get('/mes-devis', [ClientAuthController::class, 'mesDevis']);
    Route::get('/mes-projets', [ClientAuthController::class, 'mesProjetsC']);
    Route::put('/devis/{id}/status', [ClientAuthController::class, 'updateDevisStatus']);
});
Route::get('/taches-projet/{projetId}', [TacheProjetController::class, 'getTachesByProjet']);
// Test de connexion API (accessible sans authentification)
Route::get('/test', [ClientAuthController::class, 'test']);

// Routes d'authentification (sans middleware)
// Route::prefix('client')->group(function () {
//     Route::post('/register', [ClientAuthController::class, 'register']);
//     Route::post('/login', [ClientAuthController::class, 'login']);
// });

// // Routes protégées par l'authentification Sanctum
// Route::middleware('auth:sanctum')->group(function () {
    
//     // Routes client avec préfixe /client
//     Route::prefix('client')->group(function () {
//         Route::get('/profile', [ClientAuthController::class, 'profile']);
//         Route::put('/profile', [ClientAuthController::class, 'updateProfile']);
//         Route::post('/logout', [ClientAuthController::class, 'logout']);
        
//         // Routes pour les devis - TOUTES LES URLS QUE VOTRE FRONTEND TESTE
//         Route::get('/mes-devis', [ClientAuthController::class, 'mesDevis']);
//         Route::get('/mesdevis', [ClientAuthController::class, 'mesDevis']); // Alternative
//         Route::put('/devis/{id}/status', [ClientAuthController::class, 'updateDevisStatus']);
//         Route::put('/devis/{id}', [ClientAuthController::class, 'updateDevisStatus']); // Alternative
        
//         // Routes pour les projets
//         Route::get('/mes-projets', [ClientAuthController::class, 'mesProjets']);
//     });
    
//     // Routes alternatives sans préfixe (pour compatibilité avec votre frontend)
//     Route::get('/mes-devis', [ClientAuthController::class, 'mesDevis']);
//     Route::get('/mesdevis', [ClientAuthController::class, 'mesDevis']);
//     Route::put('/devis/{id}/status', [ClientAuthController::class, 'updateDevisStatus']);
//     Route::put('/devis/{id}', [ClientAuthController::class, 'updateDevisStatus']);
// });

// Remplacer toutes les routes d'authentification par :
Route::prefix('auth')->group(function () {
    Route::post('/register', [ClientAuthController::class, 'register']);
    Route::post('/login', [ClientAuthController::class, 'login']);
    Route::post('/logout', [ClientAuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ClientAuthController::class, 'profile']);
    Route::put('/profile', [ClientAuthController::class, 'updateProfile']);
    Route::get('/mes-devis', [ClientAuthController::class, 'mesDevis']);
    Route::get('/mes-projets', [ClientAuthController::class, 'mesProjets']);
    Route::put('/devis/{id}/status', [ClientAuthController::class, 'updateDevisStatus']);
});
Route::get('/diagnostiquer-projets', [ProjetAutoController::class, 'diagnostiquer']);
Route::get('/synchroniser-projets', [ProjetAutoController::class, 'synchroniserProjets']);

Route::resource('taches-projet', TacheProjetController::class);
Route::post('/login', [AuthController::class, 'login']);

// Routes spéciales pour les boutons
Route::get('taches-projet/create/grand', [TacheProjetController::class, 'create'])
     ->name('taches-projet.create.grand')
     ->defaults('type_projet', 'grand');

Route::get('taches-projet/create/petit', [TacheProjetController::class, 'create'])
     ->name('taches-projet.create.petit')
     ->defaults('type_projet', 'petit');
Route::get('/projets/{projet}/taches', [TacheProjetController::class, 'getTachesByProjet']);


Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::get('/dashboard/favoris', [\App\Http\Controllers\DashboardController::class, 'getFavoris']);
    
    // Routes pour les actions rapides
    Route::post('/demandes', [\App\Http\Controllers\DemandeDevisController::class, 'store']);
    Route::post('/clients', [\App\Http\Controllers\ClientController::class, 'store']);
    Route::post('/projets', [\App\Http\Controllers\ProjetController::class, 'store']);
    
});

Route::apiResource('utilisateurs', UtilisateursController::class);
    
    // Routes personnalisées pour les utilisateurs
    Route::get('utilisateurs/role/{role}', [UtilisateursController::class, 'getByRole']);
    Route::get('/utilisateurs', [UtilisateursController::class, 'index']);
    Route::post('utilisateurs/{id}/change-password', [UtilisateursController::class, 'changePassword']);
    Route::patch('utilisateurs/{id}/toggle-status', [UtilisateursController::class, 'toggleStatus']);
    Route::get('utilisateurs/search', [UtilisateursController::class, 'search']);

    Route::apiResource('peintre', PeintreController::class);


    Route::put('/devis/{id}/status', [DevisController::class, 'updateStatus']);

Route::post('/taches-projet', [TacheProjetController::class, 'store']);
Route::get('/projets/{projetId}/taches', [TacheProjetController::class, 'getTachesByProjet']);
Route::put('/taches-projet/{id}', [TacheProjetController::class, 'update']);
Route::delete('/taches-projet/{id}', [TacheProjetController::class, 'destroy']);