<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\UserResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceSearchController extends ApiController
{
    public function __invoke(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $q = trim((string) $request->get('q', ''));
        $type = $request->get('type', 'users');
        $perPage = min((int) $request->get('per_page', 20), 50);

        if ($q === '') {
            return $this->success([
                'users' => [],
                'conversations' => [],
                'messages' => [],
            ]);
        }

        $user = $request->user();
        $search = '%'.$q.'%';
        $result = ['users' => [], 'conversations' => [], 'messages' => []];

        if (in_array($type, ['users', 'all'], true)) {
            $memberIds = WorkspaceMember::where('workspace_id', $workspace->id)
                ->pluck('user_id');
            $users = \App\Models\User::whereIn('id', $memberIds)
                ->where(function ($query) use ($search): void {
                    $query->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search);
                })
                ->limit($perPage)
                ->get();
            $result['users'] = UserResource::collection($users)->resolve();
        }

        if (in_array($type, ['conversations', 'all'], true)) {
            $conversationIds = $user->conversations()
                ->where('workspace_id', $workspace->id)
                ->pluck('conversations.id');
            $conversations = Conversation::whereIn('id', $conversationIds)
                ->where(function ($query) use ($search): void {
                    $query->where('name', 'like', $search);
                })
                ->with('workspace')
                ->limit($perPage)
                ->get();
            $result['conversations'] = ConversationResource::collection($conversations)->resolve();
        }

        if (in_array($type, ['messages', 'all'], true)) {
            $conversationIds = $user->conversations()
                ->where('workspace_id', $workspace->id)
                ->pluck('conversations.id');
            $messages = Message::whereIn('conversation_id', $conversationIds)
                ->where('body', 'like', $search)
                ->with(['user', 'conversation'])
                ->latest()
                ->limit($perPage)
                ->get();
            $result['messages'] = MessageResource::collection($messages)->resolve();
        }

        return $this->success($result);
    }
}
