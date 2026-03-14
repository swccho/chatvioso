<?php

namespace App\Actions;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

final class SendMessageAction
{
    public function execute(Conversation $conversation, User $user, string $body, ?int $parentId = null): Message
    {
        if (!$conversation->hasMember($user)) {
            throw new \InvalidArgumentException('You are not a member of this conversation.');
        }

        if ($parentId !== null) {
            $parent = Message::where('conversation_id', $conversation->id)->find($parentId);
            if (!$parent) {
                throw new \InvalidArgumentException('Reply target message not found in this conversation.');
            }
        }

        return Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => $body,
            'parent_id' => $parentId,
            'type' => Message::TYPE_MESSAGE,
        ]);
    }
}
