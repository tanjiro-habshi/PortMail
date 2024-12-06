$(document).ready(function() {
  var mailboxTextbox = $('#mailbox-textbox');
  var generateButton = $('#generate-button');
  var refreshButton = $('#refresh-button');
  var emailsContainer = $('#emails-container');
  var noMessagesLabel = $('#no-messages-label');
  var emailContentContainer = $('#email-content-container');
  var backButton = $('#back-button');

  
  generateMailbox();

  
  generateButton.click(function() {
    generateMailbox();
  });

  
  refreshButton.click(function() {
    fetchEmails();
  });

  
  setInterval(fetchEmails, 10000);

  
  function fetchEmails() {
    var mailbox = mailboxTextbox.val();
    if (mailbox) {
      var parts = mailbox.split('@');
      var name = parts[0];
      var domain = parts[1];
      var url = 'https://www.1secmail.com/api/v1/?action=getMessages&login=' + name + '&domain=' + domain;
      $.get(url, function(data) {
        emailsContainer.empty();
        if (data.length > 0) {
          noMessagesLabel.hide();
          $.each(data, function(index, email) {
            var row = $('<div>').addClass('email-row').appendTo(emailsContainer);
              $('<div>').addClass('email-header').append($('<span>').addClass('subject-label').text('Subject: ')).append(email.subject).appendTo(row);
            row.click(function() {
              fetchEmailContent(email.id);
            });
          });
        } else {
          noMessagesLabel.show();
        }
      });
    }
  }

  
  function fetchEmailContent(id) {
    var mailbox = mailboxTextbox.val();
    if (mailbox) {
      var parts = mailbox.split('@');
      var name = parts[0];
      var domain = parts[1];
      var url = 'https://www.1secmail.com/api/v1/?action=readMessage&login=' + name + '&domain=' + domain + '&id=' + id;
      $.get(url, function(data) {
        emailsContainer.hide();
        backButton.show();
        emailContentContainer.empty();
        $('<div>').addClass('email-header').html('<span class="header-label">ID:</span> <span class="header-value">' + data['id'] + '</span>').appendTo(emailContentContainer);
        $('<div>').addClass('email-header').html('<span class="header-label">From:</span> <span class="header-value">' + data['from'] + '</span>').appendTo(emailContentContainer);
        $('<div>').addClass('email-header').html('<span class="header-label">Subject:</span> <span class="header-value">' + data['subject'] + '</span>').appendTo(emailContentContainer);
        $('<div>').addClass('email-header').html('<span class="header-label">Time:</span> <span class="header-value">' + data['date'] + '</span>').appendTo(emailContentContainer);
        $('<div>').addClass('email-body').text(data['textBody']).appendTo(emailContentContainer);
        if (data.attachments) {
          var attachmentsDiv = $('<div>').addClass('attachments').appendTo(emailContentContainer);
          $.each(data.attachments, function(index, attachment) {
            var downloadLink = $('<a>').attr('href', 'https://www.1secmail.com/mailbox/?action=download&id=' + id + '&login=' + name + '&domain=' + domain + '&file=' + attachment.filename).text(attachment.filename).appendTo(attachmentsDiv);
            downloadLink.click(function(event) {
              event.preventDefault();
              window.location.href = downloadLink.attr('href');
            });
          });
        }
        backButton.click(function() {
          emailContentContainer.empty();
          backButton.hide();
          emailsContainer.show();
        });
      });
    }
  }

  
  function generateMailbox() {
    $.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1', function(data) {
      mailboxTextbox.val(data[0]);
      fetchEmails();
    });
  }
});