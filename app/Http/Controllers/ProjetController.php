<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Illuminate\Http\Request;

class ProjetController extends Controller
{
  public function index()
{
    // Récupère TOUS les projets
    $projets = Projet::all(); // Variable correctement nommée

    $projets->transform(function ($projet) {
        $projet->image = asset('storage/images/' . $projet->image);
        return $projet;
    });

    return response()->json($projets); // Retourne tous les projets
}
// Nouvelle méthode pour les favoris
    public function favoris() {
    try {
        $projets = Projet::where('favoris', true)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($projet) {
                return [
                    'id_projet' => $projet->id_projet,
                    'titre' => $projet->titre,
                    'image' => asset('storage/images/' . $projet->image),
                    'type_projet' => $projet->type_projet,
                    'favoris' => (bool)$projet->favoris
                ];
            });

        return response()->json($projets);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Erreur serveur',
            'message' => $e->getMessage()
        ], 500);
    }
}

    // Méthode pour basculer le favori
    public function toggleFavori(Projet $projet)
    {
        try {
            $projet->favoris = !$projet->favoris;
            $projet->save();

            if ($projet->favoris) {
                $this->manageFavorisLimit();
            }

            return response()->json([
                'message' => 'Statut favori mis à jour',
                'favoris' => (bool)$projet->favoris
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur de mise à jour',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function manageFavorisLimit()
    {
        $favorisCount = Projet::where('favoris', true)->count();

        if ($favorisCount > 3) {
            Projet::where('favoris', true)
                ->oldest('updated_at')
                ->limit($favorisCount - 3)
                ->update(['favoris' => false]);
        }
    }
    public function allFavoris()
{
    try {
        $projets = Projet::where('favoris', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($projet) {
                return [
                    'id_projet' => $projet->id_projet,
                    'titre' => $projet->titre,
                    'image' => asset('storage/images/' . $projet->image),
                    'type_projet' => $projet->type_projet,
                    'date_d' => $projet->date_d,
                    'date_f' => $projet->date_f,
                    'status' => $projet->status,
                    'favoris' => (bool)$projet->favoris
                ];
            });

        return response()->json($projets);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Erreur serveur',
            'message' => $e->getMessage()
        ], 500);
    }
}

    public function store(Request $request) {
    $data = $request->validate([
        'titre' => 'required',
        'image' => 'nullable|string',
        'type_projet' => 'required|in:Intérieur,Extérieur,Commercial,Résidentiel,Décoratif',
        'date_d' => 'required|date',
        'date_f' => 'nullable|date',
        'status' => 'required|in:encours,termine',
        'id_devis' => 'required|exists:devis,id_devis',
    ]);

    return Projet::create($data);
}


    public function show($id) { return Projet::findOrFail($id); }

    public function update(Request $request, $id) {
        $projet = Projet::findOrFail($id);
        $projet->update($request->all());
        return $projet;
    }

    public function destroy($id) {
        $projet = Projet::findOrFail($id);
        $projet->delete();
        return response()->json(['message' => 'Projet supprimé']);
    }
}
