<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ClientAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !Hash::check($request->password, $client->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        // Créer un token pour le client
        $token = $client->createToken('client-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'token' => $token,
            'client' => [
                'id' => $client->id,
                'prenom' => $client->prenom,
                'nom' => $client->nom,
                'email' => $client->email,
                'telephone' => $client->telephone,
                'adresse' => $client->adresse,
                'entreprise' => $client->entreprise,
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at
            ]
        ]);
    }

    public function profile(Request $request)
    {
        // Retourner les informations du client authentifié
        $client = $request->user();
        
        return response()->json([
            'success' => true,
            'client' => [
                'id' => $client->id,
                'prenom' => $client->prenom,
                'nom' => $client->nom,
                'email' => $client->email,
                'telephone' => $client->telephone,
                'adresse' => $client->adresse,
                'entreprise' => $client->entreprise,
                'dateInscription' => $client->created_at->format('F Y'),
                'clientId' => '#CLI-' . date('Y') . '-' . str_pad($client->id, 3, '0', STR_PAD_LEFT),
                'statut' => 'Client Premium', // Vous pouvez ajouter cette colonne à votre table
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at
            ]
        ]);
    }

    public function logout(Request $request)
    {
        // Révoquer le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }
}