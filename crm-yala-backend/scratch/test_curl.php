<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->boot();

use App\Models\User;

$user = User::where('username', 'alex')->first();
$token = $user->createToken('test-curl')->plainTextToken;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8000/api/captaciones");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);

$output = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: $statusCode\n";
echo "Response Output:\n";
echo json_encode(json_decode($output), JSON_PRETTY_PRINT) . "\n";
