from django.urls import path
from .views import (
    PostListView, PostDetailView, CommentListView, CommentDetailView,
    LikePostView, LikeCommentView, UnlikeCommentView
)

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:id>/', PostDetailView.as_view(), name='post-detail'),
    path('comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('<int:id>/like/', LikePostView.as_view(), name='like-post'),
    path('comments/<int:pk>/like/', LikeCommentView.as_view(), name='like-comment'),
    path('comments/<int:pk>/unlike/', UnlikeCommentView.as_view(), name='unlike-comment'),
]