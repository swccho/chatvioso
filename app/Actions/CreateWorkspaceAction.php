<?php

namespace App\Actions;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Str;

final class CreateWorkspaceAction
{
    public function execute(User $user, string $name, ?string $description = null): Workspace
    {
        $slug = Str::slug($name);
        $baseSlug = $slug;
        $counter = 0;
        while (Workspace::where('slug', $slug)->exists()) {
            $counter++;
            $slug = $baseSlug . '-' . $counter;
        }

        $workspace = Workspace::create([
            'name' => $name,
            'slug' => $slug,
            'description' => $description,
            'user_id' => $user->id,
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        return $workspace->load('owner', 'members.user');
    }
}
