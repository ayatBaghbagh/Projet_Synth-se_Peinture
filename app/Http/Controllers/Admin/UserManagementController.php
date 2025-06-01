<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Peintre;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendPasswordMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    private function generateIdentifier(string $role): string
    {
        $prefixes = [
            'client' => 'C',
            'peintre' => 'P', 
            'chef_equipe' => 'CH'
        ];

        if (!array_key_exists($role, $prefixes)) {
            throw new \InvalidArgumentException("Rôle inconnu: $role");
        }

        $count = match($role) {
            'client' => Client::count(),
            'peintre' => Peintre::count(),
            'chef_equipe' => Utilisateur::where('role', $role)->count()
        };

        return $prefixes[$role] . str_pad($count + 1, 5, '0', STR_PAD_LEFT);
    }
public function index(Request $request)
{
    // Validation
    $validated = $request->validate([
        'search' => 'sometimes',
        'status' => 'sometimes|in:all,active,blocked',
        'sort' => 'sometimes|string|in:nom,prenom,email,created_at',
        'order' => 'sometimes|in:asc,desc'
    ]);

    // Base queries
    $clientQuery = Client::select([
        'id_client as id',
        'nom',
        'prenom',
        'email',
        'adresse',
        'telephone',
        'block',
        'date_inscription as created_at',
        DB::raw('"client" as role')
    ]);

    $peintreQuery = Peintre::select([
        'num_peintre as id',
        'nom',
        'prenom',
        'email',
        'tele as telephone',
        'block',
        'created_at',
        DB::raw('"peintre" as role')
    ]);

    $chefQuery = Utilisateur::where('role', 'chef_equipe')->select([
        'num_User as id',
        'nom',
        'prenom',
        'email',
        'Phone as telephone',
        'block',
        'created_at',
        DB::raw('"chef_equipe" as role')
    ]);

    // Apply search filter
    if ($request->has('search') && $request->search) {
        $search = '%'.$request->search.'%';
        
        $clientQuery->where(function($q) use ($search) {
            $q->where('nom', 'like', $search)
              ->orWhere('prenom', 'like', $search)
              ->orWhere('email', 'like', $search);
        });

        $peintreQuery->where(function($q) use ($search) {
            $q->where('nom', 'like', $search)
              ->orWhere('prenom', 'like', $search)
              ->orWhere('email', 'like', $search);
        });

        $chefQuery->where(function($q) use ($search) {
            $q->where('nom', 'like', $search)
              ->orWhere('prenom', 'like', $search)
              ->orWhere('email', 'like', $search);
        });
    }

    // Apply status filter
    if ($request->has('status') && $request->status !== 'all') {
        $blockValue = $request->status === 'blocked' ? 1 : 0;
        $clientQuery->where('block', $blockValue);
        $peintreQuery->where('block', $blockValue);
        $chefQuery->where('block', $blockValue);
    }

    // Get results
    $clients = $clientQuery->get();
    $peintres = $peintreQuery->get();
    $chefs = $chefQuery->get();

    // Combine and add status field
    $users = $clients->concat($peintres)->concat($chefs)->map(function($user) {
        $user->status = $user->block ? 'blocked' : 'active';
        return $user;
    });

    // Sorting
    $sortBy = $request->get('sort', 'created_at');
    $order = $request->get('order', 'desc');
    
    $sorted = $users->sortBy($sortBy, SORT_REGULAR, $order === 'desc');

    return response()->json([
        'success' => true,
        'data' => $sorted->values(),
        'total' => $sorted->count()
    ]);
}
    
    public function store(Request $request)
{
    DB::beginTransaction();
    try {
        // Validation commune
        $validated = $request->validate([
            'nom' => 'required|string|max:191',
            'prenom' => 'required|string|max:191',
            'email' => 'required|email|unique:utilisateurs,email|unique:clients,email|unique:peintres,email',
            'role' => 'required|in:client,chef_equipe,peintre',
            'status' => 'required|in:active,blocked',
        ]);

        $password = Str::random(10);
        $role = $validated['role']; // frontend: client, peintre, chef_equipe
        $block = $validated['status'] === 'blocked' ? 1 : 0;

        // Données communes à tous
        $commonData = [
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'block' => $block,
        ];

        switch ($role) {
            case 'client':
                // Ajoute la validation spécifique au client
                $clientData = $request->validate([
                    'adresse' => 'required|string|max:191',
                    'telephone' => 'nullable|string|max:191',
                ]);

                $user = Client::create(array_merge($commonData, $clientData, [
                    'date_inscription' => now(),
                ]));
                break;

            case 'peintre':
                $peintreData = $request->validate([
                    'tele' => 'required|string|max:191',
                ]);

                $user = Peintre::create(array_merge($commonData, $peintreData));
                break;

            case 'chef_equipe':
                $utilisateurData = $request->validate([
                    'Phone' => 'required|string|max:191',
                ]);

                $user = Utilisateur::create(array_merge($commonData, $utilisateurData, [
                    'num_User' => $this->generateIdentifier('chef_equipe'),
                    'role' => 'chef_equipe'
                ]));
                break;

            default:
                throw new \Exception("Rôle non supporté");
        }

        // Envoi du mot de passe par mail
        Mail::to($validated['email'])->send(new SendPasswordMail(
            email: $validated['email'],
            password: $password,
            nom: $validated['nom'],
            prenom: $validated['prenom']
        ));

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'errors' => $e->errors(),
            'message' => 'Erreur de validation'
        ], 422);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur création utilisateur : ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création de l\'utilisateur : ' . $e->getMessage()
        ], 500);
    }
}


