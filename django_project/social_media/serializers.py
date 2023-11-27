from rest_framework import serializers

from .models import Post, Author, Comment, Like, Node, FollowRequest, Follower, InboxItem

from django.core.exceptions import ValidationError

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = 'post'
        return data
    
    def validate_content_type(self, value):
        allowed_content_types = ["text/markdown", "text/plain", "application/base64", "image/png;base64", "image/jpeg;base64"]
        if value not in allowed_content_types:
            raise ValidationError("Invalid content_type")
        return value
    
    def validate_visibility(self, value):
        allowed_visibilities = ["PUBLIC", "FRIENDS"]
        if value not in allowed_visibilities:
            raise ValidationError("Invalid visibility")
        return value

class DummyAuthor(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

        
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = 'author'
        return data
    
    def create(self, validated_data):
            domain = self.context['request'].get_host()
            if not 'host' in validated_data:
                validated_data['host'] = f"http://{domain}"
            return super().create(validated_data)
    

    
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = 'comment'
        return data
    
    def validate_content_type(self, value):
        allowed_content_types = ["text/markdown", "text/plain"]
        if value not in allowed_content_types:
            raise ValidationError("Invalid content_type")
        return value
    
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = 'like'
        data['@context'] = "https://www.w3.org/ns/activitystreams"
        
        # Accessing author's displayName field
        if instance.author:
            if instance.comment:
                data['summary'] = f"{instance.author.displayName} liked your comment"
            else:
                data['summary'] = f"{instance.author.displayName} liked your post"
        else:
            # Handle cases where author is not present (if needed)
            data['summary'] = "Someone liked your post"  # Placeholder text

        return data
    

class FollowRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowRequest
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = 'follow'
        return data


class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = '__all__'



class Node(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = '__all__'

class InboxItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboxItem
        fields = '__all__'