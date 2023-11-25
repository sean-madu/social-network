"""django_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views
from social_media.views import AuthorDetail, AuthorList, PostList, PostDetail, CommentList, CommentDetail, LikesForLikes, LikesForLiked, Register
from rest_framework.routers import DefaultRouter
from rest_framework import permissions
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

schema_view = get_schema_view(
   openapi.Info(
      title="Social Distribution API",
      default_version='v1',
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path("profile", views.index, name="index"),
    path("homepage", views.index, name="index"),
    
    # Register
    path("register/", Register, name="register"),
    # Authors
    path('authors/', AuthorList, name='author-list'),
    path('authors/<uuid:author_key>/', AuthorDetail, name='author-detail'),
    # Posts
    path('authors/<uuid:author_key>/posts/', PostList, name='post-list'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/', PostDetail, name='post-detail'),
    # Comments
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/comments/', CommentList, name='comment-list'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>', CommentDetail, name='comment-detail'),
    # Likes
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>/likes/', LikesForLikes, name='likes-list'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/likes/', LikesForLikes, name='likes-list'),
    path('authors/<uuid:author_key>/liked/', LikesForLiked, name='liked-list'),

    # Swagger Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # Auth
    path('auth/', include('social_media.urls')),

]
