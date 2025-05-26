<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_devis';

    protected $fillable = ['montant', 'date_creation', 'id_demandedevis', 'status'];

    public function demande()
    {
        return $this->belongsTo(DemandeDevis::class, 'id_demandedevis');
    }

    public function projet()
    {
        return $this->hasOne(Projet::class, 'id_devis');
    }
}
