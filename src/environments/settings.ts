export const settings={
  contract_addr:"erd1qqqqqqqqqqqqqpgqh8p6gslvuzjx88rkvdhjy4sz2yk05n54835sv9zgjl",
  ihm_level:2,
  appname: "TOKEMON World (beta)",
  appli:"https://tokemonbeta.f80.fr",
  network: "elrond-devnet"
}


export const abi={
  "buildInfo": {
    "rustc": {
      "version": "1.82.0",
      "commitHash": "f6e511eec7342f59a25f7c0534f1dbea00d01b14",
      "commitDate": "2024-10-15",
      "channel": "Stable",
      "short": "rustc 1.82.0 (f6e511eec 2024-10-15)"
    },
    "contractCrate": {
      "name": "tokemonworld",
      "version": "0.0.1"
    },
    "framework": {
      "name": "multiversx-sc",
      "version": "0.56.0"
    }
  },
  "docs": [
    "An empty contract. To be used as a template when starting a new contract from scratch."
  ],
  "name": "TokemonWorld",
  "constructor": {
    "inputs": [
      {
        "name": "fee",
        "type": "u64"
      },
      {
        "name": "max_games_per_user",
        "type": "u32"
      },
      {
        "name": "seuil_capture",
        "type": "u32"
      }
    ],
    "outputs": []
  },
  "endpoints": [
    {
      "name": "users",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<Address>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "tokemons",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<Tokemon>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "tokemon_bags",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<TokemonBag>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "killed",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<u32>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "fee",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "u64"
        }
      ]
    },
    {
      "name": "pv_token",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "TokenIdentifier"
        }
      ]
    },
    {
      "name": "games",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<Game>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "stocks",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "id",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "add_game",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "game_title",
          "type": "bytes"
        },
        {
          "name": "grid_size",
          "type": "u32"
        },
        {
          "name": "quota",
          "type": "u32"
        },
        {
          "name": "entrance_x",
          "type": "u32"
        },
        {
          "name": "entrance_y",
          "type": "u32"
        },
        {
          "name": "entrance_z",
          "type": "u32"
        },
        {
          "name": "exit_x",
          "type": "u32"
        },
        {
          "name": "exit_y",
          "type": "u32"
        },
        {
          "name": "exit_z",
          "type": "u32"
        },
        {
          "name": "ne_x",
          "type": "u32"
        },
        {
          "name": "ne_y",
          "type": "u32"
        },
        {
          "name": "ne_z",
          "type": "u32"
        },
        {
          "name": "sw_x",
          "type": "u32"
        },
        {
          "name": "sw_y",
          "type": "u32"
        },
        {
          "name": "sw_z",
          "type": "u32"
        },
        {
          "name": "move_min",
          "type": "u32"
        },
        {
          "name": "move_max",
          "type": "u32"
        },
        {
          "name": "n_degrees",
          "type": "u16"
        },
        {
          "name": "map_path",
          "type": "bytes"
        },
        {
          "name": "min_visibility",
          "type": "u32"
        },
        {
          "name": "max_visibility",
          "type": "u32"
        },
        {
          "name": "min_pv",
          "type": "u32"
        },
        {
          "name": "max_pv",
          "type": "u32"
        },
        {
          "name": "max_per_user",
          "type": "u16"
        },
        {
          "name": "max_player",
          "type": "u16"
        },
        {
          "name": "turns",
          "type": "u16"
        },
        {
          "name": "geoloc_to_catch",
          "type": "bool"
        },
        {
          "name": "geoloc_to_drop",
          "type": "bool"
        },
        {
          "name": "tokemon_view",
          "type": "bool"
        },
        {
          "name": "user_visibility",
          "type": "bool"
        },
        {
          "name": "cost_to_move",
          "type": "u32"
        },
        {
          "name": "cost_to_fight",
          "type": "u32"
        },
        {
          "name": "gps_tolerance",
          "type": "u16"
        },
        {
          "name": "max_to_engage",
          "type": "u16"
        },
        {
          "name": "attacker_part",
          "type": "u8"
        },
        {
          "name": "defender_part",
          "type": "u8"
        },
        {
          "name": "welcome_pack",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "Game"
        }
      ]
    },
    {
      "name": "fund",
      "onlyOwner": true,
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "name": "fund_game",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        }
      ],
      "outputs": []
    },
    {
      "name": "get_tokemon_bags",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "tokemon_id",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "List<TokemonBag>"
        }
      ]
    },
    {
      "name": "can_drop",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "bytes"
        }
      ]
    },
    {
      "name": "get_game_infos",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "GameInfo"
        }
      ]
    },
    {
      "name": "airdrop",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        },
        {
          "name": "visibility",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "staking",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "max_by_item",
          "type": "u32"
        },
        {
          "name": "amount_by_tokemon",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "take",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "t_id",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "Tokemon"
        }
      ]
    },
    {
      "name": "move_tokemon",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "t_id",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        },
        {
          "name": "with_attack",
          "type": "bool"
        }
      ],
      "outputs": []
    },
    {
      "name": "capture",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "t_id",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "Tokemon"
        }
      ]
    },
    {
      "name": "reloading",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "token_id",
          "type": "u32"
        }
      ],
      "outputs": []
    },
    {
      "name": "reloading_all",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [],
      "outputs": []
    },
    {
      "name": "add_to_bag",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "tokemon_id",
          "type": "u32"
        }
      ],
      "outputs": []
    },
    {
      "name": "drop",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "bytes"
        },
        {
          "name": "visibility",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        },
        {
          "name": "x1",
          "type": "u32"
        },
        {
          "name": "y1",
          "type": "u32"
        },
        {
          "name": "z1",
          "type": "u32"
        },
        {
          "name": "x2",
          "type": "u32"
        },
        {
          "name": "y2",
          "type": "u32"
        },
        {
          "name": "z2",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "close_game",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        }
      ],
      "outputs": []
    },
    {
      "name": "restore_to_owners",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "n_tokemons",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "fight",
      "mutability": "mutable",
      "inputs": [
        {
          "name": "t1_id",
          "type": "u32"
        },
        {
          "name": "t2_id",
          "type": "u32"
        }
      ],
      "outputs": []
    },
    {
      "name": "add_tokemon",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "bytes"
        },
        {
          "name": "nft",
          "type": "TokenIdentifier"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "get_idx_address",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "address",
          "type": "Address"
        }
      ],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "show_all_my_nfts",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "caller",
          "type": "Address"
        }
      ],
      "outputs": [
        {
          "type": "variadic<Tokemon>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "show_tokemon_by_tokemon",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "caller",
          "type": "Address"
        }
      ],
      "outputs": [
        {
          "type": "variadic<Tokemon>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "show_nfts",
      "mutability": "readonly",
      "inputs": [
        {
          "name": "game_id",
          "type": "u32"
        },
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        }
      ],
      "outputs": [
        {
          "type": "variadic<Tokemon>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "update_fee",
      "onlyOwner": true,
      "mutability": "mutable",
      "inputs": [
        {
          "name": "fee",
          "type": "u64"
        }
      ],
      "outputs": []
    },
    {
      "name": "get_fees",
      "onlyOwner": true,
      "mutability": "mutable",
      "inputs": [],
      "outputs": []
    }
  ],
  "esdtAttributes": [],
  "hasCallback": false,
  "types": {
    "Game": {
      "type": "struct",
      "fields": [
        {
          "name": "id",
          "type": "u32"
        },
        {
          "name": "title",
          "type": "bytes"
        },
        {
          "name": "owner",
          "type": "u32"
        },
        {
          "name": "ne",
          "type": "Point"
        },
        {
          "name": "sw",
          "type": "Point"
        },
        {
          "name": "cost_to_move",
          "type": "u32"
        },
        {
          "name": "cost_to_fight",
          "type": "u32"
        },
        {
          "name": "grid_size",
          "type": "u32"
        },
        {
          "name": "quota",
          "type": "u32"
        },
        {
          "name": "entrance",
          "type": "Point"
        },
        {
          "name": "exit",
          "type": "Point"
        },
        {
          "name": "url",
          "type": "bytes"
        },
        {
          "name": "min_visibility",
          "type": "u32"
        },
        {
          "name": "max_visibility",
          "type": "u32"
        },
        {
          "name": "min_pv",
          "type": "u32"
        },
        {
          "name": "max_pv",
          "type": "u32"
        },
        {
          "name": "max_player",
          "type": "u16"
        },
        {
          "name": "min_distance",
          "type": "u32"
        },
        {
          "name": "max_distance",
          "type": "u32"
        },
        {
          "name": "n_degrees",
          "type": "u16"
        },
        {
          "name": "turns",
          "type": "u16"
        },
        {
          "name": "max_per_user",
          "type": "u16"
        },
        {
          "name": "tokemon_view",
          "type": "bool"
        },
        {
          "name": "closed",
          "type": "bool"
        },
        {
          "name": "geoloc_to_drop",
          "type": "bool"
        },
        {
          "name": "geoloc_to_catch",
          "type": "bool"
        },
        {
          "name": "user_visibility",
          "type": "bool"
        },
        {
          "name": "gps_tolerance",
          "type": "u16"
        },
        {
          "name": "max_to_engage",
          "type": "u16"
        },
        {
          "name": "attacker_part",
          "type": "u8"
        },
        {
          "name": "defender_part",
          "type": "u8"
        },
        {
          "name": "welcome_pack",
          "type": "u32"
        }
      ]
    },
    "GameInfo": {
      "type": "struct",
      "fields": [
        {
          "name": "n_tokemons",
          "type": "u32"
        },
        {
          "name": "n_players",
          "type": "u32"
        },
        {
          "name": "nfts",
          "type": "List<TokenIdentifier>"
        },
        {
          "name": "nonce",
          "type": "List<u32>"
        }
      ]
    },
    "Point": {
      "type": "struct",
      "fields": [
        {
          "name": "x",
          "type": "u32"
        },
        {
          "name": "y",
          "type": "u32"
        },
        {
          "name": "z",
          "type": "u32"
        }
      ]
    },
    "Tokemon": {
      "type": "struct",
      "fields": [
        {
          "name": "id",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "bytes"
        },
        {
          "name": "owner",
          "type": "u32"
        },
        {
          "name": "nft",
          "type": "TokenIdentifier"
        },
        {
          "name": "nonce",
          "type": "u32"
        },
        {
          "name": "pv",
          "type": "u32"
        },
        {
          "name": "position",
          "type": "Point"
        },
        {
          "name": "state",
          "type": "u8"
        },
        {
          "name": "visibility",
          "type": "u32"
        },
        {
          "name": "game",
          "type": "u32"
        }
      ]
    },
    "TokemonBag": {
      "type": "struct",
      "fields": [
        {
          "name": "tokemon_id",
          "type": "u32"
        },
        {
          "name": "coin",
          "type": "TokenIdentifier"
        },
        {
          "name": "amount",
          "type": "BigUint"
        }
      ]
    }
  }
}
