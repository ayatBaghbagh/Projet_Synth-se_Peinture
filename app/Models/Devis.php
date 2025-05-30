<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    use HasFactory;

    protected $table = 'devis';
    protected $primaryKey = 'id_devis';

    protected $fillable = [
        'numero_devis',
        'date_creation',
        'prix_total',
        'description_travaux',
        'delai_execution',
        'validite_devis',
        'notes_supplementaires',
        'statut',
        'id_demandedevis',
        'id_client',
        'date_acceptation',
        'date_refus',
        'motif_refus'
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_acceptation' => 'datetime',
        'date_refus' => 'datetime',
        'prix_total' => 'decimal:2',
        'validite_devis' => 'integer'
    ];

    public function demandeDevis()
    {
        return $this->belongsTo(DemandeDevis::class, 'id_demandedevis');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }

    public function getIsExpiredAttribute()
    {
        return $this->date_creation->addDays($this->validite_devis)->isPast();
    }

    public function getDateExpirationAttribute()
    {
        return $this->date_creation->addDays($this->validite_devis);
    }
}
