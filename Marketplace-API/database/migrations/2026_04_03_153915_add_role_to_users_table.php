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
        Schema::table('users', function (Blueprint $table) {
             // Menambah kolom 'role' setelah kolom 'email'
            // enum = hanya boleh isi 'seller' atau 'buyer'
            // default('buyer') = kalau tidak diisi, otomatis jadi buyer
            $table->enum('role', ['seller', 'buyer'])->default('buyer')->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // dijalankan kalau kita rollback migration
            $table->dropColumn('role');
        });
    }
};
