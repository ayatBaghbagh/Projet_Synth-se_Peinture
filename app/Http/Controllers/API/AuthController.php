<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Utilisateur;
use App\Models\Client;
use App\Models\Peintre;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request) 
    {
        try {
            Log::info('Début de la tentative de connexion');
            
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $email = $request->email;
            $password = $request->password;

            $user = null;
            $role = null;

            Log::info('Recherche de l\'utilisateur avec l\'email: ' . $email);

            // Chercher dans la table 'utilisateurs' pour admin ou chef_equipe
            $userAdmin = Utilisateur::where('email', $email)->first();
            if ($userAdmin && Hash::check($password, $userAdmin->password)) {
                $user = $userAdmin;
                $role = $userAdmin->role;
                Log::info('Utilisateur admin/chef_equipe authentifié');
            }

            // Sinon chercher dans clients
            if (!$user) {
                $userClient = Client::where('email', $email)->first();
                if ($userClient && Hash::check($password, $userClient->password)) {
                    $user = $userClient;
                    $role = 'client';
                    Log::info('Client authentifié');
                }
            }

            // Sinon chercher dans peintres
            if (!$user) {
                $userPeintre = Peintre::where('email', $email)->first();
                if ($userPeintre && Hash::check($password, $userPeintre->password)) {
                    $user = $userPeintre;
                    $role = 'peintre';
                    Log::info('Peintre authentifié');
                }
            }

            if (!$user) {
                Log::info('Aucun utilisateur trouvé pour: ' . $email);
                throw ValidationException::withMessages([
                    'email' => ['Les informations d\'identification sont incorrectes.'],
                ]);
            }

            // Générer un token simple
            $token = Str::random(60);
            
            // Stocker le token dans la session
            session(['auth_token' => $token]);
            session(['user_id' => $user->id]);
            session(['user_role' => $role]);

            Log::info('Connexion réussie pour: ' . $email);

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $user,
                'role' => $role,
                'message' => 'Connexion réussie'
            ], 200);

        } catch (ValidationException $e) {
            Log::error('Erreur de validation: ', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la connexion: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur interne du serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            session()->forget(['auth_token', 'user_id', 'user_role']);
            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie.'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la déconnexion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion'
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $userId = session('user_id');
            $role = session('user_role');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            $user = null;
            switch ($role) {
                case 'admin':
                case 'chef_equipe':
                    $user = Utilisateur::find($userId);
                    break;
                case 'client':
                    $user = Client::find($userId);
                    break;
                case 'peintre':
                    $user = Peintre::find($userId);
                    break;
            }

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'user' => $user,
                'role' => $role
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du profil: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil'
            ], 500);
        }
    }
}
