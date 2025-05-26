<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
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
    }
}