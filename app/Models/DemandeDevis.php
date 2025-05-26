<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class DemandeDevis extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_demandedevis';

    protected $fillable = [
    'date_demande',
    'description',
    'surface',
    'type_projet',
    'urgence_projet',
    'couleur_peinture',      // ajoutée
    'finition',              // ajoutée
    'id_client',
];
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function devis()
    {
        return $this->hasOne(Devis::class, 'id_demandedevis');
    }
}
