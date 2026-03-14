<?php

namespace App\Actions;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;
use App\Models\Workspace;

final class CreateDirectConversationAction
{
    public function execute(Workspace $workspace, User $creator, User $otherUser): Conversation
    {
        if ($creator->id === $otherUser->id) {
            throw new \InvalidArgumentException('Cannot create direct conversation with yourself.');
        }

        $existing = $this->findExistingDirectConversation($workspace, $creator, $otherUser);
        if ($existing) {
            return $existing->load(['members.user', 'workspace']);
        }

        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_DIRECT,
            'name' => null,
            'created_by' => $creator->id,
            'is_private' => true,
        ]);

        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $creator->id]);
        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $otherUser->id]);

        return $conversation->load(['members.user', 'workspace']);
    }

    private function findExistingDirectConversation(Workspace $workspace, User $user1, User $user2): ?Conversation
    {
        $ids = collect([$user1->id, $user2->id])->sort()->values()->toArray();
        $candidates = Conversation::where('workspace_id', $workspace->id)
            ->where('type', Conversation::TYPE_DIRECT)
            ->with('members')
            ->get();
        return $candidates->first(function (Conversation $c) use ($ids) {
            $memberIds = $c->members->pluck('user_id')->sort()->values()->toArray();
            return count($memberIds) === 2 && $memberIds === $ids;
        });
    }
}
