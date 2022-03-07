const express = require("express");
const url = require("url");
const path = require("path");
const Discord = require("discord.js");
const ejs = require("ejs");
const passort = require("passport");
const bodyParser = require("body-parser");
const Strategy = require("passport-discord").Strategy;
const Settings = require("../config.json");
const passport = require("passport");
const GuildSettings = require("../models/settings");

module.exports = client => {
    const app = express();
    const session = require("express-session");
    const MemoryStore = require("memorystore")(session);

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((obj, done) => done(null, obj))
    passport.use(new Strategy({
        clientID: Settings.clientId,
        clientSecret: Settings.clientSecret,
        callbackURL: Settings.domain + "/callback",
        scope: ["identify", "guilds", "guilds.join"]
    },
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile))
        }
    ))

    app.use(session({
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: `#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n`,
        resave: false,
        saveUninitialized: false
    }))

    app.use(passport.initialize());
    app.use(passport.session());

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "./views"));


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
    //Loading css files
    app.use(express.static(path.join(__dirname, "./assets")));

    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        req.session.backURL = req.url;
        res.redirect("/login");
    }
    app.get("/login", (req, res, next) => {
        if (req.session.backURL) {
            req.session.backURL = req.session.backURL
        } else if (req.headers.referer) {
            const parsed = url.parse(req.headers.referer);
            if (parsed.hostname == app.locals.domain) {
                req.session.backURL = parsed.path
            }
        } else {
            req.session.backURL = "/"
        }
        next();
    }, passport.authenticate("discord", { prompt: "none" })
    );

    app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), async (req, res) => {
        let banned = false //client.settings.get("bannedusers")
        if (banned) {
            req.session.destroy()
            res.json({ login: false, message: "You are banned from the dashboard", logout: true })
            req.logout();
        } else {
            res.redirect("/dashboard")
        }
    });

    app.get("/logout", function (req, res) {
        req.session.destroy(() => {
            req.logout();
            res.redirect("/");
        })
    })

    app.get("/", (req, res) => {
        res.render("index", {
            req: req,
            user: req.isAuthenticated() ? req.user : null,
            bot: client,
            Permissions: Discord.Permissions,
            botconfig: Settings.domain,
            callback: Settings.domain + "/callback",
        })
    })

    app.get("/dashboard", (req, res) => {
        if (!req.isAuthenticated() || !req.user)
            return res.redirect("/?error=" + encodeURIComponent("Login first please!"))
        if (!req.user.guilds)
            return res.redirect("/?error=" + encodeURIComponent("Cannot get your Guilds"))
        res.render("dashboard", {
            req: req,
            user: req.isAuthenticated() ? req.user : null,
            bot: client,
            Permissions: Discord.Permissions,
            botconfig: Settings.domain,
            callback: Settings.domain + "/callback",
        })
    })

    app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID)
        if (!guild) return res.redirect("/dashboard");
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD))
            return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
        var storedSettings = await GuildSettings.findOne({
            gid: guild.id
        });
        if (!storedSettings) {
            // If there are no settings stored for this guild, we create them and try to retrive them again.
            const newSettings = new GuildSettings({
                gid: guild.id
            });
            await newSettings.save().catch(() => { });
            storedSettings = await GuildSettings.findOne({
                gid: guild.id
            });
        }
        res.render("settings", {
            req: req,
            user: req.isAuthenticated() ? req.user : null,
            guild: guild,
            bot: client,
            Permissions: Discord.Permissions,
            botconfig: Settings.domain,
            callback: Settings.domain + "/callback",
        })
    })

    app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID)
        if (!guild) return res.redirect("/dashboard");
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) return res.redirect("/dashboard");
        var storedSettings = await GuildSettings.findOne({
            gid: guild.id
          });
          if (!storedSettings) {
             const newSettings = new GuildSettings({
              gid: guild.id
            });
            await newSettings.save().catch(() => {});
            storedSettings = await GuildSettings.findOne({
              gid: guild.id
            });
          }
        if (req.body.prefix) client.settings.set(guild.id, req.body.prefix, "prefix");
        if (req.body.hellomsg) client.settings.set(guild.id, req.body.hellomsg, "hellomsg");
        if (req.body.roles) client.settings.set(guild.id, req.body.roles, "roles");
        await storedSettings.save().catch(() => {});
        guild.me.setNickname(req.body.username);
        res.render("settings", {
            req: req,
            user: req.isAuthenticated() ? req.user : null,
            guild: guild,
            bot: client,
            Permissions: Discord.Permissions,
            botconfig: Settings.domain,
            callback: Settings.domain + "/callback",
        })
    })

    const http = require("http").createServer(app);
    http.listen(Settings.port, () => {
        console.log(`Listening on *:${Settings.port}`);
    });

}