<?php

namespace App\Http\Controllers;

use App\Models\DemandeDevis;
use Illuminate\Http\Request;

class DemandeDevisController extends Controller
{
    public function index() { return DemandeDevis::all(); }

    public function store(Request $request) {
    $data = $request->validate([
        'description' => 'required|string',
        'surface' => 'required|numeric',
        'type_projet' => 'required|string',
        'urgence_projet' => 'required|in:urgent,normal,flexible',
        'couleur_peinture' => 'nullable|string',
        'finition' => 'nullable|string',
        'id_client' => 'nullable|exists:clients,id_client',
    ]);

    $data['date_demande'] = now();

    return DemandeDevis::create($data);
}


    public function show($id) { return DemandeDevis::findOrFail($id); }

    public function update(Request $request, $id) {
        $demande = DemandeDevis::findOrFail($id);
        $demande->update($request->all());
        return $demande;
    }

    public function destroy($id) {
        $demande = DemandeDevis::findOrFail($id);
        $demande->delete();
        return response()->json(['message' => 'Demande supprimée']);
    }
}
