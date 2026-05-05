# 兔ฺBI

TianTcl's first discord bot

[Install](https://discord.com/oauth2/authorize?client_id=1500709188056252466&permissions=910941051415696&integration_type=0&scope=bot+applications.commands)

Permission Int: 910941051415696

## Files heirachy
```
project/
│
├── index.js                # boot + interaction router
├── loader.js               # slash command registration
├── memory.js               # database layer (mysql)
│
├── features/
│   ├── configure/
│   └── name-change/
│       ├── command.js      # main handler for /name-change
│       ├── index.js        # Interaction and command parsing
│       ├── service.js      # business logic
│       └── ui.js           # buttons + modal builders
├── helpers/
│   ├── proto.js            # Add additional prototypes
│   └── utils.js            # Add functions for convenience
│
└── .env
```

# Self paste notes

colour: 1) #F7A6F2 2) #5865F2

## TODOs

In /features/name-change
- Add: banner img, footer customization to embed
In /features/configure
- add /config command
- add /reset <confirm> command: purgeGuild()