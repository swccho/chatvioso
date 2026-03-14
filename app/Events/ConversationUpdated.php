<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Conversation $conversation,
        public ?string $lastMessagePreview = null
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversation->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ConversationUpdated';
    }

    public function broadcastWith(): array
    {
        $payload = [
            'conversation' => [
                'id' => $this->conversation->id,
                'updated_at' => $this->conversation->updated_at->toIso8601String(),
            ],
        ];
        if ($this->lastMessagePreview !== null) {
            $payload['conversation']['last_message_preview'] = $this->lastMessagePreview;
        }
        return $payload;
    }
}
