# Instagram Basic Javascript SDK
Some Javascript to connect to Instragram (implicit) and access user photos using permissions.

# Example
I've used it in my code to get all the images uploaded by a user

'''
$(document).ready(function () {
    // Init Instagram
    Instagram.init({
        clientId: '3abd0394e5404ef99f613021df0c6c6d',
        redirectURI: 'http://cssplayground.dev/',
    });

    // login
    $(document).on('click', '#insta-login', function(e){
        $(this).text('Logging in...');

        Instagram.getAllPhotos(function(photos){
            var html = '';
            for (var i = 0; i < photos.length; i++) {
                try {
                    var url = photos[i]['images']['standard_resolution']['url'];
                    html += '<a href="#" class="fb-image" data-url="' + url + '" style="display: block; float: left; width: 100px; height: 100px; background: center no-repeat; background-size: cover; background-image: url(' + url + ')"></a>';
                } catch (e) { }
            }
            
            $('#images').html(html);
        });

        e.preventDefault();
    });
});
'''

'''
<!DOCTYPE html>
<html>
<head>
    <title>Instragram Example</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
</head>
<body>

<a href="#" id="insta-login">Login</a>
<div id="images"></div>

<script src="script.js"></script>
</body>
</html> 
'''
