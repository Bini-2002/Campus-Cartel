from django.contrib import admin
from .models import Post, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content', 'created_at')
    search_fields = ('content', 'author__username')
    list_filter = ('created_at', 'author__user_type')
    ordering = ('-created_at',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'author', 'content', 'created_at')
    search_fields = ('content', 'author__username', 'post__content')
    list_filter = ('created_at', 'author__user_type')
    ordering = ('-created_at',)