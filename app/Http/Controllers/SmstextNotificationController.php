<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;


class SmstextNotificationController extends Controller
{
    private function sendWhatsAppMessage($phone, $message)
    {
        Http::withToken(config('services.whatsapp.token'))
            ->post(
                'https://graph.facebook.com/v19.0/' .
                    config('services.whatsapp.phone_id') .
                    '/messages',
                [
                    'messaging_product' => 'whatsapp',
                    'to' => $phone,
                    'type' => 'text',
                    'text' => [
                        'body' => $message
                    ]
                ]
            );
    }

    public function notifyForEngineerApproval()
    {
        $requests = DB::table('requests')
            ->where('status', 'like', 'for engineer approval%')
            ->whereNull('whatsapp_notified')
            ->get();

        foreach ($requests as $req) {

            $this->sendWhatsAppMessage(
                '63' . ltrim($req->client_phone, '0'),
                "Good day {$req->client_name}!\n\n" .
                    "Your request is now FOR ENGINEER APPROVAL.\n" .
                    "Please check your dashboard."
            );

            DB::table('requests')
                ->where('id', $req->id)
                ->update(['whatsapp_notified' => now()]);
        }

        return response()->json([
            'message' => 'WhatsApp notifications sent'
        ]);
    }
}
