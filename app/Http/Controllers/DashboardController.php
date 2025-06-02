<?php

namespace App\Http\Controllers;

use App\Models\DemandeDevis;
use App\Models\Client;
use App\Models\Projet;
use App\Models\Contact;
use App\Models\Commentaire;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $data = [
                'stats' => $this->getStats(),
                'recent_activities' => $this->getRecentActivities(),
                'pending_demands' => $this->getPendingDemands(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données du dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getStats()
    {
        return [
            'total_demandes' => DemandeDevis::count(),
            'demandes_en_attente' => DemandeDevis::where('statut', 'en_attente')->count(),
            'total_clients' => Client::count(),
            'total_projets' => Projet::count(),
            'projets_termines' => Projet::where('status', 'termine')->count(),
            'nouveaux_contacts' => Contact::whereDate('created_at', Carbon::today())->count(),
            'total_commentaires' => Commentaire::count(),
        ];
    }

    private function getRecentActivities()
    {
        $activities = [];

        // Dernières demandes de devis
        $lastDemandes = DemandeDevis::with('client')->latest()->take(1)->get();
        foreach ($lastDemandes as $demande) {
            $activities[] = [
                'type' => 'Nouvelle demande de devis',
                'client' => $demande->client ? $demande->client->nom . ' ' . $demande->client->prenom : 'Client anonyme',
                'date' => $demande->created_at->format('Y-m-d H:i')
            ];
        }

        // Derniers clients inscrits
        $lastClients = Client::latest()->take(1)->get();
        foreach ($lastClients as $client) {
            $activities[] = [
                'type' => 'Nouvel utilisateur',
                'client' => $client->nom . ' ' . $client->prenom,
                'date' => $client->created_at->format('Y-m-d H:i')
            ];
        }

        // Derniers contacts
        $lastContacts = Contact::latest()->take(1)->get();
        foreach ($lastContacts as $contact) {
            $activities[] = [
                'type' => 'Nouveau contact',
                'client' => $contact->nom . ' ' . $contact->prenom,
                'date' => $contact->created_at->format('Y-m-d H:i')
            ];
        }

        // Derniers commentaires
        $lastComments = Commentaire::latest()->take(1)->get();
        foreach ($lastComments as $comment) {
            $activities[] = [
                'type' => 'Nouveau commentaire',
                'client' => $comment->nom,
                'date' => $comment->created_at->format('Y-m-d H:i')
            ];
        }

        // Derniers projets
        $lastProjets = Projet::with('client')->latest()->take(1)->get();
        foreach ($lastProjets as $projet) {
            $activities[] = [
                'type' => 'Projet généré',
                'client' => $projet->client ? $projet->client->nom . ' ' . $projet->client->prenom : 'Client inconnu',
                'date' => $projet->created_at->format('Y-m-d H:i')
            ];
        }

        // Trier les activités les plus récentes
        usort($activities, fn($a, $b) =>
            strtotime($b['date']) - strtotime($a['date'])
        );

        return array_slice($activities, 0, 5);
    }

    private function getPendingDemands()
    {
        return DemandeDevis::with('client')
            ->where('statut', 'en_attente')
            ->orderBy('created_at', 'asc')
            ->take(3)
            ->get()
            ->map(function ($demande) {
                return [
                    'id' => $demande->id_demandedevis,
                    'client' => $demande->client ? $demande->client->nom . ' ' . $demande->client->prenom : 'Client anonyme',
                    'type_projet' => $demande->type_projet,
                    'date_demande' => $demande->created_at->format('Y-m-d H:i'),
                    'urgence' => $demande->urgence_projet
                ];
            });
    }

    public function getFavoris()
    {
        try {
            $data = [
                'projets_favoris' => Projet::where('favoris', true)
                    ->orderBy('created_at', 'desc')
                    ->take(3)
                    ->get(),
                'commentaires_favoris' => Commentaire::where('favori', true)
                    ->orderBy('created_at', 'desc')
                    ->take(2)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
