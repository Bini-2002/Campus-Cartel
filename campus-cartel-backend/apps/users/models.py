from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('organization', 'Organization'),
    ]
    YEAR_CHOICES = [
        ('freshman', 'Freshman'),
        ('sophomore', 'Sophomore'),
        ('junior', 'Junior'),
        ('senior', 'Senior'),
        ('graduate', 'Graduate'),
        ('other', 'Other'),
    ]

    firstname = models.CharField(max_length=50, blank=True, null=True)
    lastname = models.CharField(max_length=50, blank=True, null=True)
    avatar = models.ImageField(blank=True, null=True, upload_to='avatars/')
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    university = models.CharField(max_length=255, blank=False, null=True)
    major = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=50 ,choices=YEAR_CHOICES, default='other',blank=False, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')
    followers = models.ManyToManyField(
        'self', symmetrical=False, related_name='following', blank=True
    )

    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_set",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )
    REQUIRED_FIELDS = ['username', 'user_type']
    USERNAME_FIELD = 'email'


    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username

    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.firstname} {self.lastname}"
    
    def get_short_name(self):
        return self.firstname
    
    def get_user_type(self):
        return self.user_type
    
    