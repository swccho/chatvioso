<?php

namespace App\Providers;

use App\Models\ConversationMember;
use App\Models\WorkspaceMember;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::bind('member', fn (string $value) => WorkspaceMember::findOrFail($value));
        Route::bind('conversation_member', fn (string $value) => ConversationMember::findOrFail($value));
    }
}
