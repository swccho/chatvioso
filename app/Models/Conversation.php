<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    public const TYPE_DIRECT = 'direct';
    public const TYPE_GROUP = 'group';
    public const TYPE_CHANNEL = 'channel';

    protected $fillable = [
        'workspace_id',
        'type',
        'name',
        'created_by',
        'is_private',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ConversationMember::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function memberForUser(User $user): ?ConversationMember
    {
        return $this->members()->where('user_id', $user->id)->first();
    }

    public function hasMember(User $user): bool
    {
        return $this->memberForUser($user) !== null;
    }

    public function unreadCountForUser(User $user): int
    {
        $member = $this->memberForUser($user);
        if (!$member) {
            return 0;
        }
        $query = $this->messages();
        if ($member->last_read_at !== null) {
            $query->where('created_at', '>', $member->last_read_at);
        }
        return $query->count();
    }

    /**
     * Batch unread counts for a user across many conversations (avoids N+1).
     *
     * @param  array<int, int>  $conversationIds
     * @return array<int, int>  conversation_id => unread_count
     */
    public static function unreadCountsForUser(User $user, array $conversationIds): array
    {
        if ($conversationIds === []) {
            return [];
        }

        $results = \App\Models\Message::query()
            ->join('conversation_members', function ($join) use ($user): void {
                $join->on('messages.conversation_id', '=', 'conversation_members.conversation_id')
                    ->where('conversation_members.user_id', '=', $user->id);
            })
            ->whereIn('messages.conversation_id', $conversationIds)
            ->whereRaw('(conversation_members.last_read_at IS NULL OR messages.created_at > conversation_members.last_read_at)')
            ->groupBy('messages.conversation_id')
            ->selectRaw('messages.conversation_id as id, COUNT(*) as unread')
            ->pluck('unread', 'id')
            ->all();

        return array_map('intval', $results);
    }
}
