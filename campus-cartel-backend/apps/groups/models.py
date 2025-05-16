from django.db import models
from apps.users.models import User
from django.utils.timezone import now  # Import timezone for default values


class StudyGroup(models.Model):
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    max_members = models.PositiveIntegerField()
    image = models.ImageField(upload_to='group_images/', blank=True, null=True)
    members = models.ManyToManyField(User, related_name='study_groups', blank=True)
    created_at = models.DateTimeField(default=now,blank=True, null=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:20]}"