from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.pagination import PageNumberPagination
from .models import Post, Author, Comment
from .serializers import PostSerializer, AuthorSerializer, CommentSerializer
import bleach


@api_view(['GET','POST'])
def AuthorList(request):
    if request.method == 'GET':
        # use default paginator set in settings
        paginator = PageNumberPagination()
        authors = Author.objects.all().order_by('id') # 
        result_page = paginator.paginate_queryset(authors, request)

        if result_page:
            serializer = AuthorSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        # If somehow pagination doesn't occur, return the whole list anyways
        serializer = AuthorSerializer(authors, many=True) 
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AuthorSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET','POST','DELETE'])
def AuthorDetail(request, author_id):
    try:
        author = Author.objects.get(pk=author_id)
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
    
@api_view(['GET', 'POST'])
def PostList(request, author_id):
    try:
        author = Author.objects.get(id=author_id)  # Retrieve the author by author_id

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
            request.data['author'] = author.id  # Set the author for the new post
            serializer = PostSerializer(data=request.data)
            if serializer.is_valid():
                print(serializer._validated_data)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Author.DoesNotExist as e:
        
        print(e)
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def PostDetail(request, author_id, post_id):
    try:
        author = Author.objects.get(id=author_id)  # Retrieve the author by author_id

        try:
            post = Post.objects.get(id=post_id, author=author)  # Retrieve the post by post_id and author

            if request.method == 'GET':
                # Handle GET requests to retrieve a specific post
                serializer = PostSerializer(post)

                # Sanitize HTML content in the detail view
                serializer.data['content'] = bleach.clean(serializer.data['content'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)

                return Response(serializer.data)

            elif request.method == 'POST':
                # Handle POST requests to update a specific post
                serializer = PostSerializer(post, data=request.data)
                request.data['author'] = author.id 
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

@api_view(['GET', 'POST'])
def CommentList(request, author_id, post_id):
    try:
        author = Author.objects.get(id=author_id)  # Retrieve the author by author_id
        try:
            post = Post.objects.get(id=post_id)
            if request.method == 'GET':
                comments = Comment.objects.filter(author = author, post=post)
                serializer = CommentSerializer(comments, many=True)
                # Sanitize HTML content in the list view
                for comment in serializer.data:
                    comment['comment'] = bleach.clean(comment['comment'], tags=list(bleach.ALLOWED_TAGS) + ['p', 'br', 'strong', 'em'], attributes=bleach.ALLOWED_ATTRIBUTES)
                return Response(serializer.data)
            if request.method == 'POST':
                # Handle POST requests to create a new post associated with the author
                request.data['author'] = author.id  # Set the author for the new post
                request.data['post'] = post.id # NOTE this is incorrect, just a temp fix till we redo id's
                serializer = CommentSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)       
    except Author.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET', 'DELETE'])
def CommentDetail(request, post_id, author_id, comment_id):
    try:
        author = Author.objects.get(pk=author_id)
        try: 
            post = Post.objects.get(id=post_id)
            try:
                comment = Comment.objects.get(id=comment_id)
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


class CustomPostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def create(self, request, *args, **kwargs):
        # Handle custom behavior for creating a new post with a specific ID
        # Extract the desired ID from the request data
        post_id = request.data.get('id')

        if post_id:
            # Check if a post with the same ID already exists
            if self.queryset.filter(id=post_id).exists():
                return Response({'detail': 'A post with this ID already exists.'}, status=status.HTTP_400_BAD_REQUEST)

            # Create the post with the provided ID
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Override the update method for handling POST as an update operation
        # Ensure the user is authenticated for updates
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required for updates.'}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # You can handle the rest of the default methods as they are

    def destroy(self, request, *args, **kwargs):
        # Custom handling for DELETE requests
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 