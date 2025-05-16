from django.urls import path
from .views import PostListView, PostDetailView, CommentListView, CommentDetailView , LikePostView , UnlikeCommentView , UnlikePostView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('<int:pk>/like/', LikePostView.as_view(), name='like-post'),
    path('comments/<int:pk>/like/', LikePostView.as_view(), name='like-comment'),
    path('comments/<int:pk>/unlike/', LikePostView.as_view(), name='unlike-comment'),
    path('<int:pk>/unlike/', LikePostView.as_view(), name='unlike-post'),
    path('comments/<int:pk>/unlike/', UnlikeCommentView.as_view(), name='unlike-comment'),
    path('<int:pk>/like/', UnlikePostView.as_view(), name='like-post'),
    path('comments/<int:pk>/like/', UnlikeCommentView.as_view(), name='like-comment'),
    path('comments/<int:pk>/unlike/', UnlikeCommentView.as_view(), name='unlike-comment'),
    path('<int:pk>/unlike/', UnlikePostView.as_view(), name='unlike-post'),
]