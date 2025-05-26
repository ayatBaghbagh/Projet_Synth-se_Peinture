<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaysController extends Controller
{
    public function villes(Request $request)
    {
        try {
            $validated = $request->validate([
                'nation' => 'required|string|max:50'
            ]);

            $nation = $validated['nation'];
            $allCities = $this->getDefaultCities();

            $cities = $allCities[$nation] ?? [];

            return response()->json([
                'success' => true,
                'data' => $cities,
                'metadata' => [
                    'count' => count($cities),
                    'capital' => $this->getCapital($nation),
                    'source' => 'internal-db'
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation error',
                'messages' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Cities error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server error',
                'message' => 'Unable to retrieve cities'
            ], 500);
        }
    }

    public function nations()
    {
        try {
            $countries = $this->getDefaultCountries();

            return response()->json([
                'success' => true,
                'data' => $countries,
                'metadata' => [
                    'count' => count($countries),
                    'source' => 'internal-db'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Nations error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server error',
                'message' => 'Unable to retrieve countries'
            ], 500);
        }
    }

    private function getDefaultCities(): array
    {
        return [
            'France' => ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
            'Belgique' => ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges'],
            'Suisse' => ['Zurich', 'Genève', 'Bâle', 'Berne', 'Lausanne'],
            'Luxembourg' => ['Luxembourg', 'Esch-sur-Alzette', 'Differdange'],
            'Canada' => ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa'],
            'Maroc' => ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger'],
            'Algérie' => ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna'],
            'Tunisie' => ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès'],
            'Sénégal' => ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor'],
            'Côte d\'Ivoire' => ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro'],
            'Mali' => ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes'],
            'Burkina Faso' => ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya'],
            'Niger' => ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua'],
            'Guinée' => ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé'],
            'Bénin' => ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon'],
            'Togo' => ['Lomé', 'Sokodé', 'Kara', 'Palimé', 'Atakpamé'],
            'Madagascar' => ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa'],
            'Maurice' => ['Port-Louis', 'Beau-Bassin', 'Vacoas-Phoenix', 'Curepipe', 'Quatre-Bornes'],
            'Seychelles' => ['Victoria', 'Anse Boileau', 'Beau Vallon', 'Cascade'],
            'Comores' => ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni']
        ];
    }

    private function getDefaultCountries(): array
    {
        return array_keys($this->getDefaultCities());
    }

    private function getCapital(string $nation): ?string
    {
        $capitals = [
            'France' => 'Paris',
            'Belgique' => 'Bruxelles',
            'Suisse' => 'Berne',
            'Luxembourg' => 'Luxembourg',
            'Canada' => 'Ottawa',
            'Maroc' => 'Rabat',
            'Algérie' => 'Alger',
            'Tunisie' => 'Tunis',
            'Sénégal' => 'Dakar',
            'Côte d\'Ivoire' => 'Yamoussoukro',
            'Mali' => 'Bamako',
            'Burkina Faso' => 'Ouagadougou',
            'Niger' => 'Niamey',
            'Guinée' => 'Conakry',
            'Bénin' => 'Porto-Novo',
            'Togo' => 'Lomé',
            'Madagascar' => 'Antananarivo',
            'Maurice' => 'Port-Louis',
            'Seychelles' => 'Victoria',
            'Comores' => 'Moroni'
        ];

        return $capitals[$nation] ?? null;
    }
}
