<?php

namespace Michaelbelgium\Discussionviews\Listeners;

use Carbon\Carbon;
use Flarum\Api\Controller\ShowDiscussionController;
use Flarum\Discussion\Discussion;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Michaelbelgium\Discussionviews\Events\DiscussionWasViewed;
use Michaelbelgium\Discussionviews\Models\DiscussionView;

class AddDiscussionViewHandler
{
    private $settings;

    public function __construct(SettingsRepositoryInterface $settings) {
        $this->settings = $settings;
    }

    public function __invoke(ShowDiscussionController $controller, Discussion $discussion, $request, $document)
    {
        if($this->settings->get('michaelbelgium-discussionviews.track_unique', false)) {
            $existingViews = $discussion->views()->where('ip', $_SERVER['REMOTE_ADDR'])->get();
            if($existingViews->count() > 0) {
                return;
            }
        }
        
        $view = new DiscussionView();
        
        if(!$request->getAttribute('actor')->isGuest()) {
            $view->user()->associate($request->getAttribute('actor'));
        }

        $view->discussion()->associate($discussion);
        $view->ip = $_SERVER['REMOTE_ADDR'];
        $view->visited_at = Carbon::now();

        $discussion->views()->save($view);

        //for the (un)popular filter
        $discussion->view_count++;
        $discussion->save();

        event(new DiscussionWasViewed($request->getAttribute('actor'), $discussion));
    }
}