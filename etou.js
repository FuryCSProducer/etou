var fetch = global.nodemodule["node-fetch"];
var fs = global.nodemodule["fs"];
var path = global.nodemodule["path"];
var wait = global.nodemodule["wait-for-stuff"];
var streamBuffers = global.nodemodule["stream-buffers"];
var fetch = global.nodemodule["node-fetch"];
var merge = global.nodemodule["merge-images"];
var waiton =global.nodemodule["wait-on"];
var Jimp = global.nodemodule["jimp"];
var { Canvas, Image } = global.nodemodule["canvas"];
var time = new Date();
function ensureExists(path, mask) {
  if (typeof mask != 'number') {
    mask = 0o777;
  }
  try {
    fs.mkdirSync(path, {
      mode: mask,
      recursive: true
    });
    return undefined;
  } catch (ex) {
    return { err: ex };
  }
}
var rootpath = path.resolve(__dirname, "..", "etou-data");
ensureExists(rootpath);
ensureExists(path.join(rootpath, "images"));
ensureExists(path.join(rootpath, "temp"));
function sO(object) {
    return Object.keys(object).length;
}
var etou = function (type, data) {
    var sender = data.msgdata.senderID;
    var mentions = data.mentions;
	var UserAvatar = "UserAvatar_" + Date.now() + ".jpg";
	var UserAvatar1 = "UserAvatar1_" + Date.now() + ".jpg";
	var succ = "Success_" + Date.now() + ".jpg";
	
    if (sO(mentions) == 1) {
        Jimp.read("https://graph.facebook.com/" + sender + "/picture?width=120&height=120&access_token=170440784240186|bc82258eaaf93ee5b9f577a8d401bfc9").then(img => {
            img.write(path.join(rootpath, "temp", UserAvatar));
        }).catch(err => {
            data.log(err);
        });
        Jimp.read("https://graph.facebook.com/" + Object.keys(mentions)[0].slice(3) + "/picture?width=140&height=140&access_token=170440784240186|bc82258eaaf93ee5b9f577a8d401bfc9").then(img => {
            img.write(path.join(rootpath, "temp", UserAvatar1));
        }).catch(err => {
            data.log(err);
        });
        waiton({
            resources: [
				path.join(rootpath, "temp", UserAvatar),
				path.join(rootpath, "temp", UserAvatar1)
						],
            timeout: 50000
        }).then(function () {
            merge(
				[
				{
					src: path.join(rootpath, "images", "etou.jpg")
				},
                {
                    src: path.join(rootpath, "temp", UserAvatar),
                    x: 190,
                    y: 155
                },
                {
                    src: path.join(rootpath, "temp", UserAvatar1),
                    x: 525,
                    y: 45
                }
				], {
                Canvas: Canvas,
                Image: Image
				   }
				).then(function (res) {
					
                fs.writeFile(
					path.join(rootpath, "temp", succ), 
					res.replace(/^data:image\/png;base64,/, ""), 
					'base64', 
					function (err) {
						
                    if (err) data.log(err);
					
                        var img = fs.createReadStream(path.join(rootpath, "temp", succ));
						
                        data.return({
                            handler: "internal-raw",
                            data: {
							body: "etou...",
                                attachment: ([img])
                            }
                        });
						img.on("close", () => {
						try {
                        fs.unlinkSync(path.join(rootpath, "temp", UserAvatar));
                        fs.unlinkSync(path.join(rootpath, "temp", UserAvatar1));
                        fs.unlinkSync(path.join(rootpath, "temp", succ));
						} catch (err) {}
						})
                });
            }).catch(err => {
                data.log(err);
            });
        }).catch(err => {
                data.log(err);
            });
    } else {
        data.return({
            handler: 'internal',
            data: global.config.commandPrefix+'etou <@mentions> [etou ai đó]'
        })
    }
 }
module.exports = {
	etou: etou
}
