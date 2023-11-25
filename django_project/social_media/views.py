from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.pagination import PageNumberPagination

from .models import Post, Author, Comment, Like, User, Follower, FollowRequest, Node
from .serializers import PostSerializer, AuthorSerializer, CommentSerializer, LikeSerializer, FollowRequestSerializer, FollowerSerializer

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

# # https://stackoverflow.com/questions/4581789/how-do-i-get-user-ip-address-in-django
# def IsRemote(request):
#     x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR') # Handle proxy servers (not required but will keep in)
#     if x_forwarded_for:
#         ip = x_forwarded_for.split(',')[0]
#     else:
#         ip = request.META.get('REMOTE_ADDR') 
#     remote_node = Node.objects.filter(remote_ip=ip) 
#     if remote_node:
#         return True
#     return False
    
# # https://simpleisbetterthancomplex.com/tutorial/2018/12/19/how-to-use-jwt-authentication-with-django-rest-framework.html
# def JWTAuth(request): # handle local authentication
#     print(request.META)
#     if 'HTTP_AUTHORIZATION' in request.META:
#         auth = request.META['HTTP_AUTHORIZATION'].split()
#         if len(auth) == 2:
#             if auth[0].lower() == 'bearer':
#                 token = auth[1]
#                 try:
#                     payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
#                     username = payload.get('username')
#                     user = authenticate(username=username)
#                     if user is not None and user.is_active:
#                         login(request, user)
#                         request.user = user
#                         return 0
#                 except jwt.ExpiredSignatureError:
#                     # refresh = RefreshToken(token)
#                     # new_access_token = str(refresh.access_token)
#                     # # Set the new access token in the Authorization header
#                     # request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_access_token}'
#                     # return 
#                     # return Response({'detail': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
#                     return 1
#                 except jwt.InvalidTokenError:
#                     # return Response({'detail': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
#                     return 1
#     # return Response(status=status.HTTP_401_UNAUTHORIZED)
#     return 1
# # https://www.djangosnippets.org/snippets/243/
# def BasicAuth(request): # handle remote authentication
#     if 'HTTP_AUTHORIZATION' in request.META:
#         # if request.user: 
#         #     return
#         auth = request.META['HTTP_AUTHORIZATION'].split()
#         if len(auth) == 2:
#             if auth[0].lower() == 'basic':
#                 username, password = base64.b64decode(auth[1]).decode('utf-8').split(':')
#                 user = authenticate(username=username, password=password)
#                 if user is not None:
#                     if user.is_active:
#                         login(request, user)
#                         request.user = user
#                         return 0
#     # return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
#     return 1
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
                comments = Comment.objects.filter( post=post)
                serializer = CommentSerializer(comments, many=True)
                # Sanitize HTML content in the list view
                for comment in serializer.data:
                    comment['comment'] = bleach.clean(comment['comment'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)
                return Response(serializer.data)
            if request.method == 'POST':

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
