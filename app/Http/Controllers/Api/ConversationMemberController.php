<?php

namespace App\Http\Controllers\Api;

use App\Actions\AddConversationMemberAction;
use App\Actions\RemoveConversationMemberAction;
use App\Http\Requests\AddConversationMemberRequest;
use App\Http\Resources\ConversationMemberResource;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class ConversationMemberController extends ApiController
{
    public function __construct(
        private AddConversationMemberAction $addMember,
        private RemoveConversationMemberAction $removeMember
    ) {}

    public function index(Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);
        $members = $conversation->members()->with('user')->get();
        return $this->success(ConversationMemberResource::collection($members));
    }

    public function store(AddConversationMemberRequest $request, Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('addMember', $conversation);

        $userToAdd = User::findOrFail($request->validated('user_id'));
        try {
            $member = $this->addMember->execute($conversation, $userToAdd);
            $member->load('user');
            return $this->success(new ConversationMemberResource($member), 'Member added.', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['user_id' => [$e->getMessage()]]);
        }
    }

    public function destroy(Workspace $workspace, Conversation $conversation, ConversationMember $member): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        if ($member->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('removeMember', $conversation);

        try {
            $this->removeMember->execute($conversation, $member, request()->user());
            return $this->success(null, 'Member removed.');
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['member' => [$e->getMessage()]]);
        }
    }
}
