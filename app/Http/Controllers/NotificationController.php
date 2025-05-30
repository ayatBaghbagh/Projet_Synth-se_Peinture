<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Récupérer les notifications d'un gérant
     */
    public function index(Request $request)
    {
        // Pour l'instant, on utilise un gérant par défaut
        // Tu peux remplacer par l'authentification réelle
        $gerantId = 1; // ID du gérant connecté
        
        $notifications = $this->notificationService->getNotifications($gerantId);
        
        return response()->json([
            'success' => true,
            'data' => $notifications,
            'total' => $notifications->count(),
            'non_lues' => $this->notificationService->compterNotificationsNonLues($gerantId)
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function marquerLue($id)
    {
        $gerantId = 1; // ID du gérant connecté
        
        $success = $this->notificationService->marquerCommeLue($id, $gerantId);
        
        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Notification non trouvée'
        ], 404);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function marquerToutesLues()
    {
        $gerantId = 1; // ID du gérant connecté
        
        $count = $this->notificationService->marquerToutesCommeLues($gerantId);
        
        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marquées comme lues"
        ]);
    }

    /**
     * Récupérer le détail d'une notification
     */
    public function show($id)
    {
        $gerantId = 1; // ID du gérant connecté
        
        $notification = Notification::with(['demandeDevis.client', 'devis'])
            ->where('id_notification', $id)
            ->where('id_gerant', $gerantId)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée'
            ], 404);
        }

        // Marquer comme lue automatiquement
        if (!$notification->lu) {
            $notification->marquerCommeLue();
        }

        return response()->json([
            'success' => true,
            'data' => $notification
        ]);
    }

    /**
     * Compter les notifications non lues
     */
    public function compterNonLues()
    {
        $gerantId = 1; // ID du gérant connecté
        
        $count = $this->notificationService->compterNotificationsNonLues($gerantId);
        
        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Supprimer une notification
     */
    public function destroy($id)
    {
        $gerantId = 1; // ID du gérant connecté
        
        $notification = Notification::where('id_notification', $id)
            ->where('id_gerant', $gerantId)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée'
        ]);
    }
}