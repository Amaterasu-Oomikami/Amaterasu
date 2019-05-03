const Command = require("../base/Command.js");
const Discord = require("discord.js");

class Eval extends Command {
    constructor (client) {
        super(client, {
            name: "eval",
            description: "Evaluates arbitrary Javascript.",
            category: "System",
            usage: "eval <expression>",
            aliases: ["ev"],
            permLevel: "Bot Owner"
        });
    }

    async run (message, args, level) {
        function clean(text) {
            if (typeof(text) === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            }
        } try {
            const code = args.join(" ");
            let evaled = eval(code);
            let rawEvaled = evaled;
            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled);
            }
            let embed = new Discord.RichEmbed()
                .setColor(0x00FFFF)
                .setTitle(`Evaluated in ${Math.round(this.client.ping)}ms`)
                .addField(":inbox_tray: Input", `\`\`\`js\n${code}\n\`\`\``)
                .addField(":outbox_tray: Output", `\`\`\`js\n${clean(evaled).replace(this.client.config.token, "Are you retarded?")}\n\`\`\``)
                .addField('Type', `\`\`\`xl\n${(typeof rawEvaled).substr(0, 1).toUpperCase() + (typeof rawEvaled).substr(1)}\n\`\`\``)
            message.channel.send({embed});
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`js\n${clean(err)}\n\`\`\``);
        }
    }
}

module.exports = Eval;
