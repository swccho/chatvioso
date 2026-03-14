<?php

namespace App\Actions;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;
use App\Models\Workspace;

final class CreateGroupConversationAction
{
    public function execute(Workspace $workspace, User $creator, string $name, array $memberUserIds): Conversation
    {
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_GROUP,
            'name' => $name,
            'created_by' => $creator->id,
            'is_private' => true,
        ]);

        $allUserIds = array_unique(array_merge([$creator->id], $memberUserIds));
        foreach ($allUserIds as $userId) {
            ConversationMember::create([
                'conversation_id' => $conversation->id,
                'user_id' => $userId,
            ]);
        }

        return $conversation->load(['members.user', 'workspace']);
    }
}
