from rest_framework import generics , status
from django.contrib.auth import get_user_model  # Use get_user_model to reference the custom User model
from .serializers import UserSerializer , RegisterSerializer , UserProfileSerializer , UserLoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated , IsAdminUser
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# Get the custom User model
User = get_user_model()

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        email = serializer.validated_data.get('email')
        user_type = serializer.validated_data.get('user_type')

        # Validate student email domain
        if user_type == 'student' and not email.endswith('.edu.et'):
            raise ValidationError("Students must register with a university email ending in '.edu.et'.")

        # Ensure password is hashed
        password = serializer.validated_data.get('password')
        serializer.save(password=make_password(password))

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

    def get_object(self):
        user = super().get_object()
        if not self.request.user.is_superuser and user != self.request.user:
            raise ValidationError("You do not have permission to access this user.")
        return user
    def perform_update(self, serializer):
        # Ensure password is hashed
        password = serializer.validated_data.get('password')
        if password:
            serializer.validated_data['password'] = make_password(password)
        serializer.save()
    
    def perform_destroy(self, instance):
        # Ensure the user is not trying to delete themselves
        if instance == self.request.user:
            raise ValidationError("You cannot delete your own account.")
        instance.delete()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        

class UserLoginView(APIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt)
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UserChangePasswordView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = self.get_object()
        old_password = self.request.data.get('old_password')
        new_password = self.request.data.get('new_password')

        if not user.check_password(old_password):
            raise ValidationError("Old password is incorrect")

        if old_password == new_password:
            raise ValidationError("New password cannot be the same as the old password")

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
    
class UserResetPasswordView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        email = self.request.data.get('email')
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise ValidationError("User with this email does not exist")