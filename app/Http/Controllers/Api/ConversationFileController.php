<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AttachmentResource;
use App\Models\Attachment;
use App\Models\Conversation;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConversationFileController extends ApiController
{
    public function index(Request $request, Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $perPage = min((int) $request->get('per_page', 20), 50);
        $attachments = Attachment::query()
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id))
            ->with(['message.conversation.workspace'])
            ->latest()
            ->paginate($perPage);

        return $this->success(AttachmentResource::collection($attachments));
    }

    public function download(Workspace $workspace, Conversation $conversation, Attachment $attachment): mixed
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        if ($attachment->message->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('view', $attachment);

        if (! Storage::disk('local')->exists($attachment->storage_path)) {
            return $this->notFound('File not found.');
        }

        return Storage::disk('local')->download(
            $attachment->storage_path,
            $attachment->original_name,
            [
                'Content-Type' => $attachment->mime_type,
            ]
        );
    }
}
