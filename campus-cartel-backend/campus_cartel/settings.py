import os
from pathlib import Path
from decouple import config

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key
SECRET_KEY = config('DJANGO_SECRET_KEY', default='your-default-secret-key')

# Debug mode
DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

# Allowed hosts
ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', default='').split(',')

# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # Django REST Framework
    'corsheaders',     # CORS Headers
    'apps.users',      # Custom app for users
    'apps.posts',      # Custom app for posts
    'apps.groups',     # Custom app for groups
    'rest_framework_simplejwt',  # JWT Authentication
    'rest_framework.authtoken',  # Token Authentication
    'django.contrib.sites',  # For allauth
    'rest_framework_simplejwt.token_blacklist',
    'allauth',  # Django Allauth
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS Middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Root URL configuration
ROOT_URLCONF = 'campus_cartel.urls'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI application
WSGI_APPLICATION = 'campus_cartel.wsgi.application'

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'campus_cartel',  # Replace with your database name
        'USER': 'root',           # Replace with your MySQL username
        'PASSWORD': 'Iso123mer356!',  # Replace with your MySQL password
        'HOST': 'localhost',      # Replace with your database host (e.g., localhost)
        'PORT': '3306', 
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins (for development only)

AUTH_USER_MODEL = 'users.User'

# filepath: c:\Users\binig\Desktop\Campus-Cartel\campus-cartel-backend\campus_cartel\settings.py

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',  # Ensure this is included
    ],
}

# filepath: c:\Users\binig\Desktop\Campus-Cartel\campus-cartel-backend\campus_cartel\settings.py

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]