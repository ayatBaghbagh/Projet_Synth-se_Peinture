<?php
namespace App\Http\Controllers;

use App\Models\Devis;
use Illuminate\Http\Request;

class DevisController extends Controller
{
   

    public function index()
    {
        return Devis::with('demandeDevis', 'client')->orderBy('created_at', 'desc')->get();
    }

    public function show($id)
    {
        return Devis::with('demandeDevis', 'client')->findOrFail($id);
    }

    public function destroy($id)
    {
        $devis = Devis::findOrFail($id);
        $devis->delete();

        return response()->json(['message' => 'Devis supprimé']);
    }
}
