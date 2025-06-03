<?php

namespace App\Http\Controllers;

use App\Models\Peintre;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PeintreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $peintres = Peintre::with(['taches', 'groupes'])->get();
            
            return response()->json([
                'success' => true,
                'data' => $peintres,
                'message' => 'Peintres récupérés avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des peintres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:peintres,email',
                'tele' => 'required|string|max:20',
                'disponibilite' => 'boolean'
            ]);

            $peintre = Peintre::create($validatedData);

            return response()->json([
                'success' => true,
                'data' => $peintre,
                'message' => 'Peintre créé avec succès'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du peintre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $peintre = Peintre::with(['taches', 'groupes'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $peintre,
                'message' => 'Peintre récupéré avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Peintre non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $peintre = Peintre::findOrFail($id);
            
            $validatedData = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:peintres,email,' . $id . ',num_peintre',
                'tele' => 'required|string|max:20',
                'disponibilite' => 'boolean'
            ]);

            $peintre->update($validatedData);

            return response()->json([
                'success' => true,
                'data' => $peintre,
                'message' => 'Peintre mis à jour avec succès'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du peintre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $peintre = Peintre::findOrFail($id);
            $peintre->delete();

            return response()->json([
                'success' => true,
                'message' => 'Peintre supprimé avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du peintre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer un peintre par son ID utilisateur
     */
    public function getByUserId($userId): JsonResponse
    {
        try {
            $peintre = Peintre::where('num_User', $userId)->first();
            
            if (!$peintre) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun peintre trouvé pour cet utilisateur'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $peintre,
                'message' => 'Peintre récupéré avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du peintre',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}