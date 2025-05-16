from rest_framework import serializers
from .models import Post, Comment

class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'image', 'likes', 'like_count', 'comment_count', 'created_at']
        read_only_fields = ['likes', 'like_count', 'comment_count', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    post_image = serializers.ImageField(source='post.image', read_only=True)  # Include post image

    class Meta:
        model = Comment
        fields = ['id', 'post', 'post_image', 'author', 'content', 'likes', 'like_count', 'created_at']
        read_only_fields = ['likes', 'like_count', 'created_at']

    def create(self, validated_data):
        post = validated_data.get('post')
        author = self.context['request'].user
        content = validated_data.get('content')

        comment = Comment.objects.create(post=post, author=author, content=content)
        return comment
    
    def update(self, instance, validated_data):
        instance.content = validated_data.get('content', instance.content)
        instance.save()
        return instance
    
    def validate(self, data):
        if 'content' not in data or not data['content']:
            raise serializers.ValidationError("Content is required.")
        return data
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['post_image'] = instance.post.image.url if instance.post and instance.post.image else None
        return representation
        user = self.context['request'].user
        if not user.check_password(old_password):
            raise serializers.ValidationError("Old password is incorrect.")
        if old_password == new_password:
            raise serializers.ValidationError("New password cannot be the same as old password.")   
        return attrs
    