const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")
const prefix = "k!"
const Keyv = require("keyv")
const gmutes = new Keyv("sqlite://gmutes.sqlite", {table: "gmutes"})



client.on("ready", ()  => {
  console.log(client.user.tag + "でログイン中")
});



client.on("message", async message => {
  if (message.author.bot) {
    return;
  }
  if (message.channel.type == "dm") {
    return;
  }
  if (message.content == prefix+"global_setup") {
    if (!message.member.hasPermission('MANAGE_WEBHOOKS')) return message.channel.send('<:kiken:812497914168475678>権限がありません')
//    if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_WEBHOOKS")) {
//      message.channel.send("Webhookを作成する権限がありません。\nMANAGE_WEBHOOKS")
//      return;
    
    message.channel.createWebhook('きのこグローバルチャット用webhook').then(webhook => {
      var webhookinfo = {
        "id": webhook.id,
        "token": webhook.token,
        "channel": message.channel.id
      }
      var savedata = JSON.stringify(webhookinfo);
      try {
        fs.mkdirSync(`globalchatfiles/${message.guild.id}/`, { recursive: true });
        fs.writeFileSync(`globalchatfiles/${message.guild.id}/webhook.json`, savedata);
        //成功すれば、Webhookが保存されます。
      }
      catch (error) {
        message.channel.send("<:kiken:812497914168475678>参加できませんでした。\n<:chui:812497940753023017>エラー内容はサーバーに送信されます。" + error)
        return;
      }
      var sentchannelid = webhook.channel
      const webhooks = new Discord.WebhookClient(webhook.id, webhook.token)
      webhooks.send("<:join:805306364406530049>グローバルチャットに参加しました。\nグローバルチャットルール記載鯖=>https://discord.gg/8eAQ2gP")
      //ほかのサーバーに参加通知を送る
      //サーバーごとにファイルを読み込んで、webhookで送信する。
      client.guilds.cache.forEach(guild => {
        try {
          var webhookjoined = JSON.parse(fs.readFileSync(`globalchatfiles/${guild.id}/webhook.json`))
        } catch (err) {
          return;
          //参加していなければ、そのサーバーはパスする。
        }
        var channelid = webhookjoined.channel
        try {
          client.channels.cache.get(channelid).id
        }
        catch (error) {
          return;
          //チャンネルが削除されていたら、動作をキャンセルするコード。
        }
        var webhookid = webhookjoined.id
        var webhooktoken = webhookjoined.token
        if (message.channel.id == sentchannelid) return;
        if (message.guild.id == guild.id) return;
        try {
          new Discord.WebhookClient(webhookid, webhooktoken).send("<:join:805306364406530049>" + message.guild.name + "が、グローバルチャットに参加しました。いっぱい雑談しましょう！！", { username: "きのこグローバル全体チャット", disableMentions: "all"})
        } catch (error) {

        }
      })
      
      //webhookは、チャンネルごとに10個までしか作れないので、作成できなかった場合には、参加成功メッセージが来ない仕組み。
    }).catch(console.error);
  }
});
client.on("message", message => {
  if (message.author.bot) {
    return;
  }
  if (message.channel.type == "dm") {
    return;
  }
  try {
    const guild_webhook = JSON.parse(fs.readFileSync(`globalchatfiles/${message.guild.id}/webhook.json`))
    var sentchannelid = guild_webhook.channel
  } catch (error) {
    return;
    //読み取れなかった場合、ほとんどの場合は参加していないのでリターンする。
  }
  if (message.channel.id == sentchannelid) {
    //サーバーごとにファイルを読み込んで、webhookで送信する。
    client.guilds.cache.forEach(guild => {
      try {
        var webhook = JSON.parse(fs.readFileSync(`globalchatfiles/${guild.id}/webhook.json`))
      } catch (err) {
        return;
        //参加していなければ、そのサーバーはパスする。
      }
      var channelid = webhook.channel
      try {
        client.channels.cache.get(channelid).id
      }
      catch (error) {
        return;
        //チャンネルが削除されていたら、動作をキャンセルするコード。
      }
      var webhookid = webhook.id
      var webhooktoken = webhook.token
      var admin = "";
      if (message.author.id === "695500134179536907") {
      admin = "👑";
      }
      var subadmin = "";
      if (message.author.id === "702859797300772964||663196515384295425||614305573827117066||722717188666163220||767325957392039966") {
      subadmin = "⚙";
      }
      var check = "🟢";
      if (message.author.id === "695500134179536907||702859797300772964||663196515384295425||614305573827117066||722717188666163220||767325957392039966") { 
      check = "✅";
      }
      var kiken = "";
      if (message.author.id === "811703794202050600") { 
      kiken = "⚠";
      }
//      var mark = "🟢";
//      if (message.author.id === "702859797300772964") {
//      mark = "👑";
//      };
      const serverwebhook = new Discord.WebhookClient(webhookid, webhooktoken)
      if (message.channel.id == channelid) return;
      if (message.guild.id == guild.id) return;
      try {
        serverwebhook.send(message.content, { username: message.author.tag + "(" + message.author.id + ") | " + message.guild.name + "(" + admin + subadmin + kiken + check + ")", avatarURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`, disableMentions: "all"})
      } catch (error) {
      }
      message.react('805306364406530049')
      message.react('812497965397573662')
    })
  }
});

client.login("TOKEN")
