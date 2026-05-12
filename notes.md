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
│   │   ├── command.js      # main handler for /name-change
│   │   ├── handle.js       # Map commands and validate inputs
│   │   └── index.js        # Interaction and command parsing
│   ├── name-change/
│   │   ├── command.js      # main handler for /name-change
│   │   ├── handle.js       # Map commands and validate inputs
│   │   ├── index.js        # Interaction and command parsing
│   │   ├── service.js      # business logic
│   │   └── ui.js           # buttons + modal builders
│   └── song/
├── helpers/
│   ├── proto.js            # Add additional prototypes
│   ├── regex.js            # Central Regular Expression reference
│   └── utils.js            # Add functions for convenience
│
└── .env
```

## TODOs

In /features/stream-song
- Implement: [help](https://chatgpt.com/c/6a017c15-1d7c-83e8-8263-8afdfc3c4985)

# Self paste notes

colour: 1) #F7A6F2 2) #5865F2