from django.urls import path
from .views import UserListCreateView, UserDetailView , RegisterView, UserProfileView, LogoutView ,UserLoginView

urlpatterns = [
    path('', UserListCreateView.as_view(), name='user-list'),
    path('<int:id>/', UserDetailView.as_view(), name='user-detail'),  # <-- Change pk to id
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', UserLoginView.as_view(), name='login'),
]