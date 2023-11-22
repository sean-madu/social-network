from django.db import models
from uuid import uuid4
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.exceptions import ValidationError

class Author(models.Model):
    # UNCOMMENT THIS WHEN FRONT END IS READY TO IMPLEMENT
    # user = models.OneToOneField(User, on_delete=models.CASCADE) 
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    host = models.URLField(editable=False)
    displayName = models.CharField(max_length=32)
    url = models.URLField(editable=False)
    github = models.URLField(null=True)
    profileImage = models.URLField(null=True)

    # overide save for specific fields which should be saved
    def save(self, *args, **kwargs):
        if not self.url:
            self.url = self.host + reverse('author-detail', kwargs={'author_id': self.id})
        super().save(*args, **kwargs)

    # Change if required...
    def __str__(self):
        return self.displayName


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
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
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
        if not self.origin:
            self.origin = self.generate_origin_url()
        if not self.source:
            self.source = self.generate_origin_url()
        if not self.comments:
            self.comments = self.generate_origin_url() + "comments"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Comment(models.Model):
    # enforce handle content types
    content_types = (
        ('text/markdown', 'Markdown'),
        ('text/plain', 'Plain Text'),
        ('application/base64', 'Base64-encoded'),
        ('image/png;base64', 'Embedded PNG'),
        ('image/jpeg;base64', 'Embedded JPEG'),
    )
    contentType = models.CharField(max_length=255, choices=content_types, default='text/plain')
    
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE) 
    comment = models.TextField(max_length=255)
    published = models.DateTimeField(auto_now_add=True, editable=False)
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

class Like(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, blank=True, null=True)
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    object = models.URLField(editable=False)

    def clean(self):
        if not self.post and not self.comment:
            raise ValidationError("A like must be associated with either a post or a comment.")
        super().clean()
    
    def generate_origin_url(self):
        current_host = self.author.host
        author_id = self.author.id
        url = current_host

        if self.comment:  # If associated with a comment
            url += reverse('comment-detail', kwargs={'author_id': author_id, 'post_id': str(self.post.id),'comment_id': str(self.comment.id)})
        else:  # If associated with a post
            url += reverse('post-detail', kwargs={'author_id': author_id, 'post_id': str(self.post.id)})
    
        return url

    def save(self, *args, **kwargs):
        self.full_clean()  # Perform full validation before saving
        if not self.object:
            self.object = self.generate_origin_url()


        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.author.displayName} liked {self.object}"