from django.urls import path
from .views import StudyGroupListView, StudyGroupDetailView, GroupMessagesView, JoinGroupView

urlpatterns = [
    path('', StudyGroupListView.as_view(), name='studygroup-list'),
    path('<int:pk>/', StudyGroupDetailView.as_view(), name='studygroup-detail'),
    path('<int:group_id>/messages/', GroupMessagesView.as_view(), name='group-messages'),
    path('<int:pk>/join/', JoinGroupView.as_view(), name='join-group'),
]