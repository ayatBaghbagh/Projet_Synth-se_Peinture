<?php

// app/Http/Controllers/TacheProjetController.php

namespace App\Http\Controllers;

use App\Models\TacheProjet;
use Illuminate\Http\Request;


class TacheProjetController extends Controller
{
    public function index()
    {
        $taches = TacheProjet::all();
        return view('taches-projet.index', compact('taches'));
    }

    public function create(Request $request)
    {
        $typeProjet = $request->input('type_projet'); // 'grand' ou 'petit'
        return view('taches-projet.create', compact('typeProjet'));
    }

  public function store(Request $request)
{
    $validated = $request->validate([
        'nom_tache' => 'required|string|max:255',
        'description' => 'nullable|string',
        'date_debut' => 'required|date',
        'date_fin' => 'required|date|after_or_equal:date_debut',
        'statut' => 'required|string|in:a_faire,en_cours,termine',
        'notes' => 'nullable|string',
        'type_projet' => 'required|string|in:grand,petit',
        'projet_id' => 'required|exists:projets,id_projet',
        'assignee_id' => 'nullable|exists:users,id',
    ]);

    $tache = TacheProjet::create($validated);
    
    return response()->json([
        'success' => true,
        'message' => 'Tâche créée avec succès',
        'data' => $tache
    ], 201);
}  public function getTachesByProjet($projetId)
    {
        $taches = TacheProjet::where('projet_id', $projetId)
            ->orderBy('date_debut', 'asc')
            ->get();

        return response()->json($taches);
    }
// Met à jour une tâche existante
    public function update(Request $request, $id)
    {
        $tache = TacheProjet::findOrFail($id);

        $validated = $request->validate([
            'nom_tache' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'statut' => 'required|string|in:a_faire,en_cours,terminee',
            'notes' => 'nullable|string',
            'type_projet' => 'required|string|in:grand,petit',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $tache->update($validated);

        return response()->json([
            'message' => 'Tâche mise à jour avec succès.',
            'tache' => $tache
        ]);
    }

    // Supprime une tâche
    public function destroy($id)
    {
        $tache = TacheProjet::findOrFail($id);
        $tache->delete();

        return response()->json([
            'message' => 'Tâche supprimée avec succès.'
        ]);
    }

}