public function update(Request $request, $id)
{
    try {
        // Validation des champs de base
        $validated = $request->validate([
            'nom' => 'required|string|max:191',
            'prenom' => 'required|string|max:191',
            'email' => 'required|email|max:191',
            'status' => 'nullable|in:active,blocked'
        ]);

        // Recherche de l'utilisateur
        $user = Client::where('id_client', $id)->first()
            ?? Peintre::where('num_peintre', $id)->first()
            ?? Utilisateur::where('num_User', $id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Mise à jour directe sans vérification d'email
        $user->nom = $validated['nom'];
        $user->prenom = $validated['prenom'];
        $user->email = $validated['email']; // On met à jour l'email sans vérification
        
        if (isset($validated['status'])) {
            $user->block = $validated['status'] === 'blocked' ? 1 : 0;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user
        ]);

    } catch (\Exception $e) {
        Log::error('Erreur de mise à jour utilisateur : ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
        ], 500);
    }
}
    public function destroy($id)
    {
        try {
            $deleted = false;

            // Essayer de supprimer dans chaque table
            if (Client::where('id_client', $id)->exists()) {
                Client::destroy($id);
                $deleted = true;
            } elseif (Peintre::where('num_peintre', $id)->exists()) {
                Peintre::where('num_peintre', $id)->delete();
                $deleted = true;
            } elseif (Utilisateur::where('num_User', $id)->exists()) {
                Utilisateur::where('num_User', $id)->delete(); 
                $deleted = true;
            }

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'utilisateur'
            ], 500);
        }
    }

    public function toggleBlock(Request $request, $id)
{
    try {
        // Valider plus simplement
        $request->validate([
            'block' => 'sometimes|boolean' // Accepte true/false ou 1/0
        ]);

        // Trouver l'utilisateur (version plus propre)
        $user = Client::find($id)
            ?? Peintre::find($id)
            ?? Utilisateur::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Basculer le statut si aucun paramètre, sinon utiliser la valeur envoyée
        $block = $request->has('block') 
            ? $request->block 
            : !$user->block;

        $user->block = $block;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => $user->block ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
            'block_status' => $user->block
        ]);

    } catch (\Exception $e) {
        Log::error('Error updating user status: ', [
            'error' => $e->getMessage(),
            'stack' => $e->getTraceAsString(),
            'user_id' => $id,
            'request' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur serveur',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}
}
