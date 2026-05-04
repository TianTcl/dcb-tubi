# 兔ฺBI

TianTcl's first discord bot

[Install](https://discord.com/oauth2/authorize?client_id=1500709188056252466&permissions=910941051415696&integration_type=0&scope=bot+applications.commands)

Permission Int: 910941051415696

## Files heirachy
```
project/
│
├── index.js                # boot + interaction router
├── commands.js             # slash command registration
├── memory.js               # database layer (SQLite)
│
├── features/
│   └── name-change/
│       ├── index.js        # main handler for /name-change
│       ├── service.js      # business logic
│       └── ui.js           # buttons + modal builders
│
└── .env
```

# Self paste notes

colour: 1) #F7A6BA 2) #5865F2