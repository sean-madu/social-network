from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.pagination import PageNumberPagination

from .models import Post, Author, Comment, Like, User, Follower, FollowRequest, Node, InboxItem
from .serializers import PostSerializer, AuthorSerializer, CommentSerializer, LikeSerializer, FollowRequestSerializer, FollowerSerializer, InboxItemSerializer, DummyAuthor, NodeSerializer

import bleach
import urllib.parse


BASE_URL = 'https://cmput404-social-network-401e4cab2cc0.herokuapp.com/'

# For authentication 
from django.contrib.auth import authenticate, login
import base64
import jwt
from django_project.settings import SECRET_KEY

# For registering a new user
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .permissions import CustomPermission
from django.views.decorators.csrf import csrf_exempt

# For Swagger UI api documentation
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    methods=['POST'],
    operation_description="Create a user.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'Username': openapi.Schema(type=openapi.TYPE_STRING, description='username'),
            'Password': openapi.Schema(type=openapi.TYPE_STRING, description='password'),
        }, 
        required = ['Username','Password']
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
@api_view(['POST'])
@csrf_exempt
@permission_classes([])
def Register(request):
    if request.method == 'POST':
        try:
            user = User.objects.create_user(username=request.data['Username'], password=request.data['Password'])
            return Response({'detail': 'User created sucessfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

# TODO: Update the swagger scheme according to Madu's refactor
@permission_classes([CustomPermission])
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve authors.",
    responses={200: 'OK'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Create a new author.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user': openapi.Schema(type=openapi.TYPE_INTEGER, description='user pk', nullable=True),
            'id': openapi.Schema(type=openapi.TYPE_STRING, description='id', nullable=True),
            'host': openapi.Schema(type=openapi.TYPE_STRING, description='uuid', nullable=True),
            'displayName': openapi.Schema(type=openapi.TYPE_STRING, description='display name'),
            'url': openapi.Schema(type=openapi.TYPE_STRING, description='uuid', nullable=True),
            'github': openapi.Schema(type=openapi.TYPE_STRING, description='github url', nullable=True),
            'profileImage': openapi.Schema(type=openapi.TYPE_STRING, description='profile image url', nullable=True),
        },
        required=['displayName']
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
@api_view(['GET','POST'])
def AuthorList(request):
    if request.method == 'GET':
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
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve an author.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Update an author.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user': openapi.Schema(type=openapi.TYPE_INTEGER, description='user pk', nullable=True),
            'id': openapi.Schema(type=openapi.TYPE_STRING, description='id', nullable=True),
            'host': openapi.Schema(type=openapi.TYPE_STRING, description='uuid', nullable=True),
            'displayName': openapi.Schema(type=openapi.TYPE_STRING, description='display name'),
            'url': openapi.Schema(type=openapi.TYPE_STRING, description='uuid', nullable=True),
            'github': openapi.Schema(type=openapi.TYPE_STRING, description='github url', nullable=True),
            'profileImage': openapi.Schema(type=openapi.TYPE_STRING, description='profile image url', nullable=True),
        },
        required=[]
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Delete an author.",
    responses={204: 'No Content', 404: 'Not Found'}
)
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
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve authors.",
    responses={200: 'OK'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Create a new author.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user': openapi.Schema(type=openapi.TYPE_INTEGER, description='user pk', nullable=True),
            'id': openapi.Schema(type=openapi.TYPE_STRING, description='id', nullable=True),
            'host': openapi.Schema(type=openapi.TYPE_STRING, description='uuid', nullable=True),
            'displayName': openapi.Schema(type=openapi.TYPE_STRING, description='display name'),
            'url': openapi.Schema(type=openapi.TYPE_STRING, description='uuid', nullable=True),
            'github': openapi.Schema(type=openapi.TYPE_STRING, description='github url', nullable=True),
            'profileImage': openapi.Schema(type=openapi.TYPE_STRING, description='profile image url', nullable=True),
        },
        required=['displayName']
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
@api_view(['GET','POST'])
def AuthorListAPI(request):
    if request.method == 'GET':
        paginator = PageNumberPagination()
        authors = Author.objects.filter(host=BASE_URL).order_by('key') # Need to be ordered to be paginated...
        result_page = paginator.paginate_queryset(authors, request)


        if result_page:
            serializer = AuthorSerializer(result_page, many=True) 
            
            return JsonResponse({"type": "authors", "items" : serializer.data})
            #uncomment when we need to redo pages
            # return paginator.get_paginated_response(serializer.data)
            
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
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve posts.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Create a post.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'content': openapi.Schema(type=openapi.TYPE_STRING, description='content'),
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='title'),
            'unlisted': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='unlisted'),
        }, 
        required = ['content', 'title', 'unlisted']
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
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
                post['author'] = AuthorKeyToJson(post['author'])


            return JsonResponse({"type":"posts", "items":serializer.data})


        elif request.method == 'POST':
            print(request.data)
            # Handle POST requests to create a new post associated with the author
            request.data['author'] = author.key  # Set the author for the new post
            
            serializer = PostSerializer(data=request.data)
            if serializer.is_valid():
                post = serializer._validated_data
                post = serializer.save()
                post = serializer.data
                print(post)
                post['author'] = AuthorKeyToJson(author.key)
                print(post)
                return JsonResponse(post)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    except Author.DoesNotExist as e:
        
        print(e)
        return Response(status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve a post.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Update a post.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'content': openapi.Schema(type=openapi.TYPE_STRING, description='content'),
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='title'),
            'unlisted': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='unlisted'),
        }, 
        required = []
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Delete a post.",
    responses={204: 'No Content', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['PUT'],
    operation_description="Update a post. (Not implemented because we have partial 'POSTs')",
    responses={200: 'OK', 400: 'Bad Request'}
)
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
                serializer.data['author'] = AuthorKeyToJson(serializer.data['author'])
                obj = {}
                for key in serializer.data:
                    
                    obj[key] = serializer.data[key]
                    if key == 'author':
                        obj['author'] = AuthorKeyToJson(obj['author'])
                return JsonResponse(obj)


            elif request.method == 'POST':
                # Handle POST requests to update a specific post
                serializer = PostSerializer(post, data=request.data, partial=True)
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

