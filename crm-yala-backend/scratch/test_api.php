<?php

use App\Models\User;
use App\Models\Captacion;
use Illuminate\Http\Request;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Loguear a Alex
$user = User::where('username', 'alex')->first();
$token = $user->createToken('test')->plainTextToken;

// Simulamos la request con el token
$requestHeaders = [
    'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
    'HTTP_ACCEPT' => 'application/json'
];
$requestWithAuth = Request::create('/api/captaciones', 'GET', [], [], [], $requestHeaders);

$response = $kernel->handle($requestWithAuth);

echo "Status Code: " . $response->getStatusCode() . "\n";
echo "Content: \n";
echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT) . "\n";
