//api.js
var request = require('request');
var rssReader = require('feed-read');
var properties = require('../config/properties.js')

// if our user.js file is at app/models/user.js
var Alumno = require('../model/alumno');

exports.tokenVerification = function(req, res) {
	if (req.query['hub.verify_token'] === properties.facebook_challenge) {
    res.send(req.query['hub.challenge']);
  } else {
  	res.send('Error, token de validación incorrecto');
  }
}

exports.handleMessage = function(req, res) {
	messaging_events = req.body.entry[0].messaging;
	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i];
		sender = event.sender.id;
		if (event.message && event.message.text) {
		  	text = event.message.text;

        normalizedText = text.toLowerCase().replace(' ', '');

        switch(normalizedText) {
          case "/subscribe":
            subscribeUser(sender)
            break;
          case "/unsubscribe":
            unsubscribeUser(sender)
            break;
          case "/subscribestatus":
            subscribeStatus(sender)
            break;
          default:
            callWitAI(text, function(err, intent) {
              handleIntent(intent, sender)
            })
          }
  		}
    }
	res.sendStatus(200);
}

function handleIntent(intent, sender) {
  switch(intent) {
    case "greeting":
      sendTextMessage(sender, "Hola!")
      break;
    case "identification":
      sendTextMessage(sender, "Soy ldvbot.")
      break;
    case "more news":
      _getArticles(function(err, articles) {
        if (err) {
          console.log(err);
        } else {
          sendTextMessage(sender, "Que tal esto?")
          maxArticles = Math.min(articles.length, 5);
          for (var i=0; i<maxArticles; i++) {
            _sendArticleMessage(sender, articles[i])
          }
        }
      })
      break;
    case "general news":
      _getArticles(function(err, articles) {
        if (err) {
          console.log(err);
        } else {
          sendTextMessage(sender, "Esto es lo que he encontrado...")
          _sendArticleMessage(sender, articles[0])
        }
      })
      break;
    case "local news":
      _getArticles(function(err, articles) {
        if (err) {
          console.log(err);
        } else {
          sendTextMessage(sender, "No se de noticias locales todavía, pero encontré estas ...")
          _sendArticleMessage(sender, articles[0])
        }
      })
      break;
    default:
      sendTextMessage(sender, "No estoy seguro acerca de eso :/")
      break

  }
}

function subscribeUser(id) {

  var newUser = new User({
    fb_id: id,
  });


  User.findOneAndUpdate({fb_id: newUser.fb_id}, {fb_id: newUser.fb_id}, {upsert:true}, function(err, user) {
    if (err) {
      sendTextMessage(id, "Se produjo un error al suscribirte en artículos diarios.");
    } else {
      console.log('Usuario registrado correctamente!');
      sendTextMessage(newUser.fb_id, "Te has suscrito!")
    }
  });
}

function unsubscribeUser(id) {

  User.findOneAndRemove({fb_id: id}, function(err, user) {
    if (err) {
      sendTextMessage(id, "Se produjo un error al cancelar la suscripción de artículos diarios.");
    } else {
      console.log('Usuario eliminado!');
      sendTextMessage(id, "Has cancelado tu suscripción!")
    }
  });
}

function subscribeStatus(id) {
  User.findOne({fb_id: id}, function(err, user) {
    subscribeStatus = false
    if (err) {
      console.log(err)
    } else {
      if (user != null) {
        subscribeStatus = true
      }
      subscribedText = "Su estado de suscripcion es " + subscribeStatus
      sendTextMessage(id, subscribedText)
    }
  })
}

function _getArticles(callback) {
  rssReader(properties.google_news_endpoint, function(err, articles) {
    if (err) {
      callback(err)
    } else {
      if (articles.length > 0) {
        callback(null, articles)
      } else {
        callback("No se ha recibido articulos")
      }
    }
  })
}

exports.getArticles = function(callback) {
	_getArticles(callback)
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: properties.facebook_message_endpoint,
    qs: { access_token: properties.facebook_token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Se envió con éxito un mensaje genérico con id %s al destinatario %s", 
        messageId, recipientId);
    } else {
      console.log(response.statusCode)
      console.error("No se puede enviar el mensaje.");
      //console.error(response);
      console.error(error);
    }
  });  
}

function _sendArticleMessage(sender, article) {
  messageData = {
    recipient: {
      id: sender
    },
    message: {
    attachment:{
          type:"template",
          payload:{
            template_type:"generic",
            elements:[
              {
                title:article.title,
                subtitle: article.published.toString(),
                item_url:article.link
                }
        ]
        }
        }
      }
  }
  
  callSendAPI(messageData)
}

function callWitAI(query, callback) {
  query = encodeURIComponent(query);
   request({
    uri: properties.wit_endpoint+query,
    qs: { access_token: properties.wit_token },
    method: 'GET'
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Conseguido con éxito %s", response.body);
      try {
        body = JSON.parse(response.body)
        intent = body["entities"]["Intent"][0]["value"]
        callback(null, intent)
      } catch (e) {
        callback(e)
      }
    } else {
      console.log(response.statusCode)
      console.error("No se puede enviar el mensaje.. %s", error);
      callback(error)
    }
  });
}

exports.sendArticleMessage = function(sender, article) {
  _sendArticleMessage(sender, article)
}