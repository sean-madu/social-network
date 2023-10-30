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
from social_media.views import AuthorDetail, AuthorList, PostList, PostDetail, CommentList, CommentDetail, CustomPostViewSet
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
    path("register", views.index, name="index"),
    path("profile", views.index, name="index"),
    path("homepage", views.index, name="index"),
    

    path('authors/', AuthorList, name='author-list'),
    path('authors/<uuid:author_id>/', AuthorDetail, name='author-detail'),
    path('authors/<uuid:author_id>/posts/', PostList, name='post-list'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/', PostDetail, name='post-detail'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/comments/', CommentList, name='comment-list'),
    path('authors/<uuid:author_id>/posts/<uuid:post_id>/comments/<uuid:comment_id>', CommentDetail, name='comment-detail'),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
