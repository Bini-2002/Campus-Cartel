from rest_framework import serializers
from .models import User
from django.contrib.auth import get_user_model  # Use get_user_model to reference the custom User model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'firstname', 'lastname', 'avatar', 'bio', 'university', 'major', 'year', 'user_type']

    def validate_email(self, value):
        user_type = self.initial_data.get('user_type')
        if user_type == 'student' and not value.endswith('.edu.et'):
            raise serializers.ValidationError("Students must register with a university email ending in '.edu.et'.")
        return value
    

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id','username', 'email', 'password', 'firstname', 'lastname', 'user_type']

    def create(self, validated_data):
        user = User.objects.create_user(
            username= validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
            user_type=validated_data['user_type']
        )
        return user
    
    def validate(self, attrs):
        email = attrs.get('email')
        user_type = attrs.get('user_type')

        # Validate student email domain
        if user_type == 'student' and not email.endswith('.edu.et'):
            raise serializers.ValidationError("Students must register with a university email ending in '.edu.et'.")

        return attrs
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'firstname', 'lastname', 'avatar', 'bio', 'university', 'major', 'year']

    def update(self, instance, validated_data):
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.university = validated_data.get('university', instance.university)
        instance.major = validated_data.get('major', instance.major)
        instance.year = validated_data.get('year', instance.year)
        instance.save()
        return instance
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = User.objects.filter(email=email).first()
        if user is None or not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password")

        return attrs
class UserLogoutSerializer(serializers.Serializer):
    def validate(self, attrs):
        # No specific validation needed for logout
        return attrs

class UserChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context['request'].user
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')

        if not user.check_password(old_password):
            raise serializers.ValidationError("Old password is incorrect")

        if old_password == new_password:
            raise serializers.ValidationError("New password cannot be the same as the old password")

        return attrs
    def save(self):
        user = self.context['request'].user
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        return user

class UserResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        if new_password != confirm_password:
            raise serializers.ValidationError("New password and confirm password do not match")

        user = User.objects.filter(email=email).first()
        if user is None:
            raise serializers.ValidationError("User with this email does not exist")

        return attrs
    def save(self):
        email = self.validated_data['email']
        new_password = self.validated_data['new_password']

        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return user
    def send_reset_email(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
    

class UserProfileUpdateSerializer(serializers.ModelSerializer):     
    class Meta:
        model = User
        fields = ['firstname', 'lastname', 'avatar', 'bio', 'university', 'major', 'year']
        extra_kwargs = {
            'firstname': {'required': False},
            'lastname': {'required': False},
            'avatar': {'required': False},
            'bio': {'required': False},
            'university': {'required': False},
            'major': {'required': False},
            'year': {'required': False},
        }
        read_only_fields = ['id', 'email', 'user_type']