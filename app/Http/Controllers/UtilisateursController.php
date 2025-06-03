<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UtilisateursController extends Controller
{
    /**
     * Afficher la liste de tous les utilisateurs
     */
   public function index(Request $request): JsonResponse
{
    try {
        $query = Utilisateur::query();

        // Filtre par email si spécifié
        if ($request->has('email')) {
            $query->where('email', $request->email);
        }

        // Autres filtres existants...
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Retourne tous les résultats sans pagination pour la recherche par email
        if ($request->has('email')) {
            $utilisateurs = $query->get();
            return response()->json([
                'success' => true,
                'message' => 'Utilisateurs récupérés avec succès',
                'data' => $utilisateurs
            ]);
        }

        // Pagination pour les autres cas
        $perPage = $request->get('per_page', 15);
        $utilisateurs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateurs récupérés avec succès',
            'data' => $utilisateurs->items(),
            'pagination' => [
                'current_page' => $utilisateurs->currentPage(),
                'last_page' => $utilisateurs->lastPage(),
                'per_page' => $utilisateurs->perPage(),
                'total' => $utilisateurs->total(),
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des utilisateurs',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Créer un nouvel utilisateur
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:utilisateurs,email',
                'Phone' => 'required|string|max:20',
                'password' => 'required|string|min:6',
                'role' => 'required|in:admin,chef_equipe'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Générer un numéro d'utilisateur unique
            do {
                $numUser = 'USR' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            } while (Utilisateur::where('num_User', $numUser)->exists());

            // Créer l'utilisateur - MOT DE PASSE NON HACHÉ
            $utilisateur = Utilisateur::create([
                'num_User' => $numUser,
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'Phone' => $request->Phone,
                'password' => $request->password, // MODIFIÉ: Pas de Hash::make()
                'role' => $request->role,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $utilisateur
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un utilisateur spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $utilisateur = Utilisateur::where('num_User', $id)
                                     ->orWhere('email', $id)
                                     ->first();

            if (!$utilisateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur récupéré avec succès',
                'data' => $utilisateur
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $utilisateur = Utilisateurs::where('num_User', $id)->first();

            if (!$utilisateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Validation des données
            $validator = Validator::make($request->all(), [
                'nom' => 'sometimes|required|string|max:255',
                'prenom' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:utilisateurs,email,' . $utilisateur->num_User . ',num_User',
                'Phone' => 'sometimes|required|string|max:20',
                'password' => 'sometimes|nullable|string|min:6',
                'role' => 'sometimes|required|in:admin,chef_equipe'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Préparer les données à mettre à jour
            $updateData = $request->only(['nom', 'prenom', 'email', 'Phone', 'role']);

            // MOT DE PASSE NON HACHÉ lors de la mise à jour
            if ($request->filled('password')) {
                $updateData['password'] = $request->password; // MODIFIÉ: Pas de Hash::make()
            }

            // Mettre à jour l'utilisateur
            $utilisateur->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $utilisateur->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy($id): JsonResponse
    {
        try {
            $utilisateur = Utilisateur::where('num_User', $id)->first();

            if (!$utilisateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Vérifier si l'utilisateur peut être supprimé
            // (vous pouvez ajouter des vérifications supplémentaires ici)
            
            $utilisateur->delete();

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les utilisateurs par rôle (pour les sélecteurs)
     */
    public function getByRole($role): JsonResponse
    {
        try {
            $validRoles = ['admin', 'chef_equipe'];
            
            if (!in_array($role, $validRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rôle invalide'
                ], 400);
            }

            $utilisateurs = Utilisateur::where('role', $role)
                                      ->select('num_User', 'nom', 'prenom', 'email', 'role')
                                      ->get();

            return response()->json([
                'success' => true,
                'message' => "Utilisateurs avec le rôle {$role} récupérés avec succès",
                'data' => $utilisateurs
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs par rôle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Changer le mot de passe d'un utilisateur
     */
    public function changePassword(Request $request, $id): JsonResponse
    {
        try {
            $utilisateur = Utilisateurs::where('num_User', $id)->first();

            if (!$utilisateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // VÉRIFICATION EN TEXTE BRUT pour l'ancien mot de passe
            if ($request->current_password !== $utilisateur->password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mot de passe actuel incorrect'
                ], 400);
            }

            // Mettre à jour le mot de passe - NON HACHÉ
            $utilisateur->update([
                'password' => $request->new_password // MODIFIÉ: Pas de Hash::make()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mot de passe changé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de mot de passe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer/Désactiver un utilisateur
     */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        try {
            $utilisateur = Utilisateur::where('num_User', $id)->first();

            if (!$utilisateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Si vous avez un champ 'status' ou 'active' dans votre table
            // $utilisateur->update(['active' => !$utilisateur->active]);

            return response()->json([
                'success' => true,
                'message' => 'Statut de l\'utilisateur mis à jour avec succès',
                'data' => $utilisateur
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechercher des utilisateurs
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $searchTerm = $request->get('q', '');
            
            if (empty($searchTerm)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terme de recherche requis'
                ], 400);
            }

            $utilisateurs = Utilisateur::where('nom', 'LIKE', "%{$searchTerm}%")
                                      ->orWhere('prenom', 'LIKE', "%{$searchTerm}%")
                                      ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                                      ->orWhere('num_User', 'LIKE', "%{$searchTerm}%")
                                      ->limit(10)
                                      ->get();

            return response()->json([
                'success' => true,
                'message' => 'Recherche effectuée avec succès',
                'data' => $utilisateurs
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connexion utilisateur - AUTHENTIFICATION EN TEXTE BRUT
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Utilisateur::where('email', $request->email)->first();

            // VÉRIFICATION EN TEXTE BRUT - PAS DE HACHAGE
            if (!$user || $request->password !== $user->password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Identifiants incorrects'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'authentification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}