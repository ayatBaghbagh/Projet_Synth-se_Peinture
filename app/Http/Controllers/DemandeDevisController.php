<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DemandeDevis;
use App\Models\Devis;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class DemandeDevisController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;

        // Corrigé : permet l’usage de middleware
        $this->middleware('auth:sanctum')->except(['store']);
    }


    public function index()
    {
        return DemandeDevis::with('client')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string',
            'surface' => 'required|numeric',
            'type_projet' => 'required|string',
            'urgence_projet' => 'required|in:urgent,normal,flexible',
            'couleur_peinture' => 'nullable|string',
            'finition' => 'nullable|string',
        ]);

        $data['date_demande'] = now();
        $data['statut'] = 'en_attente';

        // Si connecté → lier le client, sinon null
        $data['id_client'] = auth('sanctum')->check() ? auth('sanctum')->id() : null;

        $demande = DemandeDevis::create($data);

        if ($this->notificationService) {
            $this->notificationService->creerNotificationDemandeDevis($demande);
        }

        return response()->json([
            'success' => true,
            'message' => 'Demande de devis créée avec succès',
            'data' => $demande->load('client')
        ], 201);
    }

    public function show($id)
    {
        return DemandeDevis::with('client')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $demande = DemandeDevis::findOrFail($id);
        $demande->update($request->all());
        return $demande->load('client');
    }

    public function destroy($id)
    {
        $demande = DemandeDevis::findOrFail($id);
        $demande->delete();
        return response()->json(['message' => 'Demande supprimée']);
    }

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

        $numeroDevis = 'DEV-' . date('Y') . '-' . str_pad(
            Devis::whereYear('created_at', date('Y'))->count() + 1,
            3,
            '0',
            STR_PAD_LEFT
        );

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
            'id_client' => $demande->id_client,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Devis créé avec succès',
            'data' => $devis
        ]);
    }

    public function refuser(Request $request, $id)
    {
        $demande = DemandeDevis::findOrFail($id);

        $data = $request->validate([
            'motif_refus' => 'required|string'
        ]);

        $demande->update([
            'statut' => 'refuse',
            'motif_refus' => $data['motif_refus'],
            'date_refus' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande refusée',
            'data' => $demande
        ]);
    }
}
