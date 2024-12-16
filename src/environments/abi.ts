
export const abi=
  {
    "buildInfo": {
      "rustc": {
        "version": "1.78.0",
        "commitHash": "9b00956e56009bab2aa15d7bff10916599e3d6d6",
        "commitDate": "2024-04-29",
        "channel": "Stable",
        "short": "rustc 1.78.0 (9b00956e5 2024-04-29)"
      },
      "contractCrate": {
        "name": "tokemonworld",
        "version": "0.0.0"
      },
      "framework": {
        "name": "multiversx-sc",
        "version": "0.53.2"
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
          "name": "scale_factor",
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
            "name": "grid",
            "type": "u64"
          },
          {
            "name": "quota",
            "type": "u32"
          },
          {
            "name": "entrance_x",
            "type": "u64"
          },
          {
            "name": "entrance_y",
            "type": "u64"
          },
          {
            "name": "entrance_z",
            "type": "u64"
          },
          {
            "name": "exit_x",
            "type": "u64"
          },
          {
            "name": "exit_y",
            "type": "u64"
          },
          {
            "name": "exit_z",
            "type": "u64"
          },
          {
            "name": "ne_x",
            "type": "u64"
          },
          {
            "name": "ne_y",
            "type": "u64"
          },
          {
            "name": "ne_z",
            "type": "u64"
          },
          {
            "name": "sw_x",
            "type": "u64"
          },
          {
            "name": "sw_y",
            "type": "u64"
          },
          {
            "name": "sw_z",
            "type": "u64"
          },
          {
            "name": "move_min",
            "type": "u16"
          },
          {
            "name": "move_max",
            "type": "u16"
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
            "name": "max_player",
            "type": "u16"
          },
          {
            "name": "turns",
            "type": "u16"
          }
        ],
        "outputs": [
          {
            "type": "u32"
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
        "outputs": []
      },
      {
        "name": "add_user",
        "mutability": "readonly",
        "inputs": [
          {
            "name": "addr",
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
        "name": "can_drop",
        "mutability": "readonly",
        "inputs": [
          {
            "name": "game_id",
            "type": "u32"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
          }
        ],
        "outputs": [
          {
            "type": "bytes"
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
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
          },
          {
            "name": "visibility",
            "type": "u64"
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
          }
        ],
        "outputs": []
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
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
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
            "name": "t_id",
            "type": "u32"
          }
        ],
        "outputs": [
          {
            "type": "bool"
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
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
          }
        ],
        "outputs": [
          {
            "type": "variadic<u32>",
            "multi_result": true
          }
        ]
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
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
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
        "name": "show_nfts",
        "mutability": "readonly",
        "inputs": [
          {
            "name": "game_id",
            "type": "u32"
          },
          {
            "name": "caller",
            "type": "Address"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
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
            "name": "title",
            "type": "bytes"
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
            "name": "grid",
            "type": "u64"
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
            "name": "max_player",
            "type": "u16"
          },
          {
            "name": "min_distance",
            "type": "u16"
          },
          {
            "name": "max_distance",
            "type": "u16"
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
            "name": "bank",
            "type": "BigUint"
          }
        ]
      },
      "Point": {
        "type": "struct",
        "fields": [
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "z",
            "type": "u64"
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
            "type": "u64"
          },
          {
            "name": "pv",
            "type": "u64"
          },
          {
            "name": "position",
            "type": "Point"
          },
          {
            "name": "mode",
            "type": "u8"
          },
          {
            "name": "coin",
            "type": "TokenIdentifier"
          },
          {
            "name": "amount",
            "type": "u64"
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
      }
    }
  }
