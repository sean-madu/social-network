from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Author, Post
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

class PostTestCase(APITestCase):
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