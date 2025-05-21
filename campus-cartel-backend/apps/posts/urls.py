from django.urls import path
from .views import PostListView, PostDetailView, CommentListView, CommentDetailView , LikePostView , UnlikeCommentView , UnlikePostView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:id>/', PostDetailView.as_view(), name='post-detail'),
    path('comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('<int:id>/like/', LikePostView.as_view(), name='like-post'),
    path('comments/<int:pk>/like/', LikePostView.as_view(), name='like-comment'),
    path('comments/<int:pk>/unlike/', LikePostView.as_view(), name='unlike-comment'),
    path('<int:id>/unlike/', LikePostView.as_view(), name='unlike-post'),
    path('comments/<int:pk>/unlike/', UnlikeCommentView.as_view(), name='unlike-comment'),
    path('<int:id>/like/', UnlikePostView.as_view(), name='like-post'),
    path('comments/<int:pk>/like/', UnlikeCommentView.as_view(), name='like-comment'),
    path('comments/<int:pk>/unlike/', UnlikeCommentView.as_view(), name='unlike-comment'),
    path('<int:id>/unlike/', UnlikePostView.as_view(), name='unlike-post'),
]