@api_view(['GET'])
def PostImage(request, author_key, post_key):
    try:
        author = Author.objects.get(key=author_key)  # Retrieve the author by author_key
        try:
            post = Post.objects.get(key=post_key, author=author)  # Retrieve the post by post_key and author
            try:
                if post.contentType.startswith('image/'):
                    return Response(post.content)
                else:
                    return Response("Post is not an image", status=status.HTTP_404_NOT_FOUND)
            except:
                return Response("Post object error",status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Post.DoesNotExist:
            return Response("Post does not exist",status=status.HTTP_404_NOT_FOUND)
    
    except Author.DoesNotExist:
        return Response("Author does not exist",status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve comments.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Create a comment.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'comment': openapi.Schema(type=openapi.TYPE_STRING, description='content'),
            'author': openapi.Schema(type=openapi.TYPE_STRING, description='author pk'),
        }, 
        required = ['comment', 'author']
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
@api_view(['GET', 'POST'])
def CommentList(request, author_key, post_key):
    try:
        # author = Author.objects.get(key=author_key)  # Retrieve the author by author_key
        try:
            post = Post.objects.get(key=post_key)
            try:
                if request.method == 'GET':
                    comments = Comment.objects.filter(post=post)
                    
                    serializer = CommentSerializer(comments, many=True)
                    # Sanitize HTML content in the list view
                    for comment in serializer.data:
                        comment['comment'] = bleach.clean(comment['comment'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)
                        comment['author'] = AuthorKeyToJson(comment['author'])
                    return JsonResponse({"items":serializer.data, "comments": serializer.data, "type":"comments"})
                if request.method == 'POST':
                    # TODO: Uncomment code below whenever ready or remove it - kept it uncommented from the merge conflict between main and this pull request 
                    # Handle POST requests to create a new post associated with the author
                    author = Author.objects.get(id = request.data['author']['id'])
                    request.data['author'] = author.key  # Set the author for the new post # Require author in post
        
                    request.data['post'] = post.key
                    data = request.data.copy()
   
                    serializer = CommentSerializer(data=request.data)
                    if serializer.is_valid():
                        
                        comment = serializer.save()
                        comment = serializer.data
                        comment['comment'] = bleach.clean(comment['comment'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)
                        comment['author'] = AuthorKeyToJson(comment['author'])
                        return JsonResponse(comment)
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Comment.DoesNotExist:
                return Response("There are no comments", status=status.HTTP_404_NOT_FOUND)
        except Post.DoesNotExist:
            return Response("Post does not exist",status=status.HTTP_404_NOT_FOUND)      
    except Author.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@permission_classes([CustomPermission])
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve a comment.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Delete a comment.",
    responses={204: 'No Content', 404: 'Not Found'}
)  
@api_view(['GET', 'DELETE'])
def CommentDetail(request, post_key, author_key, comment_key):
    try:
        author = Author.objects.get(pk=author_key)
        try:
            post = Post.objects.get(key=post_key)
            try:
                comment = Comment.objects.get(key=comment_key)
                
                if request.method == 'GET':
                    obj = {}
                    serializer = CommentSerializer(comment)
                    # Sanitize HTML content in the comment
                    comment.comment = bleach.clean(comment.comment, tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)
                    
                    for key in serializer.data:
                        obj[key] = serializer.data[key]
                        if key == 'author':
                            obj['author'] = AuthorKeyToJson(obj['author'])
                    return JsonResponse(obj)
                
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
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve likes on comment/post.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Create a like on a comment/post.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'author': openapi.Schema(type=openapi.TYPE_STRING, description='author pk'), # TODO: 500 Internal Server Error! AttributeError at /authors/c4eb81f0-4f4f-46e4-be92-a9d6265e6161/posts/7d180470-190f-40f8-a918-2eb3527907ab/comments/56cb8209-3204-448b-abca-a3bac4cef992/likes/ Exception Value: 'NoneType' object has no attribute 'key' 
        }, 
        required = ['author']
    ),
    responses={201: 'Created', 400: 'Bad Request'}
)
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
            items = []
            for item in serializer.data:
                item['author'] = AuthorKeyToJson(item['author'])
                items.append(item)

            return JsonResponse({"type" : "likes", "items" : items})
    
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
@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve likes from an author.",
    responses={200: 'OK', 404: 'Not Found'}
)
@api_view(['GET'])
def LikesForLiked(request, author_key):
    likes = Like.objects.filter(author=author_key)
    serializer = LikeSerializer(likes, many=True)
    items = []
    for item in serializer.data:
        item['author'] = AuthorKeyToJson(item['author'])
        items.append(item)
    return JsonResponse({"type":"liked", "items": items})

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve author from user.",
    responses={200: 'OK', 404: 'Not Found'}
)
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

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve followers of an author.",
    responses={200: 'OK', 404: 'Not Found'}
)
@api_view(['GET'])
def FollowerList(request, author_key):
    if request.method == 'GET':
        author = Author.objects.get(pk=author_key)
        follower = Follower.objects.filter(object=author)
        serializer = FollowerSerializer(follower, many=True)
        return  Response(serializer.data)
    

