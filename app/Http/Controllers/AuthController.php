<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Client; // Assurez-vous d'avoir ce modèle

class AuthController extends Controller
{
    /**
     * Connexion utilisateur
     */
    public function login(Request $request)
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ], [
                'email.required' => 'L\'email est requis',
                'email.email' => 'Format d\'email invalide',
                'password.required' => 'Le mot de passe est requis',
                'password.min' => 'Le mot de passe doit contenir au moins 6 caractères',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $credentials = $request->only('email', 'password');

            // Tentative de connexion
            if (Auth::attempt($credentials)) {
                $user = Auth::user();
                
                // Créer un token Sanctum
                $token = $user->createToken('auth-token')->plainTextToken;

                return response()->json([
                    'message' => 'Connexion réussie',
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ], 200);
            }

            return response()->json([
                'message' => 'Identifiants incorrects',
                'error' => 'Email ou mot de passe invalide'
            ], 401);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la connexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Déconnexion utilisateur
     */
    public function logout(Request $request)
    {
        try {
            // Supprimer tous les tokens de l'utilisateur
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Déconnexion réussie'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les informations de l'utilisateur connecté
     */
    public function me(Request $request)
    {
        try {
            return response()->json([
                'user' => $request->user()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des informations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rafraîchir le token
     */
    public function refresh(Request $request)
    {
        try {
            $user = $request->user();
            
            // Supprimer le token actuel
            $request->user()->currentAccessToken()->delete();
            
            // Créer un nouveau token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Token rafraîchi',
                'token' => $token,
                'token_type' => 'Bearer'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du rafraîchissement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}