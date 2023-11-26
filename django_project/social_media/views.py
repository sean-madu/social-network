from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.pagination import PageNumberPagination

from .models import Post, Author, Comment, Like, User, Follower, FollowRequest, Node, InboxItem
from .serializers import PostSerializer, AuthorSerializer, CommentSerializer, LikeSerializer, FollowRequestSerializer, FollowerSerializer, InboxItemSerializer

import bleach
import urllib.parse


BASE_URL = 'http://127.0.0.1:8000/'


# For authentication 
from django.contrib.auth import authenticate, login
import base64
import jwt
from django_project.settings import SECRET_KEY

# For registering a new user
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .permissions import CustomPermission
# from django.views.decorators.csrf import csrf_exempt

@api_view(['POST'])
@permission_classes([AllowAny])
def Register(request):
    if request.method == 'POST':
        print(request.data)
        user = User.objects.create_user(username=request.data['Username'], password=request.data['Password'])
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([CustomPermission])

@api_view(['GET','POST'])
def AuthorList(request):
    if request.method == 'GET':
        # if IsRemote(request) is True:
        #     state = BasicAuth(request)
        #     if state is 1:
        #         return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        # else:
        #     state = JWTAuth(request)
        #     if state is 1:
        #         return Response({'detail': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        # use default paginator set in settings
        paginator = PageNumberPagination()
        authors = Author.objects.all().order_by('key') # Need to be ordered to be paginated...
        result_page = paginator.paginate_queryset(authors, request)


        if result_page:
            serializer = AuthorSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        # If somehow pagination doesn't occur, return the whole list anyways
        serializer = AuthorSerializer(authors, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # bool = IsRemote(request)
        # if bool:
        #     return Response(serializer.errors, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        serializer = AuthorSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([CustomPermission])  
@api_view(['GET','POST','DELETE'])
def AuthorDetail(request, author_key):
    try:
        author = Author.objects.get(pk=author_key)
    except Author.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


    if request.method == 'GET':
        serializer = AuthorSerializer(author)
        return Response(serializer.data)


    elif request.method == 'DELETE':
        author.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'POST':
        serializer = AuthorSerializer(author, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([CustomPermission])  
@api_view(['GET', 'POST'])
def PostList(request, author_key):
    try:
        author = Author.objects.get(key=author_key)  # Retrieve the author by author_key


        if request.method == 'GET':
            # Query posts related to the specified author
            posts = Post.objects.filter(author=author)
            serializer = PostSerializer(posts, many=True)


            # Sanitize HTML content in the list view
            for post in serializer.data:
                post['content'] = bleach.clean(post['content'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)


            return Response(serializer.data)


        elif request.method == 'POST':
            # Handle POST requests to create a new post associated with the author
            request.data['author'] = author.key  # Set the author for the new post
            serializer = PostSerializer(data=request.data)
            if serializer.is_valid():
                print(serializer._validated_data)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    except Author.DoesNotExist as e:
        
        print(e)
        return Response(status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])
@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def PostDetail(request, author_key, post_key):
    try:
        author = Author.objects.get(key=author_key)  # Retrieve the author by author_key


        try:
            post = Post.objects.get(key=post_key, author=author)  # Retrieve the post by post_key and author
            if request.method == 'GET':
                # Handle GET requests to retrieve a specific post
                serializer = PostSerializer(post)


                # Sanitize HTML content in the detail view
                serializer.data['content'] = bleach.clean(serializer.data['content'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)


                return Response(serializer.data)


            elif request.method == 'POST':
                # Handle POST requests to update a specific post
                serializer = PostSerializer(post, data=request.data)
                request.data['author'] = author.key
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                else:
                    print(serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


            elif request.method == 'DELETE':
                # Handle DELETE requests to delete a specific post
                post.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            elif request.method == 'PUT':
                pass


        except Post.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    
    except Author.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])
@api_view(['GET', 'POST'])
def CommentList(request, author_key, post_key):
    try:
        #author = Author.objects.get(key=author_key)  # Retrieve the author by author_key
        try:
            post = Post.objects.get(key=post_key)
            if request.method == 'GET':
                comments = Comment.objects.filter(post=post)

                serializer = CommentSerializer(comments, many=True)
                # Sanitize HTML content in the list view
                for comment in serializer.data:
                    comment['comment'] = bleach.clean(comment['comment'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)
                return Response(serializer.data)
            if request.method == 'POST':
                # TODO: Uncomment code below whenever ready or remove it - kept it uncommented from the merge conflict between main and this pull request 
                # Handle POST requests to create a new post associated with the author
                #request.data['author'] = author.key  # Set the author for the new post # Require author in post
    
                request.data['post'] = post.key
                serializer = CommentSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)      
    except Author.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])  
