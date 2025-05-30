<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Gerant;
use App\Models\DemandeDevis;
use App\Mail\NouvelleDemandeDevis;
use App\Mail\DevisValide;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Créer une notification pour une nouvelle demande de devis
     */
    public function creerNotificationDemandeDevis(DemandeDevis $demandeDevis)
{
    // Adresse e-mail fixe
    $gerant = \App\Models\Gerant::first();
     $emailGerant = $gerant->email ?? 'ayabaghbagh@gmail.com';



    // Créer une notification (optionnel si tu veux l'afficher dans le dashboard plus tard)
    Notification::create([
        'type' => 'demande_devis',
        'titre' => 'Nouvelle demande de devis',
        'message' => "Nouvelle demande de devis reçue pour un projet de {$demandeDevis->type_projet}",
        'data' => [
            'demande_id' => $demandeDevis->id_demandedevis,
            'type_projet' => $demandeDevis->type_projet,
            'surface' => $demandeDevis->surface,
            'urgence' => $demandeDevis->urgence_projet,
            'client_nom' => $demandeDevis->client ? $demandeDevis->client->nom_complet : 'Client anonyme'
        ],
        'id_gerant' => 1, // ou la valeur de ton unique gérant
        'id_demande_devis' => $demandeDevis->id_demandedevis
    ]);

    // Envoyer l'email
    try {
        // Optionnel : si tu as besoin d'un objet Gerant (par exemple dans la vue)
        $gerant = \App\Models\Gerant::first(); // vu qu'il n'y a qu'un seul
        Mail::to($emailGerant)->send(new \App\Mail\NouvelleDemandeDevis($demandeDevis, $gerant));
    } catch (\Exception $e) {
        \Log::error('Erreur envoi email notification: ' . $e->getMessage());
    }

    return true;
}


    /**
     * Créer une notification pour un devis validé
     */
    public function creerNotificationDevisValide($devis)
    {
        $gerants = Gerant::where('actif', true)->get();

        foreach ($gerants as $gerant) {
            $notification = Notification::create([
                'type' => 'devis_valide',
                'titre' => 'Devis validé par le client',
                'message' => "Le devis #{$devis->numero_devis} a été validé par le client",
                'data' => [
                    'devis_id' => $devis->id_devis,
                    'numero_devis' => $devis->numero_devis,
                    'montant' => $devis->prix_total,
                    'client_nom' => $devis->demandeDevis->client ? $devis->demandeDevis->client->nom_complet : 'Client'
                ],
                'id_gerant' => $gerant->id_gerant,
                'id_devis' => $devis->id_devis
            ]);

            // Envoyer l'email
            try {
                Mail::to($gerant->email)->send(new DevisValide($devis, $gerant));
            } catch (\Exception $e) {
                \Log::error('Erreur envoi email devis validé: ' . $e->getMessage());
            }
        }

        return true;
    }

    /**
     * Marquer une notification comme lue
     */
    public function marquerCommeLue($notificationId, $gerantId)
    {
        return Notification::where('id_notification', $notificationId)
            ->where('id_gerant', $gerantId)
            ->update(['lu' => true]);
    }

    /**
     * Marquer toutes les notifications d'un gérant comme lues
     */
    public function marquerToutesCommeLues($gerantId)
    {
        return Notification::where('id_gerant', $gerantId)
            ->where('lu', false)
            ->update(['lu' => true]);
    }

    /**
     * Récupérer les notifications d'un gérant
     */
    public function getNotifications($gerantId, $limite = 50)
    {
        return Notification::where('id_gerant', $gerantId)
            ->with(['demandeDevis.client'])
            ->orderBy('created_at', 'desc')
            ->limit($limite)
            ->get();
    }

    /**
     * Compter les notifications non lues d'un gérant
     */
    public function compterNotificationsNonLues($gerantId)
    {
        return Notification::where('id_gerant', $gerantId)
            ->where('lu', false)
            ->count();
    }
}