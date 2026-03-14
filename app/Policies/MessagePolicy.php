<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function view(User $user, Message $message): bool
    {
        return $message->conversation->hasMember($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Message $message): bool
    {
        return $message->conversation->hasMember($user) && $message->isOwnedBy($user);
    }

    public function delete(User $user, Message $message): bool
    {
        return $message->conversation->hasMember($user) && $message->isOwnedBy($user);
    }
}
