<?php

namespace App\Actions;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;

final class RemoveConversationMemberAction
{
    public function execute(Conversation $conversation, ConversationMember $member, User $actor): void
    {
        if ($member->conversation_id !== $conversation->id) {
            throw new \InvalidArgumentException('Member does not belong to this conversation.');
        }

        $actorMembership = $conversation->memberForUser($actor);
        if (!$actorMembership) {
            throw new \InvalidArgumentException('You are not a member of this conversation.');
        }

        if ($actor->id === $member->user_id) {
            $member->delete();
            return;
        }

        if ($conversation->created_by !== $actor->id) {
            throw new \InvalidArgumentException('Only the conversation creator can remove other members.');
        }

        $member->delete();
    }
}
