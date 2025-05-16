# filepath: c:\Users\binig\Desktop\Campus-Cartel\campus-cartel-backend\apps\users\management\commands\populate_db.py

from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.posts.models import Post
from apps.groups.models import StudyGroup

class Command(BaseCommand):
    help = "Populate the database with mock data"

    def handle(self, *args, **kwargs):
        # Create 5 users
        users = []
        for i, username in enumerate(['alice', 'bob', 'charlie', 'dave', 'eve'], start=1):
            user = User.objects.create(
                username=username,
                email=f"{username}@example.com",
                avatar=f"https://example.com/avatar{i}.png",
                bio=f"{username.capitalize()} is a cybersecurity enthusiast.",
                university="Cyber University",
                major="Cybersecurity",
                year="Junior"
            )
            users.append(user)

        # Create a common group
        group = StudyGroup.objects.create(
            name="Cyber Security",
            subject="Cybersecurity",
            description="A group for cybersecurity enthusiasts.",
            max_members=50,
            meeting_time="Wednesdays at 6 PM",
            location="Room 202",
            image="https://example.com/group1.png"
        )

        # Add all users to the group
        group.members.set(users)

        # Create 2 posts for each user
        posts = []
        for user in users:
            for j in range(1, 3):
                post = Post.objects.create(
                    author=user,
                    content=f"{user.username.capitalize()}'s post {j} about cybersecurity.",
                    image=f"https://example.com/post{j}.png"
                )
                posts.append(post)

        # Add likes for each other's posts
        for post in posts:
            for user in users:
                if post.author != user:  # Users cannot like their own posts
                    post.likes.add(user)

        self.stdout.write(self.style.SUCCESS("Database populated successfully!"))