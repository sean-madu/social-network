from uuid import uuid4
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Author, Post, Like, Comment
from .serializers import PostSerializer
# Create your tests here.
class AuthorTestCase(APITestCase):
    def setup(self):
        """id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    host = models.URLField(editable=False)
    displayName = models.CharField(max_length=32)
    url = models.URLField(editable=False)
    github = models.URLField(null=True)
    profileImage = models.URLField(null=True)
    """

    def test_author_post_works(self):
        """
        Ensure we can create new authors.
        """
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Author.objects.count(), 1)
        self.assertEqual(Author.objects.get().displayName, 'Test')
    
    def test_author_post_empty_fails(self):
        """
        Ensure we cannot create bad authors.
        """
        url = reverse('author-list')
        data = {}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_author_detail_404(self):
        """
        Ensure trying to view a non existant author grants a 404
        """
        url = reverse('author-list')
        response = self.client.get(url + "/does-not-exist")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_author_detail(self):
        """
        Ensure trying to view an author works
        """
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        response = self.client.get(response.json()['url'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_author_delete(self):
        """
        Ensure trying to delete an author works
        """
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(Author.objects.count(), 1)
        response = self.client.delete(response.json()['url'])
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Author.objects.count(), 0)

    def test_author_delete_no_exist(self):
        """
        Try to delete author that does not exist
        """
        url = reverse('author-list')
        response = self.client.delete(url+ "does-not-exist")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PostTestCase(APITestCase):

    def setUp(self):
        """
        Set up the environment for test cases
        """
        self.author1 = Author.objects.create(displayName="Author1")
        self.post1 = Post.objects.create(author=self.author1, title="Post1", content="Content1", unlisted=True)
        # Create test user
        self.username = 'testuser'
        self.password = 'testpassword'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        # Simulate a successful login to get the tokens
        response = self.client.post('/auth/login/', {'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        tokens = response.data  # Assuming the tokens are returned in the response data

        self.access_token = tokens.get('access')

    def tearDown(self):
        # Delete the user created in setup
        self.user.delete()

    def test_post_post_works(self):
        """
        Ensure we can create new posts.
        """
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        url = response.json()['url'] + "posts/"
        data = {"title" : "post 1", "content": "content", "unlisted": True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
 

    def test_post_post_empty_fails(self):
        """
        Ensure we can create new posts.
        """
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        url = response.json()['url'] + "posts/"
        data = {}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_all_posts(self):
        """ We can get all posts from an author"""
        response = self.client.get(reverse('post-list', kwargs={'author_key': self.author1.key}))
        posts = Post.objects.filter(author=self.author1)
        serializer = PostSerializer(posts, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_invalid_author(self):
        """
        Handling invalid author key
        """
        response = self.client.get(reverse('post-list', kwargs={'author_key': self.author1.key}) + "sdf")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_invalid(self):
        """
        Test posting invalid data to create post for author
        """
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        url = response.json()['url'] + "posts/"
        data = {"title" : "", "content": "content", "unlisted": True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
 
class LocalAuthTestsCase(TestCase):
    def setUp(self):
        """
        Set up a testuser to test auth
        """
        self.username = 'testuser'
        self.password = 'testpassword'
        self.user = User.objects.create_user(username=self.username, password=self.password)

    def tearDown(self):
        # Delete the user created in setup
        self.user.delete()

    def test_successful_login(self):
        """
        Expect that logging into an account works
        """
        response = self.client.post('/auth/login/', {'username': self.username, 'password': self.password}, follow=True)
        self.assertEqual(response.status_code, 200)
        # Assert that the user is authenticated or a success message is returned

    def test_failed_login_invalid_credentials(self):
        """
        Expect that wrong credentials will fail login
        """
        response = self.client.post('/auth/login/', {'username': 'nonexistent_user', 'password': 'invalid_password'})
        self.assertEqual(response.status_code, 401)
        # Assert an error message or an indication of authentication failure is returned

    def test_successful_token_verification(self):
        """
        Expect that we can recieve and verify the token returned by logging in.
        """
        # Simulate a successful login to get the tokens
        response = self.client.post('/auth/login/', {'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        tokens = response.data
        
        access_token = tokens.get('access')

        # Verify the token using POST request to the /token-verify/ endpoint
        verify_response = self.client.post('/auth/token-verify/', {'token': access_token})
        self.assertEqual(verify_response.status_code, 200)
        # Assert to ensure a successful token verification

    def test_failed_token_verification(self):
        """
        Expect that an invalid token will not be validated by the token-verify endpoint
        """
        # Since we are using a bad token anyways no need to login
        # Simulate an expired or invalid token
        invalid_token = "InvalidTokenString"  # Replace with an invalid or expired token

        # Verify the token using POST request to the /token-verify/ endpoint
        verify_response = self.client.post('/auth/token-verify/', {'token': invalid_token})
        self.assertEqual(verify_response.status_code, 401)
    
    def test_access_with_valid_token(self):
        """
        Expect that with a valid token the client can access the site contents
        """
        # Simulate a successful login to get the tokens
        response = self.client.post('/auth/login/', {'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        tokens = response.data

        access_token = tokens.get('access')
        # Access the /author/ endpoint with a valid token in the Authorization header
        author_response = self.client.get('/authors/', HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(author_response.status_code, 200)
        

    def test_access_without_token(self):
        """
        Expect that providing the wrong token, or not providing a token will not allow the client to see content
        """
        # Access the /author/ endpoint without providing the Authorization header
        author_response = self.client.get('/authors/')
        self.assertEqual(author_response.status_code, 401)  # or the appropriate status code for authentication failure
        # Add assertions to confirm unsuccessful content access due to lack of authentication

class LikesForLikesTestCase(APITestCase):
    def setUp(self):
        self.author = Author.objects.create(displayName="Test Author")
        self.post = Post.objects.create(author=self.author, title="Test Post", content="Test Content", unlisted=False)
        # Create test user
        self.username = 'testuser'
        self.password = 'testpassword'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        # Simulate a successful login to get the tokens
        response = self.client.post('/auth/login/', {'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        tokens = response.data

        self.access_token = tokens.get('access')

    def tearDown(self):
        # Delete the user created in setup
        self.user.delete()

    def test_get_likes_on_post(self):
        """
        Ensure we can retrieve likes on a specific post.
        """
        # Create likes for the post
        Like.objects.create(author=self.author, post=self.post)
        Like.objects.create(author=self.author, post=self.post)

        url = reverse('likes-list', kwargs={'author_key': self.author.key, 'post_key': self.post.key})
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Check if two likes were retrieved

    def test_get_likes_on_comment(self):
        """
        Ensure we can retrieve likes on a specific comment of a post.
        """
        comment = Comment.objects.create(author=self.author, post=self.post, comment="testcomment")

        # Create likes for the comment
        Like.objects.create(author=self.author, post=self.post, comment=comment)
        Like.objects.create(author=self.author, post=self.post, comment=comment)

        url = reverse('likes-list', kwargs={'author_key': self.author.key, 'post_key': self.post.key, 'comment_key': comment.key})
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Check if two likes were retrieved

    def test_get_likes_invalid_token(self):
        url = reverse('likes-list', kwargs={'author_key': self.author.key, 'post_key': self.post.key})
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer InvalidToken123')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_likes_invalid_post(self):
        invalid_post_key = str(uuid4())
        url = reverse('likes-list', kwargs={'author_key': self.author.key, 'post_key': invalid_post_key})
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_likes_invalid_comment(self):
        invalid_comment_key = str(uuid4())
        url = reverse('likes-list', kwargs={'author_key': self.author.key, 'post_key': self.post.key, 'comment_key': invalid_comment_key})
        response = self.client.get(url, HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_likes_no_auth(self):
        url = reverse('likes-list', kwargs={'author_key': self.author.key, 'post_key': self.post.key})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
