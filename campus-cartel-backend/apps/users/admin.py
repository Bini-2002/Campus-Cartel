from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'user_type', 'is_superuser', 'is_staff')
    search_fields = ('username', 'email')
    list_filter = ('user_type', 'is_superuser', 'is_staff')
    ordering = ('username',)

    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'avatar', 'bio', 'university', 'major', 'year'),
        }),
    )