<?php

namespace App\Actions;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;
use App\Models\Workspace;

final class CreateChannelAction
{
    public function execute(Workspace $workspace, User $creator, string $name, bool $isPrivate = false): Conversation
    {
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => $name,
            'created_by' => $creator->id,
            'is_private' => $isPrivate,
        ]);

        ConversationMember::create([
            'conversation_id' => $conversation->id,
            'user_id' => $creator->id,
        ]);

        return $conversation->load(['members.user', 'workspace']);
    }
}
