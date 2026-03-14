<?php

namespace App\Actions;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;

final class AddConversationMemberAction
{
    public function execute(Conversation $conversation, User $userToAdd): ConversationMember
    {
        if ($conversation->type === Conversation::TYPE_DIRECT) {
            throw new \InvalidArgumentException('Cannot add members to a direct conversation.');
        }

        if ($conversation->hasMember($userToAdd)) {
            throw new \InvalidArgumentException('User is already a member.');
        }

        $workspace = $conversation->workspace;
        if (!$workspace->memberForUser($userToAdd)) {
            throw new \InvalidArgumentException('User must be a workspace member to be added.');
        }

        return ConversationMember::create([
            'conversation_id' => $conversation->id,
            'user_id' => $userToAdd->id,
        ]);
    }
}
