from django.db import models
from uuid import uuid4, UUID

from django.urls import reverse

class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    host = models.URLField()
    displayName = models.CharField(max_length=32)
    url = models.URLField()
    github = models.URLField()
    profileImage = models.URLField()

class Comment(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.TextField()
    contentType = models.CharField(max_length=255)
    published = models.DateTimeField()
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

class Post(models.Model):
    # enforce handle content types
    content_types = (
        ('text/markdown', 'Markdown'),
        ('text/plain', 'Plain Text'),
        ('application/base64', 'Base64-encoded'),
        ('image/png;base64', 'Embedded PNG'),
        ('image/jpeg;base64', 'Embedded JPEG'),
    )
    contentType = models.CharField(max_length=255, choices=content_types, default='text/plain')
    content = models.TextField()
    # enforce visbility choices
    VISIBILITY_CHOICES = [
        ("PUBLIC", "Public"),
        ("FRIENDS", "Friends"),
    ]
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default="PUBLIC")

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255)
    source = models.URLField(null=True)
    origin = models.URLField(editable=False)
    description = models.TextField(default="Why the fuck is this here", editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, editable=False)
    categories = models.JSONField(null=True)
    count = models.IntegerField(default=0)
    comments = models.URLField(editable=False)
    published = models.DateTimeField(auto_now_add=True, editable=False)
    unlisted = models.BooleanField()
    commentsSrc = models.JSONField(null=True)

    def generate_origin_url(self):
        current_host = self.author.host
        author_id = self.author.id
        url = current_host + reverse('post-detail', kwargs={'author_id': author_id, 'post_id': str(self.id)})
        return url

    # overide save for specific fields which should be saved
    def save(self, *args, **kwargs):

        self.author = Author.objects.get(id="f3c4b7c9-08d6-4963-ba57-1d27a1998d46")
        if not self.origin:
            self.origin = self.generate_origin_url()
        if not self.source:
            self.source = self.generate_origin_url()
        if not self.comments:
            self.comments = self.generate_origin_url() + "comments"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title