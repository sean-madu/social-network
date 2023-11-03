from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Author, Post
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
        self.author1 = Author.objects.create(displayName="Author1")
        self.post1 = Post.objects.create(author=self.author1, title="Post1", content="Content1", unlisted=True)

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
        response = self.client.get(reverse('post-list', kwargs={'author_id': self.author1.id}))
        posts = Post.objects.filter(author=self.author1)
        serializer = PostSerializer(posts, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_invalid_author(self):
        response = self.client.get(reverse('post-list', kwargs={'author_id': self.author1.id}) + "sdf")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_invalid(self):
        url = reverse('author-list')
        data = {'displayName': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        url = response.json()['url'] + "posts/"
        data = {"title" : "", "content": "content", "unlisted": True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
 
