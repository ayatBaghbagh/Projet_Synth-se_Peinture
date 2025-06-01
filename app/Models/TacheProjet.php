<?php
// app/Models/TacheProjet.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TacheProjet extends Model
{
    protected $table = 'taches_projet';
    protected $fillable = [
        'nom_tache',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'notes',
        'type_projet',
        'projet_id',   // clé étrangère correcte
        'assignee_id'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class, 'projet_id', 'id_projet');
    }
}
