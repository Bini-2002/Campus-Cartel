from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.groups.models import StudyGroup
from apps.users.models import User

class GroupTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        self.group_url = reverse('studygroup-list')

    def test_create_group(self):
        response = self.client.post(self.group_url, {
            'name': 'Test Group',
            'subject': 'Test Subject',
            'description': 'This is a test group',
            'max_members': 10,
            'meeting_time': 'Fridays at 5 PM',
            'location': 'Room 101'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StudyGroup.objects.count(), 1)
        self.assertEqual(StudyGroup.objects.first().name, 'Test Group')

    def test_join_group(self):
        group = StudyGroup.objects.create(
            name='Test Group',
            subject='Test Subject',
            description='This is a test group',
            max_members=10,
            meeting_time='Fridays at 5 PM',
            location='Room 101'
        )
        join_url = reverse('join-group', args=[group.id])
        response = self.client.post(join_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(group.members.count(), 1)