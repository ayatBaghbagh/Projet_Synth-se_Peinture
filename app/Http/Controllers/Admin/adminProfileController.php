<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminProfileController extends Controller
{
    /**
     * Récupérer le profil de l'administrateur
     */
    public function profile(Request $request)
    {
        try {
            $admin = auth('sanctum')->user();
            
            if (!$admin || $admin->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'admin' => [
                    'num_User' => $admin->num_User,
                    'nom' => $admin->nom,
                    'prenom' => $admin->prenom,
                    'email' => $admin->email,
                    'Phone' => $admin->Phone,
                    'role' => $admin->role,
                    'created_at' => $admin->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du profil admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil de l'administrateur
     */
    public function updateProfile(Request $request)
    {
        try {
            $admin = auth('sanctum')->user();
            
            if (!$admin || $admin->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nom' => 'sometimes|string|max:191',
                'prenom' => 'sometimes|string|max:191',
                'email' => 'sometimes|email|unique:utilisateurs,email,'.$admin->num_User.',num_User',
                'Phone' => 'sometimes|string|max:191',
                'current_password' => 'required_with:new_password',
                'new_password' => 'sometimes|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérification du mot de passe actuel si changement demandé
            if ($request->has('new_password')) {
                if (!Hash::check($request->current_password, $admin->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Le mot de passe actuel est incorrect'
                    ], 401);
                }
                
                $admin->password = Hash::make($request->new_password);
            }

            // Mise à jour des autres champs
            if ($request->has('nom')) {
                $admin->nom = $request->nom;
            }
            
            if ($request->has('prenom')) {
                $admin->prenom = $request->prenom;
            }
            
            if ($request->has('email')) {
                $admin->email = $request->email;
            }
            
            if ($request->has('Phone')) {
                $admin->Phone = $request->Phone;
            }

            $admin->save();

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'admin' => [
                    'num_User' => $admin->num_User,
                    'nom' => $admin->nom,
                    'prenom' => $admin->prenom,
                    'email' => $admin->email,
                    'Phone' => $admin->Phone,
                    'role' => $admin->role,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}