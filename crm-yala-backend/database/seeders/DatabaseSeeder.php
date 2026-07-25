<?php
 
namespace Database\Seeders;
 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Captacion;
use App\Models\Visit;
use App\Models\Followup;
use App\Models\Sale;
use App\Models\Commission;
use App\Models\Suggestion;
 
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear usuarios
        $admin = User::create([
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'role' => 'admin'
        ]);
 
        $alex = User::create([
            'username' => 'alex',
            'password' => Hash::make('seller123'),
            'role' => 'seller'
        ]);
 
        $sarah = User::create([
            'username' => 'sarah',
            'password' => Hash::make('seller123'),
            'role' => 'seller'
        ]);
 
        $mike = User::create([
            'username' => 'mike',
            'password' => Hash::make('seller123'),
            'role' => 'seller'
        ]);
 
        // 2. Crear Captaciones y dependientes
        // Captacion 1: TechFlow Systems Bolivia (Negociación - Asignado a Alex)
        $c1 = Captacion::create([
            'business_name' => 'TechFlow Systems Bolivia',
            'category' => 'Tecnología',
            'address' => 'Avenida Arce #2132, Edificio Tower, Sopocachi, La Paz, Bolivia',
            'google_maps' => '-16.508544,-68.125732',
            'business_hours' => '09:00 - 18:00',
            'accepts_card' => true, // Recibió tarjeta YALASOFT
            'gave_card' => true,    // Nos dio su tarjeta
            'licensing_type' => 'SaaS',
            'offered_hosting' => true,
            'hosting_price' => 50.00,
            'owner_name' => 'Robert Sterling',
            'contact_name' => 'Robert Sterling',
            'phone' => '+591 77568997',
            'whatsapp' => '+591 77568997',
            'offered_application' => 'CloudConnect ERP',
            'offered_price' => 12400.00,
            'promotion' => '5% Descuento Lanzamiento',
            'status' => 'Negotiation',
            'notes' => 'El cliente está muy interesado pero requiere de una demo adicional del módulo financiero. El precio base está acordado.',
            'seller_id' => $alex->id,
        ]);
 
        Visit::create([
            'captacion_id' => $c1->id,
            'seller_id' => $alex->id,
            'visit_date' => now()->subDays(2)->setHour(10)->setMinute(0),
            'result' => 'Presentación de software exitosa.',
            'notes' => 'Se presentó el core del ERP. El propietario Robert estuvo presente y le agradó la velocidad de carga.'
        ]);
 
        Followup::create([
            'captacion_id' => $c1->id,
            'date' => now()->subDay()->setHour(16)->setMinute(30),
            'notes' => 'Llamada telefónica para coordinar demo del módulo financiero.',
            'next_contact' => now()->addDays(2)->setHour(14)->setMinute(0),
            'result' => 'Programado'
        ]);
 
        // Captacion 2: GreenLeaf Logistics (Closed Sale - Asignado a Sarah)
        $c2 = Captacion::create([
            'business_name' => 'GreenLeaf Logistics',
            'category' => 'Servicios',
            'address' => 'Av. San Martín y 3er Anillo, Equipetrol, Santa Cruz de la Sierra, Bolivia',
            'google_maps' => '-17.761890,-63.192534',
            'business_hours' => '08:00 - 17:00',
            'accepts_card' => true,
            'gave_card' => false,
            'licensing_type' => 'Pago Único',
            'offered_hosting' => false,
            'hosting_price' => 0.00,
            'owner_name' => 'Sarah Jenkins',
            'contact_name' => 'Sarah Jenkins',
            'phone' => '+591 72144322',
            'whatsapp' => '+591 72144322',
            'offered_application' => 'FleetMaster Pro',
            'offered_price' => 8900.00,
            'promotion' => 'Ninguna',
            'status' => 'Closed Sale',
            'notes' => 'Venta cerrada de forma exitosa. Se vendió el sistema de tracking de flotas con configuración especial.',
            'seller_id' => $sarah->id,
        ]);
 
        $s2 = Sale::create([
            'captacion_id' => $c2->id,
            'sold_system' => 'FleetMaster Pro',
            'price' => 8900.00,
            'discount' => 0.00,
            'commission' => 1335.00, // 15% de comisión
            'sale_date' => now()->subDays(5)->toDateString()
        ]);
 
        Commission::create([
            'seller_id' => $sarah->id,
            'sale_id' => $s2->id,
            'amount' => 1335.00
        ]);
 
        // Captacion 3: Urban Nest Realty (Follow-up - Asignado a Mike)
        $c3 = Captacion::create([
            'business_name' => 'Urban Nest Realty Bolivia',
            'category' => 'Servicios',
            'address' => 'Paseo El Prado, Edif. Alameda Piso 3, Cochabamba, Bolivia',
            'google_maps' => '-17.389145,-66.156897',
            'business_hours' => '09:00 - 18:00',
            'accepts_card' => false,
            'gave_card' => true,
            'licensing_type' => 'SaaS',
            'offered_hosting' => true,
            'hosting_price' => 50.00,
            'owner_name' => 'Marcus Thorne',
            'contact_name' => 'Marcus Thorne',
            'phone' => '+591 78912300',
            'whatsapp' => '+591 78912300',
            'offered_application' => 'EstateManager v4',
            'offered_price' => 15250.00,
            'promotion' => 'Integración Gratuita',
            'status' => 'Follow-up',
            'notes' => 'El cliente está analizando presupuestos de la competencia. Requiere seguimiento de llamada.',
            'seller_id' => $mike->id,
        ]);
 
        Visit::create([
            'captacion_id' => $c3->id,
            'seller_id' => $mike->id,
            'visit_date' => now()->subDays(4)->setHour(11)->setMinute(30),
            'result' => 'Primera reunión de reconocimiento.',
            'notes' => 'Les agradó el diseño móvil de EstateManager.'
        ]);
 
        Followup::create([
            'captacion_id' => $c3->id,
            'date' => now()->subDays(2),
            'notes' => 'Seguimiento por correo electrónico.',
            'next_contact' => now()->addDay()->setHour(10)->setMinute(0),
            'result' => 'Programado'
        ]);
 
        // Captacion 4: Nova Retailers LP (Captación - Asignado a Alex)
        $c4 = Captacion::create([
            'business_name' => 'Nova Retailers LP',
            'category' => 'Comercio Minorista',
            'address' => 'Calle Sagárnaga #452, Zona Centro, La Paz, Bolivia',
            'google_maps' => '-16.496734,-68.136894',
            'business_hours' => '10:00 - 20:00',
            'accepts_card' => true,
            'gave_card' => true,
            'licensing_type' => 'SaaS',
            'offered_hosting' => true,
            'hosting_price' => 45.00,
            'owner_name' => 'Elena Rodriguez',
            'contact_name' => 'Elena Rodriguez',
            'phone' => '+591 67845312',
            'whatsapp' => '+591 67845312',
            'offered_application' => 'OmniChannel CRM',
            'offered_price' => 5800.00,
            'promotion' => 'Soporte 24/7 Gratis por 1 año',
            'status' => 'Captación',
            'notes' => 'Primer contacto puerta a puerta. Elena fue receptiva y solicitó información por WhatsApp.',
            'seller_id' => $alex->id,
        ]);
 
        // Captacion 5: Blue Wave Labs (Lost - Asignado a Sarah)
        $c5 = Captacion::create([
            'business_name' => 'Blue Wave Labs SC',
            'category' => 'Tecnología',
            'address' => 'Parque Industrial PI-22, Santa Cruz, Bolivia',
            'google_maps' => '-17.742332,-63.153421',
            'business_hours' => '09:00 - 18:00',
            'accepts_card' => false,
            'gave_card' => false,
            'licensing_type' => 'Pago Único',
            'offered_hosting' => false,
            'hosting_price' => 0.00,
            'owner_name' => 'Dr. Alan Turing',
            'contact_name' => 'Dr. Alan Turing',
            'phone' => '+591 79900144',
            'whatsapp' => '+591 79900144',
            'offered_application' => 'BioSecure LIMS',
            'offered_price' => 22000.00,
            'promotion' => 'Ninguna',
            'status' => 'Lost',
            'notes' => 'El presupuesto excede su capacidad anual. Prefieren mantener su sistema legacy.',
            'seller_id' => $sarah->id,
        ]);
 
        // Captacion 6: Entel Tech (Closed Sale - Asignado a Alex)
        $c6 = Captacion::create([
            'business_name' => 'Entel Tech Bolivia',
            'category' => 'Tecnología',
            'address' => 'Torre Entel, Av. Mariscal Santa Cruz, La Paz, Bolivia',
            'google_maps' => '-16.498877,-68.134543',
            'business_hours' => '09:00 - 17:00',
            'accepts_card' => true,
            'gave_card' => true,
            'licensing_type' => 'Pago Único',
            'offered_hosting' => true,
            'hosting_price' => 50.00,
            'owner_name' => 'Ignacio Galán',
            'contact_name' => 'Ignacio Galán',
            'phone' => '+591 22123456',
            'whatsapp' => '+591 71500022',
            'offered_application' => 'Neural Core v2.4',
            'offered_price' => 142500.00,
            'promotion' => 'Ninguna',
            'status' => 'Closed Sale',
            'notes' => 'Gran venta cerrada. Implementación empresarial de Neural Core con soporte premier.',
            'seller_id' => $alex->id,
        ]);
 
        $s6 = Sale::create([
            'captacion_id' => $c6->id,
            'sold_system' => 'Neural Core v2.4',
            'price' => 142500.00,
            'discount' => 7125.00, // 5% descuento
            'commission' => 16245.00, // 12% de comisión sobre precio neto (135,375.00)
            'sale_date' => now()->subDays(12)->toDateString()
        ]);
 
        Commission::create([
            'seller_id' => $alex->id,
            'sale_id' => $s6->id,
            'amount' => 16245.00
        ]);
 
        // Sugerencias para las captaciones
        Suggestion::create([
            'captacion_id' => $c1->id,
            'description' => 'Sugerir integración con ERP existente en lugar de reemplazo total.'
        ]);
 
        Suggestion::create([
            'captacion_id' => $c3->id,
            'description' => 'Ofrecer pasarela de pagos integrada para el sector inmobiliario.'
        ]);
    }
}
