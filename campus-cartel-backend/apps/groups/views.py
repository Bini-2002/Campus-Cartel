from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import StudyGroup, Message
from .serializers import StudyGroupSerializer, MessageSerializer

class StudyGroupListView(generics.ListCreateAPIView):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.user_type != 'student':
            raise ValidationError("Only students can create groups.")
        serializer.save()

class StudyGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]

class JoinGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.user_type != 'student':
            return Response({'detail': 'Only students can join groups.'}, status=status.HTTP_403_FORBIDDEN)
        group = get_object_or_404(StudyGroup, pk=pk)
        group.members.add(request.user)
        group.save()
        return Response({'detail': f'Joined group {group.name} successfully.', 'members': group.members.count()})

class GroupMessagesView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return Message.objects.filter(group_id=group_id).order_by('timestamp')

    def perform_create(self, serializer):
        group = get_object_or_404(StudyGroup, pk=self.kwargs['group_id'])
        if self.request.user.user_type != 'student':
            raise ValidationError("Only students can chat in groups.")
        if self.request.user not in group.members.all():
            raise ValidationError("You must join the group to send messages.")
        serializer.save(group=group, sender=self.request.user)