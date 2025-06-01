<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\Projet;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ClientDevisController extends Controller
{
    /**
     * Constructor - Appliquer la protection CSRF
     */
    public function __construct()
    {
        // Désactiver CSRF pour certaines méthodes si nécessaire
        // $this->middleware('throttle:60,1');
    }

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

            // Ajouter des informations calculées
            $devis->map(function ($d) {
                $d->is_expired = $d->is_expired;
                $d->date_expiration = $d->date_expiration;
                return $d;
            });

            return response()->json([
                'success' => true,
                'devis' => $devis
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération devis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des devis',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'un devis (accepter/refuser)
     */
    public function updateStatus(Request $request, $devisId)
    {
        // Utiliser une transaction pour garantir la cohérence des données
        DB::beginTransaction();
        
        try {
            $clientId = Auth::guard('client')->id();
            
            if (!$clientId) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            $validated = $request->validate([
                'statut' => 'required|in:accepte,refuse',
                'motif_refus' => 'nullable|string|max:500'
            ]);

            // Vérifier que le devis appartient au client
            $devis = Devis::where('id_devis', $devisId)
                ->where('id_client', $clientId)
                ->where('statut', 'en_attente')
                ->first();

            if (!$devis) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Devis non trouvé ou déjà traité'
                ], 404);
            }

            if ($devis->is_expired) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Ce devis a expiré'
                ], 400);
            }

            // Mettre à jour le statut du devis
            $devis->statut = $validated['statut'];
            
            $projet = null;
            
            if ($validated['statut'] === 'accepte') {
                Log::info("Début acceptation devis ID: {$devis->id_devis}");
                
                $devis->date_acceptation = now();
                $devis->save(); // Sauvegarder d'abord le devis
                
                Log::info("Devis sauvegardé, création du projet...");
                
                // Créer automatiquement un projet
                $projet = $this->createProjectFromDevis($devis);
                
                if (!$projet) {
                    DB::rollBack();
                    Log::error("Échec création projet pour devis ID: {$devis->id_devis}");
                    return response()->json([
                        'success' => false,
                        'message' => 'Erreur lors de la création du projet'
                    ], 500);
                }
                
                Log::info("Projet créé avec succès. ID Projet: {$projet->id_projet}");
                
            } else if ($validated['statut'] === 'refuse') {
                $devis->date_refus = now();
                $devis->motif_refus = $validated['motif_refus'];
                $devis->save();
            }

            // Confirmer la transaction
            DB::commit();

            $message = $validated['statut'] === 'accepte' 
                ? 'Devis accepté avec succès. Un projet a été créé automatiquement.' 
                : 'Devis refusé avec succès.';

            return response()->json([
                'success' => true,
                'message' => $message,
                'devis' => $devis->fresh(['demandeDevis', 'client']),
                'projet' => $projet ? $projet->fresh() : null,
                'projet_id' => $projet ? $projet->id_projet : null
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour statut devis: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
            ], 500);
        }
    }

    /**
     * Créer un projet à partir d'un devis accepté
     */
    private function createProjectFromDevis(Devis $devis)
    {
        try {
            Log::info("Tentative de création de projet pour le devis: " . $devis->id_devis);

            // Vérifier qu'un projet n'existe pas déjà pour ce devis
            $existingProject = Projet::where('id_devis', $devis->id_devis)->first();
            if ($existingProject) {
                Log::info("Projet existe déjà pour ce devis: " . $existingProject->id_projet);
                return $existingProject;
            }

            // Créer le titre du projet
            $titre = $devis->description_travaux ?: 
                    ($devis->demandeDevis ? $devis->demandeDevis->description : 'Projet sans titre');
            
            // Limiter la longueur du titre
            $titre = strlen($titre) > 100 ? substr($titre, 0, 97) . '...' : $titre;

            // Déterminer le type de projet
            $typeProjet = 'Résidentiel';
            if ($devis->demandeDevis && $devis->demandeDevis->type_travaux) {
                $typeProjet = $this->mapTypeProjet($devis->demandeDevis->type_travaux);
            }

            // Calculer la date de fin estimée
            $dateFin = null;
            if ($devis->delai_execution) {
                $dateFin = now()->addDays($devis->delai_execution);
            }

            // Données pour créer le projet
            $projetData = [
                'titre' => $titre,
                'type_projet' => $typeProjet,
                'date_d' => now(),
                'date_f' => $dateFin,
                'status' => 'encours',
                'id_devis' => $devis->id_devis,
                'id_client' => $devis->id_client,
                'favoris' => false,
                'image' => null
            ];

            Log::info("Données du projet à créer: ", $projetData);

            // Créer le projet
            $projet = Projet::create($projetData);

            if (!$projet) {
                throw new \Exception("Échec de la création du projet en base");
            }

            Log::info("Projet créé avec succès: " . $projet->id_projet);
            return $projet;

        } catch (\Exception $e) {
            Log::error("Erreur création projet: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            throw $e;
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
            'decoratif' => 'Décoratif',
            'renovation' => 'Résidentiel',
            'neuf' => 'Résidentiel'
        ];

        $key = strtolower(trim($typeTravaux));
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

            // Ici vous pouvez implémenter la génération PDF avec TCPDF ou DomPDF
            // Pour l'instant, retourner les données du devis
            
            return response()->json([
                'success' => true,
                'message' => 'Génération PDF à implémenter',
                'devis' => $devis
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement PDF: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
            ], 500);
        }
    }
}