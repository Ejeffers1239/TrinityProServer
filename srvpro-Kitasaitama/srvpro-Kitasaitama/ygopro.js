// Generated by CoffeeScript 2.5.1
(function() {
  var Struct, YGOProMessagesHelper, _, loadJSON, translateHandler;

  _ = require('underscore');

  _.str = require('underscore.string');

  _.mixin(_.str.exports());

  Struct = require('./struct.js').Struct;

  loadJSON = require('load-json-file').sync;

  this.i18ns = loadJSON('./data/i18n.json');

  YGOProMessagesHelper = require("./YGOProMessages.js").YGOProMessagesHelper; // 为 SRVPro2 准备的库，这里拿这个库只用来测试，SRVPro1 对异步支持不是特别完善，因此不会有很多异步优化

  this.helper = new YGOProMessagesHelper();

  this.structs = this.helper.structs;

  this.structs_declaration = this.helper.structs_declaration;

  this.typedefs = this.helper.typedefs;

  this.proto_structs = this.helper.proto_structs;

  this.constants = this.helper.constants;

  translateHandler = function(handler) {
    return async function(buffer, info, datas, params) {
      return (await handler(buffer, info, params.client, params.server, datas));
    };
  };

  this.stoc_follow = function(proto, synchronous, callback) {
    this.helper.addHandler(`STOC_${proto}`, translateHandler(callback), synchronous, 1);
  };

  this.stoc_follow_before = function(proto, synchronous, callback) {
    this.helper.addHandler(`STOC_${proto}`, translateHandler(callback), synchronous, 0);
  };

  this.stoc_follow_after = function(proto, synchronous, callback) {
    this.helper.addHandler(`STOC_${proto}`, translateHandler(callback), synchronous, 2);
  };

  this.ctos_follow = function(proto, synchronous, callback) {
    this.helper.addHandler(`CTOS_${proto}`, translateHandler(callback), synchronous, 1);
  };

  this.ctos_follow_before = function(proto, synchronous, callback) {
    this.helper.addHandler(`CTOS_${proto}`, translateHandler(callback), synchronous, 0);
  };

  this.ctos_follow_after = function(proto, synchronous, callback) {
    this.helper.addHandler(`CTOS_${proto}`, translateHandler(callback), synchronous, 2);
  };

  //消息发送函数,至少要把俩合起来....
  this.stoc_send = function(socket, proto, info) {
    return this.helper.sendMessage(socket, `STOC_${proto}`, info);
  };

  this.ctos_send = function(socket, proto, info) {
    return this.helper.sendMessage(socket, `CTOS_${proto}`, info);
  };

  //util
  this.stoc_send_chat = function(client, msg, player = 8) {
    var i, len, line, o, r, re, ref, ref1;
    if (!client) {
      console.log("err stoc_send_chat");
      return;
    }
    ref = _.lines(msg);
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      if (player >= 10) {
        line = "[Server]: " + line;
      }
      ref1 = this.i18ns[client.lang];
      for (o in ref1) {
        r = ref1[o];
        re = new RegExp("\\$\\{" + o + "\\}", 'g');
        line = line.replace(re, r);
      }
      this.stoc_send(client, 'CHAT', {
        player: player,
        msg: line
      });
    }
  };

  this.stoc_send_chat_to_room = function(room, msg, player = 8) {
    var client, i, j, len, len1, ref, ref1;
    if (!room) {
      console.log("err stoc_send_chat_to_room");
      return;
    }
    ref = room.players;
    for (i = 0, len = ref.length; i < len; i++) {
      client = ref[i];
      if (client) {
        this.stoc_send_chat(client, msg, player);
      }
    }
    ref1 = room.watchers;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      client = ref1[j];
      if (client) {
        this.stoc_send_chat(client, msg, player);
      }
    }
  };

  this.stoc_send_hint_card_to_room = function(room, card) {
    var client, i, j, len, len1, ref, ref1;
    if (!room) {
      console.log("err stoc_send_hint_card_to_room");
      return;
    }
    ref = room.players;
    for (i = 0, len = ref.length; i < len; i++) {
      client = ref[i];
      if (client) {
        this.stoc_send(client, 'GAME_MSG', {
          curmsg: 2,
          type: 10,
          player: 0,
          data: card
        });
      }
    }
    ref1 = room.watchers;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      client = ref1[j];
      if (client) {
        this.stoc_send(client, 'GAME_MSG', {
          curmsg: 2,
          type: 10,
          player: 0,
          data: card
        });
      }
    }
  };

  this.stoc_die = function(client, msg) {
    this.stoc_send_chat(client, msg, this.constants.COLORS.RED);
    if (client) {
      this.stoc_send(client, 'ERROR_MSG', {
        msg: 1,
        code: 9
      });
    }
    if (client) {
      client.system_kicked = true;
      client.destroy();
    }
  };

}).call(this);