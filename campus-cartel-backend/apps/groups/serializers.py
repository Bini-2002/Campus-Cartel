from rest_framework import serializers
from .models import StudyGroup, Message

class StudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'subject', 'description', 'max_members', 'image', 'members']
        read_only_fields = ['members']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__' 