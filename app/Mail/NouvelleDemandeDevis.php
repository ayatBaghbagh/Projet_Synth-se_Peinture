<?php

namespace App\Mail;

use App\Models\DemandeDevis;
use App\Models\Gerant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NouvelleDemandeDevis extends Mailable
{
    use Queueable, SerializesModels;

    public $demandeDevis;
    public $gerant;

    public function __construct(DemandeDevis $demandeDevis, Gerant $gerant)
    {
        $this->demandeDevis = $demandeDevis;
        $this->gerant = $gerant;
    }

    public function build()
    {
        return $this->subject('Nouvelle demande de devis - Artisan Peinture')
                    ->view('emails.nouvelle-demande-devis')
                    ->with([
                        'demandeDevis' => $this->demandeDevis,
                        'gerant' => $this->gerant,
                        'urlDashboard' => config('app.frontend_url') . '/admin/demandes-devis'
                    ]);
    }
}