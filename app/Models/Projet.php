<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Projet extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_projet'; // clé primaire personnalisée
    protected $fillable = [
        'titre', 
        'image', 
        'type_projet', 
        'date_d', 
        'date_f', 
        'status', 
        'id_devis', 
        'id_client', // Ajout de id_client manquant
        'favoris'
    ];
    
    protected $casts = [
        'favoris' => 'boolean',
        'date_d' => 'date',
        'date_f' => 'date',
    ];

    // Relation avec Devis

    public function devis()
{
    return $this->belongsTo(Devis::class, 'id_devis', 'id_devis');
}
    // Relation avec Client
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }
    public function taches()
{
    return $this->hasMany(Tache::class, 'projet_id');
}

}