from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny ,IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

class PostListView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a post.")

        if self.request.user.is_superuser:
            serializer.save(author=self.request.user)
            return

        if not hasattr(self.request.user, 'user_type') or self.request.user.user_type != 'student':
            raise PermissionDenied("Only students are allowed to create posts.")

        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        if self.request.user.is_superuser:
            serializer.save()
            return

        post = self.get_object()
        if self.request.user != post.author:
            raise PermissionDenied("You are not allowed to edit this post.")
        serializer.save()
    
    def perform_destroy(self, instance):
        if self.request.user.is_superuser:
            instance.delete()
            return

        if self.request.user != instance.author:
            raise PermissionDenied("You are not allowed to delete this post.")
        instance.delete()

    


class CommentListView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        post_id = self.request.query_params.get('post')
        if post_id:
            return Comment.objects.filter(post_id=post_id)
        return Comment.objects.all()

    def perform_create(self, serializer):
        if self.request.user.is_superuser:
            serializer.save(author=self.request.user)
            return

        if self.request.user.user_type != 'student':
            raise ValidationError("Only students are allowed to comment on posts.")

        serializer.save(author=self.request.user)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        if self.request.user.is_superuser:
            serializer.save()
            return

        comment = self.get_object()
        if self.request.user != comment.author:
            raise ValidationError("You are not allowed to edit this comment.")
        serializer.save()

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.likes.add(request.user)
        return Response({'likes': post.likes.count()})
    
    def delete(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.likes.remove(request.user)
        return Response({'likes': post.likes.count()})

class LikeCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes.add(request.user)
        return Response({'likes': comment.likes.count()})
    
    def delete(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes.remove(request.user)
        return Response({'likes': comment.likes.count()})

class UnlikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.likes.remove(request.user)
        return Response({'likes': post.likes.count()})
    
    def delete(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.likes.add(request.user)
        return Response({'likes': post.likes.count()})

class UnlikeCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes.remove(request.user)
        return Response({'likes': comment.likes.count()})
    
    def delete(self, request, pk):
        comment = Comment.objects.get(pk=pk)
        comment.likes.add(request.user)
        return Response({'likes': comment.likes.count()})
    