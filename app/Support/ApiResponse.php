<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Validation\ValidationException;

final class ApiResponse
{
    public static function success(mixed $data = null, string $message = null, int $status = 200): JsonResponse
    {
        $body = [];
        if ($message !== null) {
            $body['message'] = $message;
        }
        $body['data'] = $data;
        return response()->json($body, $status);
    }

    public static function validationError(array $errors, string $message = 'The given data was invalid.'): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => $errors,
        ], 422);
    }

    public static function unauthorized(string $message = 'Unauthenticated.'): JsonResponse
    {
        return response()->json(['message' => $message], 401);
    }

    public static function forbidden(string $message = 'This action is unauthorized.'): JsonResponse
    {
        return response()->json(['message' => $message], 403);
    }

    public static function notFound(string $message = 'Resource not found.'): JsonResponse
    {
        return response()->json(['message' => $message], 404);
    }

    public static function serverError(string $message = 'Server Error.'): JsonResponse
    {
        return response()->json(['message' => $message], 500);
    }
}
