<?php

namespace Tests\Feature\Http\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Devis;
use App\Models\DemandeDevis;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DevisControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $devis;
    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->admin = User::factory()->create(['is_admin' => true]);
        
        $demande = DemandeDevis::factory()->create(['client_id' => $this->user->id]);
        $this->devis = Devis::factory()->create([
            'client_id' => $this->user->id,
            'demande_devis_id' => $demande->id,
            'statut' => 'en_attente'
        ]);
    }

    /** @test */
    public function index_returns_all_devis()
    {
        $response = $this->getJson('/api/devis');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id', 'numero_devis', 'statut',
                    'demande_devis', 'client'
                ]
            ]);
    }

    /** @test */
    public function show_returns_specific_devis()
    {
        $response = $this->getJson('/api/devis/' . $this->devis->id);
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $this->devis->id,
                'numero_devis' => $this->devis->numero_devis
            ]);
    }

    /** @test */
    public function mesDevis_returns_only_authenticated_user_devis()
    {
        // Créer un devis pour un autre utilisateur
        $otherUser = User::factory()->create();
        $otherDevis = Devis::factory()->create(['client_id' => $otherUser->id]);
        
        $response = $this->actingAs($this->user)
            ->getJson('/api/mes-devis');
        
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $this->devis->id])
            ->assertJsonMissing(['id' => $otherDevis->id]);
    }

    /** @test */
    public function updateStatus_updates_devis_status()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/devis/' . $this->devis->id . '/status', [
                'statut' => 'accepte'
            ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Statut du devis mis à jour',
                'devis' => ['statut' => 'accepte']
            ]);
        
        $this->assertDatabaseHas('devis', [
            'id' => $this->devis->id,
            'statut' => 'accepte',
            'date_acceptation' => now()
        ]);
    }

    /** @test */
    public function updateStatus_creates_project_when_accepted()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/devis/' . $this->devis->id . '/status', [
                'statut' => 'accepte'
            ]);
        
        $this->assertDatabaseHas('projets', [
            'devis_id' => $this->devis->id,
            'client_id' => $this->user->id
        ]);
    }

    /** @test */
    public function updateStatus_requires_refusal_reason()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/devis/' . $this->devis->id . '/status', [
                'statut' => 'refuse'
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['motif_refus']);
    }

    /** @test */
    public function destroy_deletes_devis()
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson('/api/devis/' . $this->devis->id);
        
        $response->assertStatus(200)
            ->assertJson(['message' => 'Devis supprimé']);
        
        $this->assertDatabaseMissing('devis', ['id' => $this->devis->id]);
    }

    /** @test */
    public function destroy_prevents_unauthorized_deletion()
    {
        $otherUser = User::factory()->create();
        
        $response = $this->actingAs($otherUser)
            ->deleteJson('/api/devis/' . $this->devis->id);
        
        $response->assertStatus(403);
    }
    public function accepterDevis($id)
{
    $devis = Devis::findOrFail($id);

    if ($devis->statut !== 'accepte') {
        $devis->statut = 'accepte';
        $devis->date_acceptation = now();
        $devis->save();

        // Création automatique du projet
        Projet::create([
            'id_client'   => $devis->id_client,
            'titre'       => 'Projet pour le devis ' . $devis->numero_devis,
            'image'       => 'default.jpg', // ou une vraie image si dispo
            'type_projet' => 'Résidentiel', // ou à récupérer depuis une demande liée
            'date_d'      => $devis->date_acceptation,
            'date_f'      => now()->addDays((int) $devis->delai_execution), // si delai_execution est un entier
            'status'      => 'encours',
            'id_devis'    => $devis->id,
            'favoris'     => 0,
        ]);
    }

    return response()->json(['message' => 'Devis accepté et projet créé.']);
}

}