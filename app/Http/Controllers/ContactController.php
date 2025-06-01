<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{

    public function index()
    {
        return response()->json([
            'data' => Contact::all(),
            'message' => 'Contacts récupérés avec succès'
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:50',
            'nom' => 'required|string|max:50',
            'email' => 'required|email|max:100',
            'telephone' => 'nullable|string|max:20',
            'sujet' => 'required|string|max:100',
            'typeProjet' => 'required|string|in:Résidentiel,Commercial,Bâtiment public',
            'message' => 'required|string|min:10|max:2000'
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Message envoyé avec succès',
            'data' => $contact
        ], 201)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
      return response()->json($client, 201)
    ->header('Access-Control-Allow-Origin', '*')
    ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    }
     // Met à jour un contact existant
    public function update(Request $request, $id)
    {
        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json(['message' => 'Contact non trouvé'], 404);
        }

        $validated = $request->validate([
            'prenom' => 'sometimes|string|max:50',
            'nom' => 'sometimes|string|max:50',
            'email' => 'sometimes|email|max:100',
            'telephone' => 'nullable|string|max:20',
            'sujet' => 'sometimes|string|max:100',
            'typeProjet' => 'sometimes|string|in:Résidentiel,Commercial,Bâtiment public',
            'message' => 'sometimes|string|min:10|max:2000',
            'favori' => 'sometimes|boolean'
        ]);

        $contact->update($validated);

        return response()->json([
            'message' => 'Contact mis à jour avec succès',
            'data' => $contact
        ]);
    }

   // app/Http/Controllers/ContactController.php
public function destroy($id)
{
    $contact = Contact::find($id);

    if (!$contact) {
        return response()->json(['message' => 'Contact non trouvé'], 404);
    }

    $contact->delete();

    return response()->json(['message' => 'Contact supprimé avec succès']);
}
}