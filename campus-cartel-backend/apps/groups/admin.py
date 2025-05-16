from django.contrib import admin
from .models import StudyGroup, Message

@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)
    ordering = ('-created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'group', 'sender', 'content', 'timestamp')
    search_fields = ('content', 'sender__username', 'group__name')
    list_filter = ('timestamp',)
    ordering = ('-timestamp',)