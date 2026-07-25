<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabla Captaciones
        Schema::create('captaciones', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->string('category');
            $table->text('address');
            $table->string('google_maps')->nullable();
            $table->string('business_hours')->nullable();
            $table->boolean('accepts_card')->default(false)->comment('Si el cliente acepto la tarjeta de YALASOFT');
            $table->boolean('gave_card')->default(false)->comment('Si el cliente nos dio su tarjeta de su empresa');
            $table->string('licensing_type')->nullable()->comment('Interes: SaaS o Pago Unico');
            $table->boolean('offered_hosting')->default(false);
            $table->decimal('hosting_price', 12, 2)->default(50.00)->nullable();
            $table->string('owner_name');
            $table->string('contact_name')->nullable();
            $table->string('phone');
            $table->string('whatsapp')->nullable();
            $table->string('offered_application')->nullable();
            $table->decimal('offered_price', 12, 2)->nullable();
            $table->string('promotion')->nullable();
            $table->enum('status', [
                'Captación',
                'Follow-up',
                'Training',
                'Negotiation',
                'Closed Sale',
                'Lost'
            ])->default('Captación');
            $table->text('notes')->nullable();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 2. Tabla Visits
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('captacion_id')->constrained('captaciones')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('visit_date');
            $table->text('result');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Tabla Follow-ups
        Schema::create('followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('captacion_id')->constrained('captaciones')->onDelete('cascade');
            $table->dateTime('date');
            $table->text('notes');
            $table->dateTime('next_contact')->nullable();
            $table->text('result')->nullable();
            $table->timestamps();
        });

        // 4. Tabla Sales
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('captacion_id')->constrained('captaciones')->onDelete('cascade');
            $table->string('sold_system');
            $table->decimal('price', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('commission', 12, 2)->default(0); // Comisión en valor monetario
            $table->date('sale_date');
            $table->timestamps();
        });

        // 5. Tabla Commissions
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->timestamps();
        });

        // 6. Tabla Suggestions
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('captacion_id')->constrained('captaciones')->onDelete('cascade');
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suggestions');
        Schema::dropIfExists('commissions');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('followups');
        Schema::dropIfExists('visits');
        Schema::dropIfExists('captaciones');
    }
};
