<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Commentaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentaireController extends Controller
{
    public function index()
    {
        try {
            $commentaires = Commentaire::orderBy('created_at', 'desc')->get();
            return response()->json($commentaires);
        } catch (\Exception $e) {
            Log::error('Erreur récupération commentaires: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des commentaires',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
             try {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'type_client' => 'required|in:Particuliers,Professionnels,Collectivités',
            'contenu' => 'required|string|min:10',
            'favori' => 'sometimes|boolean',
            'nation' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
        ], [
            'contenu.min' => 'Le commentaire doit contenir au moins :min caractères',
            'nation.required' => 'Le pays est obligatoire',
            'ville.required' => 'La ville est obligatoire'
        ]);
            $validated['favori'] = isset($validated['favori']) && $validated['favori'] ? 1 : 0;

            if ($validated['favori'] == 1) {
                $this->manageFavorites();
            }

            $commentaire = Commentaire::create($validated);
            $commentaire->favori = (bool) $commentaire->favori;

            return response()->json($commentaire, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur création commentaire: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la création du commentaire',
                'message' => $e->getMessage()
            ], 500);
        }
        }
        
    public function show(Commentaire $commentaire)
    {
        $commentaire->favori = (bool) $commentaire->favori;
        return response()->json($commentaire);
    }

    public function update(Request $request, Commentaire $commentaire)
    {
        try {
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'prenom' => 'sometimes|string|max:255',
                'type_client' => 'sometimes|in:Particuliers,Professionnels,Collectivités',
                'contenu' => 'sometimes|string|min:10',
                'favori' => 'sometimes|boolean',
                'nation' => 'sometimes|string|max:255',
                'ville' => 'sometimes|string|max:255',
            ]);

            if (isset($validated['favori'])) {
                $validated['favori'] = $validated['favori'] ? 1 : 0;
                if ($validated['favori'] == 1 && $commentaire->favori != 1) {
                    $this->manageFavorites();
                }
            }

            $commentaire->update($validated);
            $commentaire->favori = (bool) $commentaire->favori;

            return response()->json($commentaire);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour commentaire: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la mise à jour',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Commentaire $commentaire)
    {
        try {
            $commentaire->delete();
            return response()->json([
                'message' => 'Commentaire supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression commentaire: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la suppression',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function favorisParType($type_client)
    {
        try {
            $favoris = Commentaire::where('favori', 1)
                ->where('type_client', $type_client)
                ->orderBy('created_at', 'desc')
                ->take(2)
                ->get();

            $favoris->transform(function ($item) {
                $item->favori = (bool) $item->favori;
                return $item;
            });

            return response()->json($favoris);
        } catch (\Exception $e) {
            Log::error('Erreur récupération favoris par type: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des favoris par type',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function favoris()
    {
        try {
            $favoris = Commentaire::where('favori', true)
                ->latest('created_at')
                ->take(2)
                ->get();

            return response()->json($favoris);
        } catch (\Exception $e) {
            Log::error('Erreur récupération favoris: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur serveur',
                'message' => 'Impossible de récupérer les favoris'
            ], 500);
        }
    }

    private function manageFavorites()
    {
        $favorisCount = Commentaire::where('favori', true)->count();

        if ($favorisCount >= 2) {
            Commentaire::where('favori', true)
                ->oldest('created_at')
                ->limit($favorisCount - 1)
                ->update(['favori' => false]);
        }
    }
}
