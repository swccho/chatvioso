<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MentionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Message $message,
        public User $mentionedBy
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $conversation = $this->message->conversation;
        return [
            'type' => 'mention',
            'title' => 'You were mentioned',
            'body' => $this->mentionedBy->name.' mentioned you in a conversation',
            'link' => '/app/workspaces/'.$conversation->workspace_id.'/conversations/'.$conversation->id,
            'message_id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'workspace_id' => $conversation->workspace_id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
