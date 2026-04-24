<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * INDEX — Tampilkan semua kategori (PUBLIC)
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => Category::withCount('products')->get(),
            // withCount('products') = tambahkan kolom 'products_count' di response
            // berguna untuk tampilkan "kategori ini punya X produk"
        ]);
    }

    /**
     * STORE — Buat kategori baru (PROTECTED: butuh token)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|unique:categories',
            // unique:categories = nama kategori tidak boleh duplikat
            'description' => 'nullable|string',
        ]);

        $category = Category::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dibuat',
            'data'    => $category,
        ], 201);
    }

    /**
     * SHOW — Detail satu kategori beserta produknya (PUBLIC)
     */
    public function show(Category $category)
    {
        return response()->json([
            'success' => true,
            'data'    => $category->load('products'),
        ]);
    }

    /**
     * UPDATE — Edit kategori (PROTECTED: butuh token)
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            // unique tapi KECUALIKAN ID kategori ini sendiri
            // Supaya tidak gagal validasi saat nama tidak diubah
            // Format: unique:tabel,kolom,id_yang_dikecualikan
            'name'        => 'sometimes|string|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $category->update([
            'name'        => $request->name ?? $category->name,
            // ?? = null coalescing operator: pakai $request->name, kalau null pakai $category->name
            'slug'        => Str::slug($request->name ?? $category->name),
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diupdate',
            'data'    => $category,
        ]);
    }

    /**
     * DESTROY — Hapus kategori (PROTECTED: butuh token)
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}