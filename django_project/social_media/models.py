from django.db import models
from uuid import uuid4
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.exceptions import ValidationError


class Author(models.Model):
    # UNCOMMENT THIS WHEN FRONT END IS READY TO IMPLEMENT
    # user = models.OneToOneField(User, on_delete=models.CASCADE)
    key = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    id = models.URLField(editable=False)
    host = models.URLField(editable=False)
    displayName = models.CharField(max_length=32)
    url = models.URLField(editable=False)
    github = models.URLField(null=True)
    profileImage = models.URLField(null=True)


    # overide save for specific fields which should be saved
    def save(self, *args, **kwargs):
        if not self.url:
            self.url = self.host + reverse('author-detail', kwargs={'author_key': self.key})
        if not self.id:
            self.id = self.host + reverse('author-detail', kwargs={'author_key': self.key})
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


    key = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    id = models.URLField(editable=False)
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
        author_key= self.author.key
        url = current_host + reverse('post-detail', kwargs={'author_key': str(author_key), 'post_key': str(self.key)})
        return url


    # overide save for specific fields which should be saved
    def save(self, *args, **kwargs):
        if not self.origin:
            self.origin = self.generate_origin_url()
        if not self.source:
            self.source = self.generate_origin_url()
        if not self.comments:
            self.comments = self.generate_origin_url() + "comments"
        if not self.id:
            self.id = self.generate_origin_url()
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
    
    author = models.ForeignKey(Author, on_delete=models.CASCADE) #Author that made the comment NOT author that made the post 
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    comment = models.TextField(max_length=255)
    published = models.DateTimeField(auto_now_add=True, editable=False)
    key = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    id = models.URLField(editable=False)


    def generate_origin_url(self):
        current_host = self.author.host
        author_key= self.post.author.key
        post_key = self.post.key
        url = current_host + reverse('comment-detail', kwargs={'author_key': str(author_key), 'post_key': str(post_key), "comment_key": str(self.key)})
        return url


    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.generate_origin_url()
        super().save(*args, **kwargs)
        

class Like(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, blank=True, null=True)
    key = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    id = models.URLField(editable=False)
    object = models.URLField(editable=False)

    def clean(self):
        if not self.post and not self.comment:
            raise ValidationError("A like must be associated with either a post or a comment.")
        super().clean()
    
    def generate_origin_url(self):
        current_host = self.author.host
        author_key = self.author.key
        url = current_host

        if self.comment:  # If associated with a comment
            url += reverse('comment-detail', kwargs={'author_key': author_key, 'post_key': str(self.post.key),'comment_key': str(self.comment.key)})
        else:  # If associated with a post
            url += reverse('post-detail', kwargs={'author_key': author_key, 'post_key': str(self.post.key)})
    
        return url

    def save(self, *args, **kwargs):
        self.full_clean()  # Perform full validation before saving
        if not self.object:
            self.object = self.generate_origin_url()
        if not self.id:
            self.id = self.generate_origin_url()


        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.author.displayName} liked {self.object}"
