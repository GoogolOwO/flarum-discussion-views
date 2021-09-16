import { extend } from 'flarum/extend';
import username from 'flarum/helpers/username';
import icon from 'flarum/helpers/icon';
import punctuateSeries from 'flarum/helpers/punctuateSeries';
import avatar from 'flarum/helpers/avatar';
import ItemList from 'flarum/utils/ItemList';
import humanTime from 'flarum/utils/humanTime';
import CommentPost from 'flarum/components/CommentPost';
import Link from 'flarum/components/Link';
import DiscussionPage from 'flarum/components/DiscussionPage';
import FieldSet from 'flarum/components/FieldSet';
import UniqueViews from '../helpers/UniqueViews';

export default function () {
    extend(DiscussionPage.prototype, 'sidebarItems', function(items) {
        if(app.forum.attribute('showViewList') == 0) return;
        
        const views = this.discussion.views();
        const viewList = new ItemList();

        $.each(views, function(key, view) {
            var userName = view.user() === false ? app.translator.trans('michaelbelgium-discussion-views.forum.viewlist.guest') : view.user().username();

            var listitem = 
                <div className="item-lastUser-content">
                    {avatar(view.user())}
                    <div>
                        {userName}
                        <span className="lastUser-visited" title={view.visitedAt().toLocaleString()}>{humanTime(view.visitedAt())}</span>
                    </div>
                </div>;

            if(view.user() !== false) {
                listitem = <a href={app.route.user(view.user())}>{listitem}</a>;
            }

            viewList.add('lastUser-' + key, listitem);
        });

        items.add(
            'lastDiscussionViewers', 
            <FieldSet className='LastDiscussionUsers' label={app.translator.trans('michaelbelgium-discussion-views.forum.viewlist.title')}>
                {viewList.toArray()}
            </FieldSet>
        );
    });

    extend(CommentPost.prototype, 'footerItems', function(items) {
        if(app.forum.attribute('showFooterViewList') == 0) return;
        
        const post = this.attrs.post;
        const discussion = post.discussion();
        const views = discussion.views();
        const firstPostId = discussion.posts()[0].id();

        if(firstPostId === post.id()) {
            if(views && views.length > 0) {
                const limit = 5;

                const names = UniqueViews(views, limit).map(user => {
                    return (
                        <Link href={app.route.user(user)}>
                            {user === app.session.user ? app.translator.trans('michaelbelgium-discussion-views.forum.post.you') : username(user)}
                        </Link>
                    )
                });



                if(names.length > 0) {
                    items.add('viewed', (
                        <div className="Post-Discussion-viewedBy">
                            {icon('fas fa-eye')}
                            {app.translator.trans('michaelbelgium-discussion-views.forum.post.viewed_by', {
                                users: punctuateSeries(names)
                            })}
                        </div>
                    ));
                }
            }    
        }
    });
}