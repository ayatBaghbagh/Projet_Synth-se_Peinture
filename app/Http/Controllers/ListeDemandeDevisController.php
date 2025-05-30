<?php

// app/Http/Controllers/Admin/ListeDemandeDevisController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DemandeDevis;
use App\Models\Devis;
use App\Models\Client;
use Illuminate\Http\Request;

class ListeDemandeDevisController extends Controller
{
    /**
     * Récupérer toutes les demandes de devis pour l'admin
     */
    public function index(Request $request)
    {
        $query = DemandeDevis::with(['client']);

        // Filtres
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('urgence_projet', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->whereHas('client', function($q) use ($request) {
                $q->where('nom', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('prenom', 'LIKE', '%' . $request->search . '%');
            });
        }

        // Tri
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $demandes = $query->get()->map(function($demande) {
            return [
                
                'id' => '#' . $demande->id_demandedevis,
            'id_demandedevis' => $demande->id_demandedevis,
            'client' => $demande->client
                ? $demande->client->nom . ' ' . $demande->client->prenom 
                : 'Client anonyme',
            'dateCreation' => $demande->date_demande
                ? $demande->date_demande->format('Y-m-d')
                : 'N/A', // Gérer les dates nulles
                'typeProjet' => ucfirst($demande->type_projet),
                'surface' => $demande->surface . ' m²',
                'description' => $demande->description,
                'contact' => $demande->client ? $demande->client->telephone : 'N/A',
                'status' => $demande->urgence_projet,
                'statut_demande' => $demande->statut ?? 'en_attente',
                'has_devis' => $demande->devis ? true : false
            ];
        });


        return response()->json([
            'success' => true,
            'data' => $demandes,
            'total' => $demandes->count()
        ]);
    }

    /**
     * Créer un devis à partir d'une demande
     */
    public function creerDevis(Request $request, $id)
    {
        $demande = DemandeDevis::findOrFail($id);
        
        $data = $request->validate([
            'prix_total' => 'required|numeric|min:0',
            'description_travaux' => 'required|string',
            'delai_execution' => 'required|string',
            'validite_devis' => 'required|integer|min:1',
            'notes_supplementaires' => 'nullable|string'
        ]);

        // Générer un numéro de devis unique
         $count = Devis::whereYear('created_at', now()->year)->count() + 1;
    $numeroDevis = 'DEV-' . now()->year . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);


        $devis = Devis::create([
            'numero_devis' => $numeroDevis,
            'date_creation' => now(),
            'prix_total' => $data['prix_total'],
            'description_travaux' => $data['description_travaux'],
            'delai_execution' => $data['delai_execution'],
            'validite_devis' => $data['validite_devis'],
            'notes_supplementaires' => $data['notes_supplementaires'] ?? null,
            'statut' => 'en_attente',
            'id_demandedevis' => $demande->id_demandedevis,
            'id_client' => $demande->id_client
        ]);

        // Mettre à jour le statut de la demande
        $demande->update(['statut' => 'devis_envoye']);

        return response()->json([
            'success' => true,
            'message' => 'Devis créé et envoyé avec succès',
            'data' => $devis->load('demandeDevis')
        ]);
    }
}