def AuthorKeyToJson(key):
    author = Author.objects.get(pk = key)
    serializer = AuthorSerializer(author)
    return serializer.data

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve followers of an author.",
    responses={200: 'OK', 404: 'Not Found'}
)
@api_view(['GET'])
def FollowerListAPI(request, author_key):
    if request.method == 'GET':
        author = Author.objects.get(pk=author_key)
        follower = Follower.objects.filter(object=author)
        serializer = FollowerSerializer(follower, many=True)
        followers = []
        for item in serializer.data:
            followers.append(AuthorKeyToJson(item['actor']))
        return  JsonResponse({"type": "followers", "items" : followers})
    
@api_view(['GET'])
def FriendsList(request, author_key):
    author = Author.objects.get(pk=author_key)
    followers = Follower.objects.filter(object=author)
    following = Follower.objects.filter(actor=author)
    erserializer = FollowerSerializer(followers, many=True)
    ingserializer = FollowerSerializer(following, many=True)
    # Find the intersection of the two sets to get the friends
    friends = []
    # n^2 i know
    for follower in erserializer.data:
        for following in ingserializer.data:
            if following['object'] == follower['actor']:
                json = AuthorKeyToJson(following['object'])
                if friends.count(json) == 0:
                    friends.append(json)
    return JsonResponse({"items": friends, "type":"friends"})

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve an author-follower relationship.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['PUT'],
    operation_description="Update an author-follower relationship.",
    responses={201: 'Created', 400: 'Bad Request'}
)    
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Delete an author-follower relationship.",
    responses={204: 'No Content', 404: 'Not Found'}
)
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

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve an author-follower relationship.",
    responses={200: 'OK', 404: 'Not Found'}
)
@swagger_auto_schema(
    methods=['PUT'],
    operation_description="Update an author-follower relationship.",
    responses={201: 'Created', 400: 'Bad Request'}
)    
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Delete an author-follower relationship.",
    responses={204: 'No Content'}
)
@api_view(['GET', 'PUT', 'DELETE'])        
def FollowerDetailAPI(request, author_key, foreign_id):
    if request.method == 'PUT':
        try:
            author = Author.objects.get(pk=author_key)
            follower = Author.objects.get(id__endswith=f"/{foreign_id}") # We can assume author already exists because follow request shouldve saved it
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        print("got here")
        serializer = FollowerSerializer(data={"actor" : follower.key, "object" : author.key})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        author = Author.objects.get(pk=author_key)
        foreign = Author.objects.get(id__endswith=f"/{foreign_id}")
        try:
            follower = Follower.objects.get(object=author, actor=foreign)
            serializer = AuthorSerializer(foreign)
            return  Response(serializer.data)
        except Follower.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        author_id = Author.objects.get(pk=author_key)
        follower = Author.objects.get(id__endswith=f"/{foreign_id}")
        try:
            follower = Follower.objects.get(object=author_id, actor=follower)
            follower.delete()
        except Follower.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve an author.",
    responses={200: 'OK'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Update an author.",
    responses={201: 'Created', 400: 'Bad Request'}
)    
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Retrieve an author.",
    responses={200: 'OK'}
) 
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
        print(request.data)
        print("is post")
 
        try:
            author = Author.objects.get(pk = author_key)
            data = request.data.copy()
            data['author'] = author_key
            if data['type'] == 'post'  or  data['type'] == 'comment' or data['type'] == 'like':
                print("needs id")
                if not 'id' in data or len(data['id']) == 0:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
            elif data['type'] == 'follow':
                print("is follow")
                if not 'actor' in data:
                    print("o actor")
                    return Response(status=status.HTTP_400_BAD_REQUEST)
                followReq = {"actor" : data['actor'], "object": author.id, "summary": "follow request from someone"}
                serializer = FollowRequestSerializer(data=followReq)
                if serializer.is_valid():
                    serializer.save()
                    data['object'] = author.id
            else:
                print("no type")
                return Response(status=status.HTTP_400_BAD_REQUEST)
            serializer = InboxItemSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print("serializer err")
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


