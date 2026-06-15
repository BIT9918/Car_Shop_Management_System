<?php

namespace App\Http\Controllers;

use App\Models\CarHistory;
use Exception;

class CarHistoryController extends Controller
{
    public function index()
    {
        try {
            $histories = CarHistory::with('user:id,name,email')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $histories,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
