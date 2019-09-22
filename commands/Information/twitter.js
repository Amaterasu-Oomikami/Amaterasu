const Command = require("../../util/Command.js");
const snekfetch = require("snekfetch");
const { RichEmbed } = require("discord.js");
const { TWITTER_API_KEY, TWITTER_SECRET } = process.env;

class Twitter extends Command {
    constructor(client) {
        super(client, {
            name: "twitter",
            description: "Returns info about a Twitter user.",
            category: "Information",
            usage: "twitter <user>",
            aliases: ["twitterinfo", "twitter-info", "tinfo"]
        });

        this.token = null;
    }

    async run(message, args, level) {
        const user = args[0];
        if (!user) return this.client.embed("commonError", message, "Please specify a Twitter user to get information on.");
        try {
            if (!this.token) await this.fetchToken();
            const { body } = await snekfetch
                .get("https://api.twitter.com/1.1/users/show.json")
                .set({ Authorization: `Bearer ${this.token}` })
                .query({ screen_name: user });
            const embed = new RichEmbed()
                .setColor(44269)
                .setThumbnail(body.profile_image_url_https)
                .setAuthor("Twitter", "https://vgy.me/a7ii9V.png")
                .setTitle(`${body.name} (@${body.screen_name})`)
                .setURL(`https://twitter.com/${body.screen_name}`)
                .setDescription(body.description)
                .addField("❯ Followers", body.followers_count, true)
                .addField("❯ Following", body.friends_count, true)
                .addField("❯ Tweets", body.statuses_count, true)
                .addField("❯ Protected", body.protected ? "Yes" : "No", true)
                .addField("❯ Verified", body.verified ? "Yes" : "No", true)
                .addField("❯ Created", new Date(body.created_at).toDateString(), true)
                .addField("❯ Latest Tweet", body.status ? body.status.text : "???")
                .setFooter(`Info requested by ${message.author.tag}`, message.author.displayAvatarURL)
                .setTimestamp();
            return message.channel.send({ embed });
        } catch (error) {
            if (error.statusCode === 401) await this.fetchToken();
            if (error.statusCode === 404) return message.channel.send( "No search results found.");
            this.client.logger.error(error);
            return this.client.embed("APIError", message);
        }
    }

    async fetchToken() {
        const { body } = await snekfetch
            .post("https://api.twitter.com/oauth2/token")
            .set({
                Authorization: `Basic ${Buffer.from(`${TWITTER_API_KEY}:${TWITTER_SECRET}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            })
            .send("grant_type=client_credentials");
        this.token = body.access_token;
        return body;
    }
}

module.exports = Twitter;
