<?php
// app/Models/Commentaire.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commentaire extends Model
{
    use HasFactory;

    protected $table = 'commentaires';

    protected $fillable = [
        'nom',
        'prenom',
        'type_client',
        'contenu',
        'favori',
        'nation',
        'ville'
    ];

    protected $casts = [
        'favori' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Scope pour récupérer seulement les favoris
    public function scopeFavoris($query)
    {
        return $query->where('favori', true);
    }

    // Scope pour filtrer par type de client
    public function scopeParType($query, $type)
    {
        return $query->where('type_client', $type);
    }

    // Accessor pour le nom complet
    public function getNomCompletAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }

    // Accessor pour la localisation
    public function getLocalisationAttribute()
    {
        return $this->ville . ', ' . $this->nation;
    }

    // Accessor pour vérifier si c'est un favori
    public function getIsFavoriAttribute()
    {
        return $this->favori === true || $this->favori === 1;
    }
}
