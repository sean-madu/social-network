from rest_framework.permissions import BasePermission
from .models import Node
    
class CustomPermission(BasePermission):
    def has_permission(self, request, view):
        # Function to check if the user is remote
        def isRemote():
            # Add your logic to identify remote users
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR') # Handle proxy servers (not required but will keep in)

            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]

            else:
                ip = request.META.get('REMOTE_ADDR') 

            remote_node = Node.objects.filter(remote_ip=ip) 

            if remote_node:
                return True
            return False

        if isRemote():
            if request.method == 'GET':
                return True
            # elif request.method == 'PUT':
            #     # Check if the request is for a specific view (e.g., AuthorList)
            #     # Modify this logic to suit your application
            #     if isinstance(view, AuthorListView):
            #         return True
            #     else:
            #         return False  # Deny PUT for other views
            else:
                return False  # Deny other request methods for remote users
        else:
            return True  # Allow all methods for local users
 
  