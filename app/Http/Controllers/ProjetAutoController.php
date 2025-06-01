<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class ProjetAutoController extends Controller
{
    public function synchroniserProjets()
    {
        try {
            Log::info('=== DÉBUT SYNCHRONISATION PROJETS ===');
            
            // 1. Récupérer TOUS les devis acceptés (sans relation)
            $devisAcceptes = Devis::where('statut', 'accepte')->get();
            
            Log::info('Nombre de devis avec statut accepté trouvés: ' . count($devisAcceptes));
            
            // Afficher les IDs des devis trouvés
            $idsDevis = $devisAcceptes->pluck('id_devis')->toArray();
            Log::info('IDs des devis acceptés: ' . implode(', ', $idsDevis));
            
            $ajoutes = 0;
            $existants = 0;
            $erreurs = [];

            foreach ($devisAcceptes as $devis) {
                Log::info("--- Traitement du devis ID: {$devis->id_devis} ---");
                Log::info("Client ID: {$devis->id_client}, Numéro: {$devis->numero_devis}");
                
                try {
                    // Vérifier si un projet existe déjà avec cet id_devis
                    $projetExistant = Projet::where('id_devis', $devis->id_devis)->first();
                    
                    if ($projetExistant) {
                        Log::info("Projet déjà existant (ID: {$projetExistant->id_projet}) pour le devis ID: {$devis->id_devis}");
                        $existants++;
                        continue;
                    }
                    
                    Log::info("Aucun projet existant trouvé, création en cours...");
                    
                    // Validation des données requises
                    if (empty($devis->id_client)) {
                        $erreurs[] = "Devis ID {$devis->id_devis}: id_client manquant";
                        Log::warning("id_client manquant pour le devis {$devis->id_devis}");
                        continue;
                    }
                    
                    if (empty($devis->numero_devis)) {
                        $erreurs[] = "Devis ID {$devis->id_devis}: numero_devis manquant";
                        Log::warning("numero_devis manquant pour le devis {$devis->id_devis}");
                        continue;
                    }
                    
                    // Création du projet avec données exactes de votre structure
                    $projetData = [
                        'id_client' => $devis->id_client,
                        'id_devis' => $devis->id_devis,
                        'titre' => 'Projet généré pour le devis #' . $devis->numero_devis,
                        'type_projet' => 'Résidentiel', // Utilise exactement vos enum values
                        'date_d' => now()->format('Y-m-d'),
                        'date_f' => now()->addWeeks(2)->format('Y-m-d'),
                        'status' => 'encours',
                        'image' => 'default.jpg',
                        'favoris' => 0
                    ];
                    
                    Log::info('Données du projet à créer: ' . json_encode($projetData));
                    
                    $projet = Projet::create($projetData);
                    
                    $ajoutes++;
                    Log::info("✅ Projet créé avec succès - ID: {$projet->id_projet} pour le devis ID: {$devis->id_devis}");
                    
                } catch (Exception $e) {
                    $erreurs[] = "Erreur pour le devis ID {$devis->id_devis}: " . $e->getMessage();
                    Log::error("❌ Erreur création projet pour devis {$devis->id_devis}: " . $e->getMessage());
                    Log::error("Stack trace: " . $e->getTraceAsString());
                }
            }
            
            Log::info('=== FIN SYNCHRONISATION PROJETS ===');
            Log::info("Résultats: {$ajoutes} ajoutés, {$existants} existants, " . count($erreurs) . " erreurs");

            // Vérification finale
            $totalProjets = Projet::count();
            Log::info("Nombre total de projets en base après sync: {$totalProjets}");

            $response = [
                'success' => true,
                'message' => 'Synchronisation terminée avec succès.',
                'projets_ajoutes' => $ajoutes,
                'projets_existants' => $existants,
                'devis_traites' => count($devisAcceptes),
                'total_projets_en_base' => $totalProjets,
                'timestamp' => now()->toDateTimeString()
            ];

            if (!empty($erreurs)) {
                $response['erreurs'] = $erreurs;
                $response['success'] = count($erreurs) < count($devisAcceptes);
            }

            return response()->json($response);

        } catch (Exception $e) {
            Log::error('❌ ERREUR CRITIQUE lors de la synchronisation: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur critique lors de la synchronisation des projets.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Méthode de diagnostic pour comprendre le problème
     */
    public function diagnostiquer()
    {
        try {
            $diagnostic = [];
            
            // 1. Vérifier les devis acceptés
            $devisAcceptes = Devis::whereRaw("LOWER(statut) = 'accepte'")->get();
            $diagnostic['devis_acceptes'] = [
                'count' => count($devisAcceptes),
                'ids' => $devisAcceptes->pluck('id_devis')->toArray(),
                'details' => $devisAcceptes->map(function($devis) {
                    return [
                        'id_devis' => $devis->id_devis,
                        'numero_devis' => $devis->numero_devis,
                        'id_client' => $devis->id_client,
                        'statut' => $devis->statut
                    ];
                })->toArray()
            ];
            
            // 2. Vérifier les projets existants
            $projets = Projet::all();
            $diagnostic['projets_existants'] = [
                'count' => count($projets),
                'ids_devis_lies' => $projets->pluck('id_devis')->toArray()
            ];
            
            // 3. Vérifier les structures de tables
            $diagnostic['table_devis_columns'] = DB::getSchemaBuilder()->getColumnListing('devis');
            $diagnostic['table_projets_columns'] = DB::getSchemaBuilder()->getColumnListing('projets');
            
            // 4. Vérifier les devis sans projets
            $devisSansProjets = [];
            foreach ($devisAcceptes as $devis) {
                $projetExists = Projet::where('id_devis', $devis->id_devis)->exists();
                if (!$projetExists) {
                    $devisSansProjets[] = $devis->id_devis;
                }
            }
            $diagnostic['devis_sans_projets'] = $devisSansProjets;
            
            return response()->json($diagnostic);
            
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du diagnostic: ' . $e->getMessage()
            ], 500);
        }
    }
}