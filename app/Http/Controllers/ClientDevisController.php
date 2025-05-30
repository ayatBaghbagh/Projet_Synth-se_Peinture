<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\Projet;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientDevisController extends Controller
{
    /**
     * Récupérer les devis du client connecté
     */
    public function mesDevis()
    {
        try {
            // Récupérer l'ID du client depuis le token/session
            $clientId = Auth::guard('client')->id();
            
            if (!$clientId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            $devis = Devis::with(['demandeDevis', 'client'])
                ->where('id_client', $clientId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'devis' => $devis
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des devis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'un devis (accepter/refuser)
     */
    public function updateStatus(Request $request, $devisId)
    {
        try {
            $clientId = Auth::guard('client')->id();
            
            if (!$clientId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            $request->validate([
                'statut' => 'required|in:accepte,refuse',
                'motif_refus' => 'nullable|string|max:500'
            ]);

            // Vérifier que le devis appartient au client
            $devis = Devis::where('id_devis', $devisId)
                ->where('id_client', $clientId)
                ->where('statut', 'en_attente')
                ->first();

            if (!$devis) {
                return response()->json([
                    'success' => false,
                    'message' => 'Devis non trouvé ou déjà traité'
                ], 404);
            }

            // Vérifier si le devis n'est pas expiré
            if ($devis->is_expired) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce devis a expiré'
                ], 400);
            }

            // Mettre à jour le statut
            $devis->statut = $request->statut;
            
            if ($request->statut === 'accepte') {
                $devis->date_acceptation = now();
                
                // Créer automatiquement un projet
                $this->createProjectFromDevis($devis);
                
            } else if ($request->statut === 'refuse') {
                $devis->date_refus = now();
                $devis->motif_refus = $request->motif_refus;
            }

            $devis->save();

            return response()->json([
                'success' => true,
                'message' => $request->statut === 'accepte' ? 'Devis accepté avec succès' : 'Devis refusé',
                'devis' => $devis->fresh(['demandeDevis', 'client'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer automatiquement un projet à partir d'un devis accepté
     */
    private function createProjectFromDevis(Devis $devis)
{
    try {
        // Calculer la date de fin estimée (date actuelle + délai d'exécution)
        $dateFin = $devis->delai_execution 
            ? now()->addDays($devis->delai_execution)
            : now()->addDays(30); // Valeur par défaut

        // Créer le projet
        $projet = Projet::create([
            'titre' => $devis->description_travaux ?: 
                     ($devis->demandeDevis ? $devis->demandeDevis->description : 'Projet sans titre'),
            'type_projet' => $this->mapTypeProjet($devis->demandeDevis->type_travaux ?? 'residentiel'),
            'date_d' => now(),
            'date_f' => $dateFin,
            'status' => 'encours',
            'id_devis' => $devis->id_devis,
            'id_client' => $devis->id_client, // Ajouter le client
            'prix_total' => $devis->prix_total, // Conserver le prix
            'surface' => $devis->demandeDevis->surface ?? null,
            'favoris' => false,
            'image' => null
        ]);

        // Log pour débogage
        \Log::info("Projet créé: ID {$projet->id_projet} pour le devis {$devis->id_devis}");

        return $projet;

    } catch (\Exception $e) {
        \Log::error("Erreur création projet: " . $e->getMessage());
        throw $e; // Remonter l'erreur
    }
}

    /**
     * Mapper le type de travaux vers le type de projet
     */
    private function mapTypeProjet($typeTravaux)
    {
        $mapping = [
            'interieur' => 'Intérieur',
            'exterieur' => 'Extérieur',
            'commercial' => 'Commercial',
            'residentiel' => 'Résidentiel',
            'decoratif' => 'Décoratif'
        ];

        $key = strtolower($typeTravaux);
        return $mapping[$key] ?? 'Résidentiel';
    }

    /**
     * Télécharger un devis en PDF
     */
    public function downloadPdf($devisId)
    {
        try {
            $clientId = Auth::guard('client')->id();
            
            $devis = Devis::with(['demandeDevis', 'client'])
                ->where('id_devis', $devisId)
                ->where('id_client', $clientId)
                ->first();

            if (!$devis) {
                return response()->json([
                    'success' => false,
                    'message' => 'Devis non trouvé'
                ], 404);
            }

            // Ici vous pouvez implémenter la génération PDF
            // Pour l'instant, retourner les données du devis
            
            return response()->json([
                'success' => true,
                'message' => 'Génération PDF à implémenter',
                'devis' => $devis
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}