<?php
// app/Models/Peintre.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peintre extends Model
{
    use HasFactory;

    protected $table = 'peintre';
    protected $primaryKey = 'num_peintre';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'tele',
        'disponibilite'
    ];

    protected $casts = [
        'disponibilite' => 'boolean',
    ];

    // Relation avec Groupes (Many-to-Many) - Un peintre peut être membre de plusieurs groupes
    public function groupes()
    {
        return $this->belongsToMany(Groupe::class, 'groupe_membres', 'peintre_id', 'groupe_id')
                   ->withTimestamps()
                   ->withPivot('date_ajout');
    }

    // Relation avec Taches (One-to-Many) - Un peintre peut avoir plusieurs tâches assignées
    public function taches()
    {
        return $this->hasMany(Tache::class, 'peintre_id', 'num_peintre');
    }

    // Accesseur pour le nom complet
    public function getNomCompletAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }

    // Scope pour les peintres disponibles
    public function scopeDisponibles($query)
    {
        return $query->where('disponibilite', true);
    }
    
}