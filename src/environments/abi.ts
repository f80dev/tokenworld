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
        "name": "promptmarket",
        "version": "0.0.0"
      },
      "framework": {
        "name": "multiversx-sc",
        "version": "0.50.4"
      }
    },
    "docs": [
      "An empty contract. To be used as a template when starting a new contract from scratch."
    ],
    "name": "PromptMarket",
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
        "name": "prompts",
        "mutability": "readonly",
        "inputs": [],
        "outputs": [
          {
            "type": "variadic<Prompt>",
            "multi_result": true
          }
        ]
      },
      {
        "name": "servers",
        "mutability": "readonly",
        "inputs": [],
        "outputs": [
          {
            "type": "variadic<Server>",
            "multi_result": true
          }
        ]
      },
      {
        "name": "renders",
        "mutability": "readonly",
        "inputs": [],
        "outputs": [
          {
            "type": "variadic<Render>",
            "multi_result": true
          }
        ]
      },
      {
        "name": "dt_start_market",
        "mutability": "readonly",
        "inputs": [],
        "outputs": [
          {
            "type": "u64"
          }
        ]
      },
      {
        "name": "closed_prompt",
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
        "name": "closed_servers",
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
        "name": "evals",
        "mutability": "readonly",
        "inputs": [],
        "outputs": [
          {
            "type": "variadic<Eval>",
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
        "name": "add_prompt",
        "mutability": "mutable",
        "payableInTokens": [
          "*"
        ],
        "inputs": [
          {
            "name": "text",
            "type": "bytes"
          },
          {
            "name": "server_id",
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
        "name": "cancel_prompt",
        "mutability": "mutable",
        "inputs": [
          {
            "name": "prompt_id",
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
        "name": "add_server",
        "mutability": "mutable",
        "inputs": [
          {
            "name": "type_server",
            "type": "u8"
          },
          {
            "name": "title",
            "type": "bytes"
          },
          {
            "name": "description",
            "type": "bytes"
          },
          {
            "name": "visual",
            "type": "bytes"
          },
          {
            "name": "domain",
            "type": "bytes"
          },
          {
            "name": "params",
            "type": "bytes"
          },
          {
            "name": "price",
            "type": "BigUint"
          },
          {
            "name": "token",
            "type": "TokenIdentifier"
          }
        ],
        "outputs": [
          {
            "type": "u32"
          }
        ]
      },
      {
        "name": "cancel_server",
        "mutability": "mutable",
        "inputs": [
          {
            "name": "server_id",
            "type": "u32"
          },
          {
            "name": "autoclose_prompt",
            "type": "bool"
          }
        ],
        "outputs": [
          {
            "type": "bool"
          }
        ]
      },
      {
        "name": "eval_render",
        "mutability": "mutable",
        "inputs": [
          {
            "name": "render_id",
            "type": "u32"
          },
          {
            "name": "note",
            "type": "u8"
          }
        ],
        "outputs": [
          {
            "type": "bool"
          }
        ]
      },
      {
        "name": "add_render",
        "mutability": "mutable",
        "inputs": [
          {
            "name": "prompt_id",
            "type": "u32"
          },
          {
            "name": "url",
            "type": "bytes"
          },
          {
            "name": "render_duration",
            "type": "u16"
          },
          {
            "name": "start_delay",
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
      "Eval": {
        "type": "struct",
        "fields": [
          {
            "name": "render",
            "type": "u32"
          },
          {
            "name": "note",
            "type": "u8"
          }
        ]
      },
      "Prompt": {
        "type": "struct",
        "fields": [
          {
            "name": "text",
            "type": "bytes"
          },
          {
            "name": "owner",
            "type": "u32"
          },
          {
            "name": "server",
            "type": "u32"
          }
        ]
      },
      "Render": {
        "type": "struct",
        "fields": [
          {
            "name": "prompt_id",
            "type": "u32"
          },
          {
            "name": "url",
            "type": "bytes"
          },
          {
            "name": "creator",
            "type": "u32"
          },
          {
            "name": "start_delay",
            "type": "u16"
          },
          {
            "name": "render_duration",
            "type": "u16"
          }
        ]
      },
      "Server": {
        "type": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "type_server",
            "type": "u8"
          },
          {
            "name": "title",
            "type": "bytes"
          },
          {
            "name": "description",
            "type": "bytes"
          },
          {
            "name": "visual",
            "type": "bytes"
          },
          {
            "name": "domain",
            "type": "bytes"
          },
          {
            "name": "price",
            "type": "BigUint"
          },
          {
            "name": "token",
            "type": "TokenIdentifier"
          },
          {
            "name": "parameters",
            "type": "bytes"
          },
          {
            "name": "owner",
            "type": "u32"
          }
        ]
      }
    }
  }

