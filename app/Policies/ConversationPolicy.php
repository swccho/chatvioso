<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->hasMember($user);
    }

    public function update(User $user, Conversation $conversation): bool
    {
        if (!$conversation->hasMember($user)) {
            return false;
        }
        if ($conversation->type === Conversation::TYPE_DIRECT) {
            return false;
        }
        return true;
    }

    public function addMember(User $user, Conversation $conversation): bool
    {
        if (!$conversation->hasMember($user)) {
            return false;
        }
        if ($conversation->type === Conversation::TYPE_DIRECT) {
            return false;
        }
        return true;
    }

    public function removeMember(User $user, Conversation $conversation): bool
    {
        return $conversation->hasMember($user);
    }
}
