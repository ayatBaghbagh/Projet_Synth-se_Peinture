<?php
// AuthController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Client; // Assurez-vous d'importer le modèle Client

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $email = $credentials['email'];
        $password = $credentials['password'];

        // Tentative 1: Vérifier dans la table users
        $user = User::where('email', $email)->first();
        
        if ($user) {
            // Vérifier si l'utilisateur est bloqué
            if ($user->block == 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.'
                ], 403);
            }

            // Vérifier le mot de passe
            if (Hash::check($password, $user->password)) {
                // Authentification réussie pour un utilisateur
                $token = $user->createToken('auth-token')->plainTextToken;
                
                return response()->json([
                    'success' => true,
                    'user' => $user,
                    'token' => $token,
                    'isClient' => false, // C'est un utilisateur, pas un client
                    'userType' => 'user'
                ]);
            }
        }

        // Tentative 2: Vérifier dans la table clients
        $client = Client::where('email', $email)->first();
        
        if ($client) {
            // Vérifier si le client est bloqué
            if ($client->block == 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.'
                ], 403);
            }

            // Pour les clients, vous pouvez soit :
            // Option 1: Comparer directement (si les mots de passe ne sont pas hashés)
            if ($client->password === $password) {
                // Créer un token pour le client (vous devrez peut-être ajuster selon votre configuration)
                // Si Client n'a pas de méthode createToken, utilisez une autre approche
                
                // Ajouter le champ role pour compatibilité
                $clientData = $client->toArray();
                $clientData['role'] = 'client';
                
                return response()->json([
                    'success' => true,
                    'user' => $clientData,
                    'token' => 'client_' . $client->id_client . '_' . time(), // Token simple pour client
                    'isClient' => true,
                    'userType' => 'client'
                ]);
            }
            
            // Option 2: Si les mots de passe clients sont aussi hashés
            // if (Hash::check($password, $client->password)) {
            //     $clientData = $client->toArray();
            //     $clientData['role'] = 'client';
            //     
            //     return response()->json([
            //         'success' => true,
            //         'user' => $clientData,
            //         'token' => 'client_' . $client->id_client . '_' . time(),
            //         'isClient' => true,
            //         'userType' => 'client'
            //     ]);
            // }
        }

        // Aucune correspondance trouvée
        return response()->json([
            'success' => false,
            'message' => 'Identifiants incorrects'
        ], 401);
    }

    // Méthode alternative si vous voulez séparer la logique
    public function loginClient(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $client = Client::where('email', $credentials['email'])->first();
        
        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client non trouvé'
            ], 404);
        }

        if ($client->block == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.'
            ], 403);
        }

        // Vérifier le mot de passe (ajustez selon votre méthode de stockage)
        if ($client->password === $credentials['password']) {
            $clientData = $client->toArray();
            $clientData['role'] = 'client';
            
            return response()->json([
                'success' => true,
                'user' => $clientData,
                'token' => 'client_' . $client->id_client . '_' . time(),
                'isClient' => true,
                'userType' => 'client'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Mot de passe incorrect'
        ], 401);
    }
}