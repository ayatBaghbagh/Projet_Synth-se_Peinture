<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index() { return Client::all(); }

    public function store(Request $request) {
        $data = $request->validate([
            'nom' => 'required', 'prenom' => 'required', 'adresse' => 'required',
            'email' => 'required|email|unique:clients', 'password' => 'required|min:6'
        ]);
        $data['password'] = bcrypt($data['password']);
        $data['date_inscription'] = now();
        return Client::create($data);
    }

    public function show($id) { return Client::findOrFail($id); }

    public function update(Request $request, $id) {
        $client = Client::findOrFail($id);
        $client->update($request->all());
        return $client;
    }

    public function destroy($id) {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(['message' => 'Client supprimé']);
    }
}
