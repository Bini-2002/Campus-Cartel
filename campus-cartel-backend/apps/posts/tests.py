from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.posts.models import Post
from apps.users.models import User

class PostTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        self.post_url = reverse('post-list')

    def test_create_post(self):
        response = self.client.post(self.post_url, {
            'content': 'This is a test post'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Post.objects.first().content, 'This is a test post')

    def test_fetch_posts(self):
        Post.objects.create(author=self.user, content='Test post 1')
        Post.objects.create(author=self.user, content='Test post 2')
        response = self.client.get(self.post_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)