def postToJSON(post):
    serializer = PostSerializer(post)
    obj = {}
    for key in serializer.data:
        if not key == 'author': 
            obj[key] = serializer.data[key]
        else:
            obj['author'] = AuthorKeyToJson(serializer.data[key])
    return obj

@swagger_auto_schema(
    methods=['GET'],
    operation_description="Retrieve an author's inbox.",
    responses={200: 'OK'}
)
@swagger_auto_schema(
    methods=['POST'],
    operation_description="Add item to an author's inbox.", # TODO: 500 Internal Server Error! /social_media/views.py", line 728, in InboxViewAPI if data['type'] == 'post Exception Type: KeyError at /service/authors/c4eb81f0-4f4f-46e4-be92-a9d6265e6161/inbox/Exception Value: 'type'
    responses={201: 'Created', 400: 'Bad Request'}
)    
@swagger_auto_schema(
    methods=['DELETE'],
    operation_description="Delete item from an author's inbox.",
    responses={200: 'OK'}
) 
@api_view(['GET', 'POST', 'DELETE'])    
def InboxViewAPI(request, author_key):
    if request.method == 'GET':
        try:
            author = Author.objects.get(pk = author_key)
            items = InboxItem.objects.filter(author=author)
            serializer = InboxItemSerializer(items, many=True)
            #Make JSON so that inbox view works with spec
            data = []
            for item in serializer.data:
                if item['type'] == 'Follow':
                    followrequest = FollowRequest.objects.get(pk=item['follow_request'])
                    actorJson = AuthorKeyToJson(followrequest.actor.key)
                    objectJson = AuthorKeyToJson(followrequest.object.key)
                    data.append({"actor": actorJson, "object": objectJson, "type": "Follow"})
                if item['type'] == 'post':
                    itemPost = Post.objects.get(pk=item['post'])
                    obj = postToJSON(itemPost)
                    data.append(obj)
                if item['type'].upper() == "LIKE":
                    like = Like.objects.get(pk = item['like']) 
                    authorJson = AuthorKeyToJson(like.author.key)
                    serializer = LikeSerializer(like)
                    obj = {}
                    for key in serializer.data:
                        if not key == 'author': 
                            obj[key] = serializer.data[key]
                        else:
                            obj['author'] = authorJson
                    data.append(obj)

            return JsonResponse({"type": "inbox", "author": author.id, "items":  data})
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'POST':
        print("is post")
        print(request)

        data = request.data.copy()
        print(data)
        try:
  
            author = Author.objects.get(pk = author_key)
            
            
            if data['type'].upper() == 'POST':
                   
                    if not 'key'  in data: #only local should send key
                        print("no key")
                        #Author might not exist yet
                        try:
                            postAuthor = Author.objects.get(id=data['author']['id'])
                            data['author'] =  postAuthor.key
                        except Author.DoesNotExist:
                            postAuthorSerializer = DummyAuthor(data=data['author'])
                            if postAuthorSerializer.is_valid():
                                postAuthor = postAuthorSerializer.save()
                                data['author'] = postAuthor.key
                            else:
                                print("Could not make dummy author")
                                return Response(postAuthorSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
                        if not 'unlisted' in data:
                            data['unlisted'] = "False"
                        serializer = PostSerializer(data=data)
                        post = []
                        if serializer.is_valid():
                                print(serializer.validated_data)
                                post = serializer.save()
                                
                        else:
                            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        print("post is in here")
                        post = Post.objects.get(id=data['id'])
                        serializer = PostSerializer(post)
                        #serializer.is_valid()
                    inboxSerializer = InboxItemSerializer(data={"author" : author.key, "post" : post.key, "type" : "post" })
                    if inboxSerializer.is_valid():
                            inboxSerializer.save()
                            return Response(serializer.data, status=status.HTTP_201_CREATED)
                    else:
                        print(inboxSerializer.errors)
                        return Response(inboxSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
            elif data['type'].upper() == 'FOLLOW':
                object = Author.objects.get(pk = author_key)
                try:
                    actor = Author.objects.get(id = data['actor']['id'])
                except Author.DoesNotExist:
                    serializer = DummyAuthor(data=data['actor'])
                    if serializer.is_valid():
                        actor = serializer.save()
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                serializer = FollowRequestSerializer(data={"actor": actor.key, "object": object.key, "type": "Follow", "summary": f"{actor.displayName} wants to follow {object.displayName}"})
                if serializer.is_valid():
                    followReq = serializer.save()
                    serializer = InboxItemSerializer(data={"author": object.key, "follow_request": followReq.key, "type": "Follow"})
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            elif data['type'].upper() == "LIKE":
                try:
                    author = Author.objects.get(id = data['author']['id'])
                except Author.DoesNotExist:
                    serializer = DummyAuthor(data=data['author'])
                    if serializer.is_valid():
                        author = serializer.save()
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                data['author'] = author.key
                if "/comment" not in data['object']:
                    post = Post.objects.get(id=data['object'])
                    data['post'] = post.key
                else:
                    comment = Comment.objects.get(id=data['object'])
                    data['comment'] = comment.key
                serializer = LikeSerializer(data=data)
                if serializer.is_valid():
                    like = serializer.save()
                    serializer = InboxItemSerializer(data={"author": author.key, "like":like.key, "type":"Like"})
                    if serializer.is_valid():
                        comment = serializer.save()

                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)   
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)   

            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
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
        
# This view returns all the nodes we are connected to currently
@api_view(['GET'])  
def NodesList(request):
    nodes = Node.objects.filter(enabled=True)
    serializer = NodeSerializer(nodes, many=True)
    
    return Response(serializer.data)