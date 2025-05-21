from rest_framework import serializers
from .models import Post, Comment
from apps.users.serializers import UserSerializer  # Adjust as needed

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'

    def get_like_count(self, obj):
        return obj.likes.count()