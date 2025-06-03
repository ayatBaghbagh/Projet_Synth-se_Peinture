<?php
namespace App\Http\Controllers;

use App\Models\Devis;
use Illuminate\Http\Request;
use App\Models\Projet;

class DevisController extends Controller
{
   

    public function index()
    {
        return Devis::with('demandeDevis', 'client')->orderBy('created_at', 'desc')->get();
    }

    public function show($id)
    {
        return Devis::with('demandeDevis', 'client')->findOrFail($id);
    }

    public function destroy($id)
    {
        $devis = Devis::findOrFail($id);
        $devis->delete();

        return response()->json(['message' => 'Devis supprimé']);
    }
    public function updateStatus(Request $request, $id)
    {
        $devis = Devis::with('demandeDevis', 'client')->findOrFail($id);
        
        $request->validate([
            'statut' => 'required|in:en_attente,accepte,refuse',
            'motif_refus' => 'nullable|string|max:255'
        ]);
        
        $devis->statut = $request->statut;
        $projet = null;
        
        if ($request->statut === 'accepte') {
            $devis->date_acceptation = now();
            
            // Création automatique du projet avec toutes les colonnes nécessaires
            $projet = Projet::create([
                'id_client' => $devis->id_client,
                'titre' => 'Projet ' . ($devis->demandeDevis->description ?? 'Sans titre') . ' - ' . $devis->numero_devis,
                'image' => 'default-project.jpg', // Image par défaut
                'type_projet' => $devis->demandeDevis->type_travaux ?? 'Résidentiel',
                'date_d' => now(),
                'date_f' => now()->addDays($devis->delai_execution ?? 30), // Ajoute le délai d'exécution si existant
                'status' => 'encours',
                'id_devis' => $devis->id_devis,
                'favoris' => false,
                // created_at et updated_at seront automatiquement remplis
            ]);
            
            // Vous pouvez aussi ajouter des relations supplémentaires si nécessaire
            if ($devis->client) {
                $projet->client()->associate($devis->client);
            }
        }
        elseif ($request->statut === 'refuse') {
            $devis->date_refus = now();
            $devis->motif_refus = $request->motif_refus;
        }
        
        $devis->save();
        
        return response()->json([
            'success' => true,
            'message' => $request->statut === 'accepte' 
                ? 'Devis accepté et projet créé avec succès' 
                : 'Statut du devis mis à jour',
            'projet_id' => $projet ? $projet->id_projet : null,
            'projet' => $projet // Optionnel: renvoyer les données complètes du projet
        ]);
    }
}
