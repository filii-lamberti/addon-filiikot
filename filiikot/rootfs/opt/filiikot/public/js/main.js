/* eslint-disable prefer-arrow-callback */
const socket = io({
  autoConnect: false,
});

document.addEventListener('DOMContentLoaded', function () {
  socket.open();
});

socket.on('connect', function () {
  console.log(socket.connected); // true
  document.body.className = document.body.className.replace(/\bis-preload\b/, '');
});

socket.on('message', console.log('lol'));

socket.on('update', function (data) {
  // eslint-disable-next-line prefer-template
  $('#image').attr('src', 'img/' + data.state + '.png');
  // document.getElementById('image').attr('src', 'img/' + data.state + '.png');
  $('#statusMessage').html(data.statusMessage);
  // document.getElementById('statusMessage').html(data.statusMessage);
  $('#temperature').html(data.temperature);
  // document.getElementById('temperature').html(data.temperature);
  $('#humidity').html(data.humidity);
  // document.getElementById('humidity').html(data.humidity);

  switch (data.people) {
    case '0':
      $('#people').html('Er zijn momenteel geen mensen verbonden met WiFilii.');
      break;

    case '1':
      $('#people').html('Er is momenteel minstens één persoon verbonden met WiFilii.');
      break;

    default:
      $('#people').html(`Er zijn momenteel minstens ${data.people} mensen verbonden met WiFilii.`);
      break;
  }

  /*
  $.each(data, function(key, val) {
    $(`#${key}`)
      .html(val);
  });

  $('#openclosed').html(msg.openclosed);
  $('title').html(`Het filiikot is ${msg.openclosed}`);
  $('#openclosedimg').attr('src', `${msg.openclosed}.png`);
  $('#openclosed2').html(msg.openclosed[0].toUpperCase() + msg.openclosed.substring(1));
  if (msg.temperature == 'onbekend') {
    $('#tempC').html(msg.temperature);
    $('#tempK').html(msg.temperature);
  } else {
    $('#tempC').html(`${msg.temperature} °C`);
    $('#tempK').html(`${parseFloat(msg.temperature) + 273.15} K`);
  }
  $('#since').html(msg.since);
  $('#lastupdate').html(msg.lastUpdate);
  */
});
