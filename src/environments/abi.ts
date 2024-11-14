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
        "inputs": [],
        "outputs": []
      },
      {
        "name": "drop_nft",
        "mutability": "mutable",
        "payableInTokens": [
          "*"
        ],
        "inputs": [
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
            "type": "u32"
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
        "name": "show_nfts",
        "mutability": "readonly",
        "inputs": [
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
            "name": "scale_factor",
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
            "name": "mode",
            "type": "u8"
          },
          {
            "name": "visibility",
            "type": "u32"
          }
        ]
      }
    }
  }
