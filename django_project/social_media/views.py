from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.pagination import PageNumberPagination

from .models import Post, Author, Comment, Like, User, Follower, FollowRequest, Node, InboxItem
from .serializers import PostSerializer, AuthorSerializer, CommentSerializer, LikeSerializer, FollowRequestSerializer, FollowerSerializer, InboxItemSerializer, DummyAuthor

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
@api_view(['GET','POST'])
def AuthorListAPI(request):
    if request.method == 'GET':
        paginator = PageNumberPagination()
        authors = Author.objects.all().order_by('key') # Need to be ordered to be paginated...
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
        author = Author.objects.get(pk=author_key)
        follower = Follower.objects.filter(object=author)
        serializer = FollowerSerializer(follower, many=True)
        return  Response(serializer.data)

def AuthorKeyToJson(key):
    author = Author.objects.get(pk = key)
    serializer = AuthorSerializer(author)
    return serializer.data

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

@api_view(['GET', 'PUT', 'DELETE'])        
def FollowerDetailAPI(request, author_key, foreign_id):
    if request.method == 'PUT':
        try:
            author = Author.objects.get(pk=author_key)
            follower = Author.objects.get(pk=foreign_id) # We can assume author already exists because follow request shouldve saved it
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
        foreign = Author.objects.get(pk=foreign_id)
        try:
            follower = Follower.objects.get(object=author, actor=foreign)
            serializer = AuthorSerializer(foreign)
            return  Response(serializer.data)
        except Follower.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        author_id = Author.objects.get(pk=author_key)
        follower = Author.objects.get(pk=foreign_id)
        try:
            follower = Follower.objects.get(object=author_id, actor=foreign_id)
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
        

@api_view(['GET', 'POST', 'DELETE'])    
def InboxViewAPI(request, author_key):
    if request.method == 'GET':
        try:
            author = Author.objects.get(pk = author_key)
            items = InboxItem.objects.filter(author=author)
            serializer = InboxItemSerializer(items, many=True)
            return JsonResponse({"type": "inbox", "author": author.id, "items": serializer.data})
        except Author.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'POST':
        try:
            author = Author.objects.get(pk = author_key)
            data = request.data.copy()
            if data['type'] == 'post':
                    if not 'id'  in data:
                        print("no id")
                        
                        serializer = PostSerializer(data=data)
                        post = []
                        if serializer.is_valid():
                                print(serializer.validated_data)
                                post = serializer.save()
                        else:
                            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        post = Post.objects.get(id=data['id'])
                        serializer = PostSerializer(post)
                        #serializer.is_valid()
                    inboxSerializer = InboxItemSerializer(data={"author" : author.key, "post" : post.key, "type" : "post" })
                    if inboxSerializer.is_valid():
                            inboxSerializer.save()
                            return Response(serializer.data, status=status.HTTP_201_CREATED)
                    else:
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