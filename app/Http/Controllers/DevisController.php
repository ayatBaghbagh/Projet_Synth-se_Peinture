<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use Illuminate\Http\Request;

class DevisController extends Controller
{
    public function index() { return Devis::all(); }

    public function store(Request $request) {
        $data = $request->validate([
            'montant' => 'required|numeric',
            'id_demandedevis' => 'required|exists:demande_devis,id_demandedevis',
            'status' => 'required|in:valide,refuse',
        ]);
        $data['date_creation'] = now();
        return Devis::create($data);
    }

    public function show($id) { return Devis::findOrFail($id); }

    public function update(Request $request, $id) {
        $devis = Devis::findOrFail($id);
        $devis->update($request->all());
        return $devis;
    }

    public function destroy($id) {
        $devis = Devis::findOrFail($id);
        $devis->delete();
        return response()->json(['message' => 'Devis supprimé']);
    }
}
