//properties.js
exports.facebook_token = process.env.TOKEN_VALUE;
exports.facebook_challenge = 'ldv_token_bot';
exports.facebook_message_endpoint = 'https://graph.facebook.com/v2.6/me/messages';

exports.google_news_endpoint = "https://news.google.com/news?output=rss";

exports.wit_token = process.env.WIT_TOKEN;
exports.wit_endpoint = 'https://api.wit.ai/message?v=20160720&q=';