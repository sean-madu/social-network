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
from social_media.views import AuthorDetail, AuthorList, PostList, PostDetail, CommentList, CommentDetail, LikesForLikes, LikesForLiked, getAuthorFromUser, FollowerList, FollowerDetail
from social_media.views import InboxView, AuthorListAPI, FollowerListAPI, FollowerDetailAPI, InboxViewAPI, NodesList, FriendsList
from social_media.views import PostImage, CommentList, CommentDetail, LikesForLikes, LikesForLiked, getAuthorFromUser, FollowerList, FollowerDetail
from social_media.views import Register, UnlistedPost
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
    path("register/", views.index, name="register"),
    path("post/", views.index, name='unlisted-posts'),
    
    #Local Authors
    path('authors/', AuthorList, name='author-list'),
    path('authors/<uuid:author_key>/', AuthorDetail, name='author-detail'),
    path('authors/<uuid:author_key>/followers/', FollowerList, name="follower-list"),
    path('authors/<uuid:author_key>/followers/<str:foreign_id>/', FollowerDetail, name="follower-detail"),
    path('user/<str:username>/', getAuthorFromUser, name="get-author"),
    path('authors/<uuid:author_key>/inbox/', InboxView, name='inbox'),
    # Local Posts
    path('authors/<uuid:author_key>/posts/', PostList, name='post-list'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/', PostDetail, name='post-detail'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/image', PostImage, name='post-image'),
    # Comments
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/comments/', CommentList, name='comment-list'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>', CommentDetail, name='comment-detail'),
    # Local Likes
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>/likes/', LikesForLikes, name='likes-list'),
    path('authors/<uuid:author_key>/posts/<uuid:post_key>/likes/', LikesForLikes, name='likes-list'),
    path('authors/<uuid:author_key>/liked/', LikesForLiked, name='liked-list'),

    # Swagger Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    #Nodes
    path('nodes/', NodesList, name='nodes-list'),

    # Auth
    path('auth/', include('social_media.urls')),


    # Unlisted Posts,
    path('unlisted/authors/<uuid:author_key>/posts/<uuid:post_key>/',UnlistedPost, name='unlisted-post-detail' ),
    #Register
    path('service/register/', Register, name="register"),
    #Remote authors
    path('service/authors/', AuthorListAPI, name='author-list'),
    path('service/authors/<uuid:author_key>/', AuthorDetail, name='author-detail'),
    path('service/authors/<uuid:author_key>/followers/', FollowerListAPI, name="follower-list"),
    path('service/authors/<uuid:author_key>/friends/', FriendsList, name="friends-list"),
    path('service/authors/<uuid:author_key>/followers/<str:foreign_id>/', FollowerDetailAPI, name="follower-detail"),
    path('service/authors/<uuid:author_key>/inbox/', InboxViewAPI, name='inbox'),
    path('service/authors/<uuid:author_key>/posts/', PostList, name='post-list'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/', PostDetail, name='post-detail'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>/likes/', LikesForLikes, name='likes-list'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/likes/', LikesForLikes, name='likes-list'),
    path('service/authors/<uuid:author_key>/liked/', LikesForLiked, name='liked-list'),


    #Remote authors (No slash)
    path('service/authors', AuthorListAPI, name='author-list'),
    path('service/authors/<uuid:author_key>', AuthorDetail, name='author-detail'),
    path('service/authors/<uuid:author_key>/followers', FollowerListAPI, name="follower-list"),
    path('service/authors/<uuid:author_key>/friends', FriendsList, name="friends-list"),
    path('service/authors/<uuid:author_key>/followers/<str:foreign_id>', FollowerDetailAPI, name="follower-detail"),
    path('service/authors/<uuid:author_key>/inbox', InboxViewAPI, name='inbox'),
    path('service/authors/<uuid:author_key>/posts', PostList, name='post-list'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>', PostDetail, name='post-detail'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/image', PostImage, name='post-image'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/comments/', CommentList, name='comment-list'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>', CommentDetail, name='comment-detail'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/comments/<uuid:comment_key>/likes', LikesForLikes, name='likes-list'),
    path('service/authors/<uuid:author_key>/posts/<uuid:post_key>/likes', LikesForLikes, name='likes-list'),
    path('service/authors/<uuid:author_key>/liked', LikesForLiked, name='liked-list'),

]
