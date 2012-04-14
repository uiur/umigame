$(function () {
  var socket = null;

  var showMessage = function (message) {
    $('table#messages').append('<tr class="message"><td>' + message + '</td></tr>');
    return false;
  };
  
  var scrollWindow = function () {
    height = $('#messages_container')[0].scrollHeight;
    $('#messages_container').animate({scrollTop: height}, {duration: 'slow', easing: 'swing', queue: false});
  };

  var enableButton = function () {
    $('input#sendButton').removeClass('disabled');
  };

  // WebSocket
  var socketStart = function () {
    socket = io.connect(location.href);
    socket.emit('status', 'wait');

    socket.on('newMessage', function (message) {
      showMessage(message);
      scrollWindow();
    });
    
    socket.on('status', function (message) {
      if (message === 'match') {
        showMessage('Match!');
        enableButton();
      }
    });
  };

  // Event
  $('#main').hide();

  $('button#startChat').click(function () {
    $('#top').hide();
    $('#main').show();
    socketStart();
  });

  $('form#newMessage').submit(function(){
    var textBox = $('input#newText')
    var text = textBox.val();
    textBox.val('');

    socket.emit('newMessage', text);
    return false;
  });

});
