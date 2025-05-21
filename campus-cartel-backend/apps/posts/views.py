from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny , IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from rest_framework.views import APIView
from django.contrib.auth import get_user_model


class PostListView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def perform_create(self, serializer):
        user = self.request.user
        print('DEBUG USER:', user, user.id, getattr(user, 'user_type', None))
        if user.is_authenticated and getattr(user, 'user_type', None) == 'student':
            serializer.save(author=user)
        else:
            raise ValidationError("Only authenticated students can create posts.")

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

class CommentListView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.request.query_params.get('post')
        if post_id:
            return Comment.objects.filter(post_id=post_id)
        return Comment.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated:
            serializer.save(author=user)
        else:
            raise ValidationError("Authentication required to comment.")
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        serializer.save()

class LikePostView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.likes_count = getattr(post, 'likes_count', 0) + 1
        post.save()
        return Response({'likes': post.likes_count})

class LikeCommentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes_count = getattr(comment, 'likes_count', 0) + 1
        comment.save()
        return Response({'likes': comment.likes_count})

    def delete(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes_count = max(getattr(comment, 'likes_count', 1) - 1, 0)
        comment.save()
        return Response({'likes': comment.likes_count})

class LikeCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes = getattr(comment, 'likes', 0) + 1
        comment.save()
        return Response({'likes': comment.likes})
class UnlikeCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes = max(getattr(comment, 'likes', 1) - 1, 0)
        comment.save()
        return Response({'likes': comment.likes})