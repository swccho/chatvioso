<?php

use App\Models\Conversation;
use App\Models\Workspace;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) {
        return false;
    }
    return $conversation->hasMember($user);
});

Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
    $workspace = Workspace::find($workspaceId);
    if (!$workspace || !$workspace->memberForUser($user)) {
        return false;
    }
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});
