<?php
namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\Client;
use App\Models\Projet;
use App\Models\DemandeDevis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClientAuthController extends Controller
{
    // Inscription + connexion automatique
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'adresse' => 'required|string|max:500',
                'email' => 'required|email|unique:clients,email',
                'password' => 'required|string|min:6',
                'telephone' => 'nullable|string|max:20',
                'entreprise' => 'nullable|string|max:255',
            ]);

            $validated['password'] = Hash::make($validated['password']);

            $client = Client::create($validated);

            // Créer un token d'authentification avec le bon provider
            $token = $client->createToken('client-token', ['*'], null)->plainTextToken;

            Log::info('Client créé avec succès: ' . $client->id_client);

            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie',
                'client' => [
                    'id' => $client->id_client,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'email' => $client->email,
                    'telephone' => $client->telephone,
                    'entreprise' => $client->entreprise,
                    'adresse' => $client->adresse,
                ],
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'inscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Connexion
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $client = Client::where('email', $validated['email'])->first();

            if (!$client || !Hash::check($validated['password'], $client->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Identifiants invalides'
                ], 401);
            }

            // Supprimer les anciens tokens
            $client->tokens()->delete();

            // Créer un nouveau token
            $token = $client->createToken('client-token', ['*'], null)->plainTextToken;

            Log::info('Client connecté: ' . $client->id_client);

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'client' => [
                    'id' => $client->id_client,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'email' => $client->email,
                    'telephone' => $client->telephone,
                    'entreprise' => $client->entreprise,
                    'adresse' => $client->adresse,
                ],
                'token' => $token
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la connexion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la connexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Récupérer les devis du client connecté
    public function mesDevis(Request $request)
    {
        try {
            // Récupérer le client authentifié
            $client = auth('sanctum')->user();
            
            if (!$client) {
                Log::warning('Tentative d\'accès aux devis sans authentification');
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            // Vérifier que c'est bien un client (pas un admin)
            if (!$client instanceof \App\Models\Client) {
                Log::warning('Tentative d\'accès aux devis client par un utilisateur non-client: ' . get_class($client));
                return response()->json([
                    'success' => false,
                    'message' => 'Accès refusé - utilisateur non autorisé'
                ], 403);
            }

            Log::info('Récupération des devis pour le client: ' . $client->id_client);

            // Récupérer tous les devis du client avec les relations
            $devis = Devis::with(['demandeDevis', 'client'])
                ->where('id_client', $client->id_client)
                ->orderBy('date_creation', 'desc')
                ->get();

            Log::info('Nombre de devis trouvés pour le client ' . $client->id_client . ': ' . $devis->count());

            // Debug: afficher quelques infos sur les devis trouvés
            foreach ($devis as $d) {
                Log::info('Devis trouvé: ID=' . $d->id_devis . ', Client=' . $d->id_client . ', Statut=' . $d->statut);
            }

            // Formater les données pour le frontend
            $devisFormatted = $devis->map(function ($devis) {
                return [
                    'id_devis' => $devis->id_devis,
                    'numero_devis' => $devis->numero_devis,
                    'description_travaux' => $devis->description_travaux,
                    'prix_total' => $devis->prix_total,
                    'statut' => $devis->statut,
                    'date_creation' => $devis->date_creation,
                    'date_acceptation' => $devis->date_acceptation,
                    'date_refus' => $devis->date_refus,
                    'motif_refus' => $devis->motif_refus,
                    'validite_devis' => $devis->validite_devis ?? 30, // Valeur par défaut
                    'delai_execution' => $devis->delai_execution,
                    'demande_devis' => $devis->demandeDevis ? [
                        'id' => $devis->demandeDevis->id_demande,
                        'description' => $devis->demandeDevis->description,
                        'surface' => $devis->demandeDevis->surface,
                        'type_travaux' => $devis->demandeDevis->type_travaux,
                        'budget_estime' => $devis->demandeDevis->budget_estime,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Devis récupérés avec succès',
                'devis' => $devisFormatted,
                'count' => $devisFormatted->count(),
                'client_id' => $client->id_client // Pour debug
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des devis: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des devis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Fonction privée pour créer un projet à partir d'un devis accepté
    private function creerProjetDepuisDevis($devis, $client)
    {
        try {
            // Vérifier qu'un projet n'existe pas déjà pour ce devis
            $projetExistant = Projet::where('id_devis', $devis->id_devis)->first();
            if ($projetExistant) {
                Log::info('Projet existe déjà pour le devis: ' . $devis->id_devis);
                return $projetExistant;
            }

            // Créer le projet
            $projet = new Projet();
            $projet->id_devis = $devis->id_devis;
            $projet->id_client = $client->id_client;
            
            // Titre du projet basé sur la description du devis ou de la demande
            $titre = $devis->description_travaux;
            if (!$titre && $devis->demandeDevis) {
                $titre = $devis->demandeDevis->description;
            }
            if (!$titre) {
                $titre = 'Projet de peinture';
            }
            $projet->titre = substr($titre, 0, 255); // Limiter la longueur
            
            // Description
            $description = $devis->description_travaux ?? 'Projet créé automatiquement suite à l\'acceptation du devis';
            $projet->description = $description;
            
            // Type de projet
            $typeProjet = 'peinture'; // Valeur par défaut
            if ($devis->demandeDevis && $devis->demandeDevis->type_travaux) {
                $typeProjet = strtolower($devis->demandeDevis->type_travaux);
            }
            $projet->type_projet = $typeProjet;
            
            // Statut initial
            $projet->status = 'planifie'; // ou 'en_attente', selon votre logique
            
            // Dates
            $projet->date_d = now(); // Date de début = maintenant
            
            // Calculer la date de fin basée sur le délai d'exécution
            if ($devis->delai_execution) {
                $projet->date_f = now()->addDays($devis->delai_execution);
            } else {
                $projet->date_f = now()->addDays(30); // 30 jours par défaut
            }
            
            // Autres champs
            $projet->favoris = false;
            $projet->created_at = now();
            $projet->updated_at = now();
            
            $projet->save();
            
            Log::info('Projet créé avec succès: ID=' . $projet->id_projet . ' pour le devis: ' . $devis->id_devis);
            
            return $projet;
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création du projet: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    // Mettre à jour le statut d'un devis
    public function updateDevisStatus(Request $request, $id)
    {
        try {
            $client = auth('sanctum')->user();
            
            if (!$client || !$client instanceof \App\Models\Client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            $validated = $request->validate([
                'statut' => 'required|in:accepte,refuse',
                'motif_refus' => 'nullable|string|max:500'
            ]);

            // Utiliser une transaction pour assurer la cohérence
            return DB::transaction(function () use ($client, $id, $validated) {
                $devis = Devis::with('demandeDevis')
                              ->where('id_devis', $id)
                              ->where('id_client', $client->id_client)
                              ->first();

                if (!$devis) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Devis non trouvé ou non accessible'
                    ], 404);
                }

                // Vérifier que le devis est en attente
                if ($devis->statut !== 'en_attente') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce devis ne peut plus être modifié'
                    ], 400);
                }

                // Mettre à jour le statut du devis
                $devis->statut = $validated['statut'];
                
                $projet = null;
                $projetId = null;
                
                if ($validated['statut'] === 'accepte') {
                    $devis->date_acceptation = now();
                    $devis->date_refus = null;
                    $devis->motif_refus = null;
                    
                    // Créer le projet automatiquement
                    try {
                        $projet = $this->creerProjetDepuisDevis($devis, $client);
                        $projetId = $projet->id_projet;
                        Log::info('Projet créé automatiquement: ID=' . $projetId . ' pour le devis accepté: ' . $id);
                    } catch (\Exception $e) {
                        Log::error('Erreur lors de la création automatique du projet: ' . $e->getMessage());
                        // Ne pas faire échouer la transaction, mais log l'erreur
                    }
                    
                } else {
                    $devis->date_refus = now();
                    $devis->date_acceptation = null;
                    $devis->motif_refus = $validated['motif_refus'] ?? null;
                }

                $devis->save();

                Log::info("Devis {$id} {$validated['statut']} par le client {$client->id_client}");

                return response()->json([
                    'success' => true,
                    'message' => 'Statut du devis mis à jour avec succès',
                    'devis' => [
                        'id_devis' => $devis->id_devis,
                        'statut' => $devis->statut,
                        'date_acceptation' => $devis->date_acceptation,
                        'date_refus' => $devis->date_refus,
                        'motif_refus' => $devis->motif_refus,
                    ],
                    'projet_id' => $projetId, // Retourner l'ID du projet créé
                    'projet_cree' => $projet !== null
                ]);
            });

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du devis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du devis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Récupérer les projets du client
    public function mesProjets(Request $request)
    {
        try {
            $client = auth('sanctum')->user();
            
            if (!$client || !$client instanceof \App\Models\Client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            $projets = Projet::with(['devis', 'client'])
                ->where('id_client', $client->id_client)
                ->orderBy('date_creation', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Projets récupérés avec succès',
                'projets' => $projets,
                'count' => $projets->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des projets: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des projets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Récupérer le profil du client connecté
    public function profile(Request $request)
    {
        try {
            $client = auth('sanctum')->user();
            
            if (!$client || !$client instanceof \App\Models\Client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'client' => [
                    'id' => $client->id_client,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'email' => $client->email,
                    'telephone' => $client->telephone,
                    'entreprise' => $client->entreprise,
                    'adresse' => $client->adresse,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du profil: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Mettre à jour le profil
    public function updateProfile(Request $request)
    {
        try {
            $client = auth('sanctum')->user();
            
            if (!$client || !$client instanceof \App\Models\Client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            $validated = $request->validate([
                'nom' => 'sometimes|required|string|max:255',
                'prenom' => 'sometimes|required|string|max:255',
                'adresse' => 'sometimes|required|string|max:500',
                'email' => 'sometimes|required|email|unique:clients,email,' . $client->id_client . ',id_client',
                'telephone' => 'nullable|string|max:20',
                'entreprise' => 'nullable|string|max:255',
                'password' => 'nullable|string|min:6'
            ]);

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $client->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'client' => [
                    'id' => $client->id_client,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'email' => $client->email,
                    'telephone' => $client->telephone,
                    'entreprise' => $client->entreprise,
                    'adresse' => $client->adresse,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Déconnexion
    public function logout(Request $request)
    {
        try {
            $client = auth('sanctum')->user();
            
            if ($client) {
                // Supprimer tous les tokens du client
                $client->tokens()->delete();
                Log::info('Client déconnecté: ' . $client->id_client);
            }

            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la déconnexion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Test de connexion API
    public function test()
    {
        return response()->json([
            'success' => true,
            'message' => 'API fonctionne correctement',
            'timestamp' => now(),
            'server_time' => date('Y-m-d H:i:s'),
            'auth_user' => auth('sanctum')->user() ? [
                'id' => auth('sanctum')->user()->id_client ?? auth('sanctum')->user()->id,
                'type' => get_class(auth('sanctum')->user())
            ] : null
        ]);
    }

    // Debug pour vérifier l'authentification
    public function debugAuth(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            $token = $request->bearerToken();
            
            return response()->json([
                'success' => true,
                'debug' => [
                    'token_present' => !!$token,
                    'token_preview' => $token ? substr($token, 0, 10) . '...' : null,
                    'user_authenticated' => !!$user,
                    'user_type' => $user ? get_class($user) : null,
                    'user_id' => $user ? ($user->id_client ?? $user->id) : null,
                    'headers' => $request->headers->all(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'debug' => [
                    'token_present' => !!$request->bearerToken(),
                    'headers' => $request->headers->all(),
                ]
            ]);
        }
    }

    // Récupérer les projets du client avec les données du devis
    public function mesProjetsC(Request $request)
    {
        try {
            $client = auth('sanctum')->user();
            
            if (!$client || !$client instanceof \App\Models\Client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client non authentifié'
                ], 401);
            }

            Log::info('Récupération des projets pour le client: ' . $client->id_client);

            // Récupérer les projets du client avec les relations devis et client
            $projets = Projet::with(['devis', 'client'])
                ->where('id_client', $client->id_client)
                ->orderBy('date_d', 'desc')
                ->get();

            Log::info('Nombre de projets trouvés pour le client ' . $client->id_client . ': ' . $projets->count());

            // Formater les données pour le frontend
            $projetsFormatted = $projets->map(function ($projet) {
                return [
                    'id_projet' => $projet->id_projet,
                    'titre' => $projet->titre,
                    'description' => $projet->description ?? 'Projet de peinture',
                    'type_projet' => $projet->type_projet,
                    'status' => $projet->status,
                    'date_d' => $projet->date_d,
                    'date_f' => $projet->date_f,
                    'adresse' => optional($projet->client)->adresse ?? 'Non spécifiée',
                    'budget' => $projet->devis ? $projet->devis->prix_total : 0,
                    'image' => $projet->image ? asset('storage/images/' . $projet->image) : null,
                    'favoris' => (bool)$projet->favoris,
                    'devis' => $projet->devis ? [
                        'id_devis' => $projet->devis->id_devis,
                        'numero_devis' => $projet->devis->numero_devis,
                        'description_travaux' => $projet->devis->description_travaux,
                        'prix_total' => $projet->devis->prix_total,
                        'statut' => $projet->devis->statut,
                        'date_creation' => $projet->devis->date_creation,
                        'delai_execution' => $projet->devis->delai_execution,
                    ] : null,
                    'client' => [
                        'nom' => $projet->client->nom ?? '',
                        'prenom' => $projet->client->prenom ?? '',
                        'adresse' => $projet->client->adresse ?? '',
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Projets récupérés avec succès',
                'projets' => $projetsFormatted,
                'count' => $projetsFormatted->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des projets: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des projets',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}