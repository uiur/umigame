$(function () {
  var socket = null;

  // Utility
  var escapeHTML = function (val) {
    return $('<div/>').text(val).html();
  };

  // View
  var showMessage = function (message) {
    if (typeof message === 'string') {
      $('table#messages').append('<tr class="message">' + '<td></td>' + '<td>' + escapeHTML(message) + '</td></tr>');
    } else {
      $('table#messages').append('<tr class="message">' + '<td>' + escapeHTML(message.username) + '</td>' + '<td>' + escapeHTML(message.content) + '</td></tr>');
    }
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
    socket.emit('username', $('#username').val());
    socket.emit('status', 'wait');

    socket.on('newMessage', function (message) {
      showMessage(message);
      scrollWindow();
    });
    
    socket.on('status', function (message) {
      if (message === 'match') {
        showMessage('相手が見つかったよ！チャット開始！');
        enableButton();
      }
    });
  };

  // Event
  $('#main').hide();

  $('form#startChat').submit(function () {
    var username = $('input#username').val();
    if (username === undefined || username === '') {
      alert('名前を入力しろや！');
    } else {
      $('#top').hide();
      $('#main').show();
      socketStart();
    }
    return false;
  });

  $('form#newMessage').submit(function(){
    var textBox = $('input#newText')
    var text = textBox.val();
    if (text !== '') { 
      textBox.val('');

      socket.emit('newMessage', text);
    }
    return false;

  });

});
