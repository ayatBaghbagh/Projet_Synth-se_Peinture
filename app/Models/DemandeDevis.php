<?php

// app/Models/DemandeDevis.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeDevis extends Model
{
    use HasFactory;

    protected $table = 'demande_devis';
    protected $primaryKey = 'id_demandedevis';

    protected $fillable = [
        'description',
        'surface',
        'type_projet',
        'urgence_projet',
        'couleur_peinture',
        'finition',
        'id_client',
        'date_demande',
        'statut',
        'motif_refus',
        'date_refus'
    ];

    protected $casts = [
        'date_demande' => 'datetime',
        'date_refus' => 'datetime',
        'surface' => 'decimal:2'
    ];

    // Relation avec le client
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    // Relation avec les devis
    public function devis()
    {
        return $this->hasOne(Devis::class, 'id_demandedevis');
    }

    /**
     * Récupérer le premier devis associé
     */
    public function premierDevis()
    {
        return $this->hasOne(Devis::class, 'id_demandedevis', 'id_demandedevis')->oldest();
    }
}