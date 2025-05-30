<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_notification';

    protected $fillable = [
        'type',
        'titre',
        'message',
        'data',
        'lu',
        'id_gerant',
        'id_demande_devis',
        'id_devis',
        'id_projet'
    ];

    protected $casts = [
        'data' => 'array',
        'lu' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relations
    public function gerant()
    {
        return $this->belongsTo(Gerant::class, 'id_gerant');
    }

    public function demandeDevis()
    {
        return $this->belongsTo(DemandeDevis::class, 'id_demande_devis');
    }

    public function devis()
    {
        return $this->belongsTo(Devis::class, 'id_devis');
    }

    // Scopes
    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    public function scopeParGerant($query, $gerantId)
    {
        return $query->where('id_gerant', $gerantId);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Méthodes utilitaires
    public function marquerCommeLue()
    {
        $this->update(['lu' => true]);
    }

    public function getTempsEcouleAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getIconeAttribute()
    {
        switch ($this->type) {
            case 'demande_devis':
                return 'document-text';
            case 'devis_valide':
                return 'check-circle';
            case 'projet_termine':
                return 'home';
            default:
                return 'bell';
        }
    }

    public function getCouleurAttribute()
    {
        switch ($this->type) {
            case 'demande_devis':
                return 'blue';
            case 'devis_valide':
                return 'purple';
            case 'projet_termine':
                return 'green';
            default:
                return 'gray';
        }
    }
}