<?php

namespace App\Mail;

use App\Models\Gerant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DevisValide extends Mailable
{
    use Queueable, SerializesModels;

    public $devis;
    public $gerant;

    public function __construct($devis, Gerant $gerant)
    {
        $this->devis = $devis;
        $this->gerant = $gerant;
    }

    public function build()
    {
        return $this->subject('Devis validé par le client - Artisan Peinture')
                    ->view('emails.devis-valide')
                    ->with([
                        'devis' => $this->devis,
                        'gerant' => $this->gerant,
                        'urlDashboard' => config('app.frontend_url') . '/admin/projets'
                    ]);
    }
}