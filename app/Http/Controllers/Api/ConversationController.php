<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateChannelAction;
use App\Actions\CreateDirectConversationAction;
use App\Actions\CreateGroupConversationAction;
use App\Events\ConversationRead;
use App\Http\Requests\StoreChannelRequest;
use App\Http\Requests\StoreDirectConversationRequest;
use App\Http\Requests\StoreGroupConversationRequest;
use App\Http\Requests\UpdateConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class ConversationController extends ApiController
{
    public function __construct(
        private CreateDirectConversationAction $createDirect,
        private CreateGroupConversationAction $createGroup,
        private CreateChannelAction $createChannel
    ) {}

    public function index(Workspace $workspace): JsonResponse
    {
        $user = request()->user();
        if (!$workspace->memberForUser($user)) {
            return $this->forbidden();
        }

        $conversations = Conversation::where('workspace_id', $workspace->id)
            ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->with(['members.user', 'workspace'])
            ->latest('updated_at')
            ->limit(50)
            ->get();

        $conversationIds = $conversations->pluck('id')->all();
        $unreadCounts = Conversation::unreadCountsForUser($user, $conversationIds);
        foreach ($conversations as $conversation) {
            $conversation->setAttribute('cached_unread_count', $unreadCounts[$conversation->id] ?? 0);
        }

        return $this->success(ConversationResource::collection($conversations));
    }

    public function storeDirect(StoreDirectConversationRequest $request, Workspace $workspace): JsonResponse
    {
        $user = request()->user();
        if (!$workspace->memberForUser($user)) {
            return $this->forbidden();
        }

        $otherUser = User::findOrFail($request->validated('other_user_id'));
        try {
            $conversation = $this->createDirect->execute($workspace, $user, $otherUser);
            return $this->success(new ConversationResource($conversation), 'Conversation created.', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['other_user_id' => [$e->getMessage()]]);
        }
    }

    public function storeGroup(StoreGroupConversationRequest $request, Workspace $workspace): JsonResponse
    {
        $user = request()->user();
        if (!$workspace->memberForUser($user)) {
            return $this->forbidden();
        }

        $conversation = $this->createGroup->execute(
            $workspace,
            $user,
            $request->validated('name'),
            $request->validated('member_ids', [])
        );
        return $this->success(new ConversationResource($conversation), 'Conversation created.', 201);
    }

    public function storeChannel(StoreChannelRequest $request, Workspace $workspace): JsonResponse
    {
        $user = request()->user();
        if (!$workspace->memberForUser($user)) {
            return $this->forbidden();
        }

        $conversation = $this->createChannel->execute(
            $workspace,
            $user,
            $request->validated('name'),
            $request->boolean('is_private', false)
        );
        return $this->success(new ConversationResource($conversation), 'Channel created.', 201);
    }

    public function show(Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);
        $conversation->load(['members.user', 'workspace']);
        return $this->success(new ConversationResource($conversation));
    }

    public function update(UpdateConversationRequest $request, Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('update', $conversation);
        $conversation->update($request->validated());
        return $this->success(new ConversationResource($conversation->load(['members.user', 'workspace'])));
    }

    public function markRead(Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $user = request()->user();
        $member = $conversation->memberForUser($user);
        if (!$member) {
            return $this->forbidden();
        }

        $member->update(['last_read_at' => now()]);
        broadcast(new ConversationRead($conversation, $user, now()->toIso8601String()))->toOthers();
        return $this->success(null, 'Conversation marked as read.');
    }
}
