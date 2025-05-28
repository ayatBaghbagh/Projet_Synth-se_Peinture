<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index()
    {
        return Client::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'adresse' => 'required|string',
            'email' => 'required|email|unique:clients,email',
            'password' => 'required|string|min:6',
            'telephone' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['date_inscription'] = now();

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show($id)
    {
        return Client::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string',
            'prenom' => 'sometimes|string',
            'adresse' => 'sometimes|string',
            'email' => 'sometimes|email|unique:clients,email,' . $id . ',id_client',
            'password' => 'sometimes|string|min:6',
            'telephone' => 'nullable|string',
            'block' => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        $client->delete();

        return response()->json(null, 204);
    }

    public function options()
    {
        return response('', 200);
    }
    // public function profile(Request $request)
    // {
    //     return response()->json($request->user());
    // }
}