@api_view(['GET', 'DELETE'])
def CommentDetail(request, post_key, author_key, comment_key):
    try:
        author = Author.objects.get(pk=author_key)
        try:
            post = Post.objects.get(key=post_key)
            try:
                comment = Comment.objects.get(key=comment_key)
                if request.method == 'GET':
                        serializer = CommentSerializer(comment)
                        return Response(serializer.data)
                elif request.method == 'DELETE':
                        comment.delete()
                        return Response(status=status.HTTP_204_NO_CONTENT)
            except Comment.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        except Post.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    except Author.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])
@api_view(['GET', 'POST'])
def LikesForLikes(request, author_key, post_key, comment_key=None):
    post = get_object_or_404(Post, key=post_key)
        
    try:
        # GET request to retrieve likes on a specific post or comment
        if request.method == 'GET':
            if comment_key:
                # Fetch the comment associated with the given ID
                comment = get_object_or_404(Comment, key=comment_key)
                # Fetch likes related to the specified comment
                likes = Like.objects.filter(comment=comment)
            else:
                likes = Like.objects.filter(post=post)
            
            serializer = LikeSerializer(likes, many=True)
            return Response(serializer.data)
    
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # POST requests for posting to likes on a post/comment
    if request.method == 'POST':
        serializer_data = request.data.copy()  # Create a mutable copy of request.data
        
        if comment_key:  # If there's a comment_id in the URL, associate the like with the comment
            serializer_data['comment'] = comment_key
        
        serializer = LikeSerializer(data=serializer_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
@permission_classes([CustomPermission])
@api_view(['GET'])
def LikesForLiked(request, author_key):
    likes = Like.objects.filter(author=author_key)
    serializer = LikeSerializer(likes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getAuthorFromUser(request, username):
    try:
        user = User.objects.get(username=username)
        try:
            author = Author.objects.get(user=user)
            serializer = AuthorSerializer(author)
            return Response(serializer.data)
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def FollowerList(request, author_key):
    if request.method == 'GET':
        author_id = Author.objects.get(pk=author_key).id
        follower = Follower.objects.filter(object=author_id)
        serializer = FollowerSerializer(follower, many=True)
        return  Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])        
def FollowerDetail(request, author_key, foreign_id):
    if request.method == 'PUT':
        serializer = FollowerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        author_id = Author.objects.get(pk=author_key).id
        try:
            follower = Follower.objects.get(object=author_id, actor__contains=foreign_id)
            serializer = FollowerSerializer(follower)
            return  Response(serializer.data)
        except Follower.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        author_id = Author.objects.get(pk=author_key).id
        try:
            follower = Follower.objects.get(object=author_id, actor__contains=foreign_id)
            follower.delete()
        except Follower.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST', 'DELETE'])    
def InboxView(request, author_key):
    if request.method == 'GET':
        try:
            author = Author.objects.get(pk = author_key)
            items = InboxItem.objects.filter(author=author)
            serializer = InboxItemSerializer(items, many=True)
            return Response(serializer.data)
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'POST':
        try:
            author = Author.objects.get(pk = author_key)
            data = request.data.copy()
            data['author'] = author_key
            if data['type'] == 'post'  or  data['type'] == 'comment' or data['type'] == 'like':
                if not 'id' in data or len(data['id']) == 0:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
            elif data['type'] == 'follow':
                if not 'actor' in data:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
                followReq = {"actor" : data['actor'], "object": author.id, "summary": "follow request from someone"}
                serializer = FollowRequestSerializer(data=followReq)
                if serializer.is_valid():
                    serializer.save()
                    data['object'] = author.id
            else:
                
                return Response(status=status.HTTP_400_BAD_REQUEST)
            serializer = InboxItemSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'DELETE':
        try:
            author = Author.objects.get(pk = author_key)
            items = InboxItem.objects.filter(author=author)
            items.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)