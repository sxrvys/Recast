{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 8,
      "minor": 6,
      "revision": 5,
      "architecture": "x64",
      "modernui": 1
    },
    "rect": [
      60,
      60,
      1100,
      760
    ],
    "openinpresentation": 0,
    "boxes": [
      {
        "box": {
          "id": "in",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "in 1"
        }
      },
      {
        "box": {
          "id": "route",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "route stop"
        }
      },
      {
        "box": {
          "id": "unpack",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "unpack s f f f f i f"
        }
      },
      {
        "box": {
          "id": "set",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "prepend set"
        }
      },
      {
        "box": {
          "id": "pack",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "pack 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "start",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "prepend start"
        }
      },
      {
        "box": {
          "id": "play",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "play~ dummy 2"
        }
      },
      {
        "box": {
          "id": "stop",
          "maxclass": "message",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "stop"
        }
      },
      {
        "box": {
          "id": "l",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "*~ 0.6"
        }
      },
      {
        "box": {
          "id": "r",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "*~ 0.6"
        }
      },
      {
        "box": {
          "id": "ol",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "out~ 1"
        }
      },
      {
        "box": {
          "id": "or",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "out~ 2"
        }
      },
      {
        "box": {
          "id": "trig",
          "maxclass": "newobj",
          "patching_rect": [
            0,
            0,
            150,
            22
          ],
          "text": "t b s"
        }
      },
      {
        "box": {
          "id": "startstore",
          "maxclass": "newobj",
          "text": "f",
          "patching_rect": [
            40,
            40,
            40,
            22
          ]
        }
      },
      {
        "box": {
          "id": "rightselect",
          "maxclass": "newobj",
          "text": "selector~ 2",
          "patching_rect": [
            450,
            400,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "id": "envtime",
          "maxclass": "newobj",
          "text": "expr max(0., $f1 - 4.)",
          "patching_rect": [
            450,
            400,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "id": "env",
          "maxclass": "newobj",
          "text": "line~",
          "patching_rect": [
            450,
            400,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "id": "fadeleft",
          "maxclass": "newobj",
          "text": "*~",
          "patching_rect": [
            450,
            400,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "id": "faderight",
          "maxclass": "newobj",
          "text": "*~",
          "patching_rect": [
            450,
            400,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "id": "envmsg",
          "maxclass": "message",
          "text": "0, 1 2 1 $1 0 2",
          "patching_rect": [
            450,
            450,
            160,
            22
          ]
        }
      },
      {
        "box": {
          "id": "panleft",
          "maxclass": "newobj",
          "text": "expr cos(max(0., min(1., $f1)) * 1.57079632679)",
          "patching_rect": [
            300,
            400,
            340,
            22
          ]
        }
      },
      {
        "box": {
          "id": "panright",
          "maxclass": "newobj",
          "text": "expr cos(max(0., min(1., -$f1)) * 1.57079632679)",
          "patching_rect": [
            300,
            430,
            340,
            22
          ]
        }
      },
      {
        "box": {
          "id": "panleftsig",
          "maxclass": "newobj",
          "text": "*~ 1.",
          "patching_rect": [
            300,
            470,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "id": "panrightsig",
          "maxclass": "newobj",
          "text": "*~ 1.",
          "patching_rect": [
            500,
            470,
            180,
            22
          ]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "in",
            0
          ],
          "destination": [
            "route",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            0
          ],
          "destination": [
            "stop",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "stop",
            0
          ],
          "destination": [
            "play",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            1
          ],
          "destination": [
            "unpack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            0
          ],
          "destination": [
            "trig",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            1
          ],
          "destination": [
            "set",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "set",
            0
          ],
          "destination": [
            "play",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            0
          ],
          "destination": [
            "startstore",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            1
          ],
          "destination": [
            "startstore",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            2
          ],
          "destination": [
            "pack",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            3
          ],
          "destination": [
            "pack",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pack",
            0
          ],
          "destination": [
            "start",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "start",
            0
          ],
          "destination": [
            "play",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            4
          ],
          "destination": [
            "l",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            4
          ],
          "destination": [
            "r",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "play",
            0
          ],
          "destination": [
            "l",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "startstore",
            0
          ],
          "destination": [
            "pack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            5
          ],
          "destination": [
            "rightselect",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "play",
            0
          ],
          "destination": [
            "rightselect",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "play",
            1
          ],
          "destination": [
            "rightselect",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "rightselect",
            0
          ],
          "destination": [
            "r",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            3
          ],
          "destination": [
            "envtime",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "envtime",
            0
          ],
          "destination": [
            "envmsg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "envmsg",
            0
          ],
          "destination": [
            "env",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "env",
            0
          ],
          "destination": [
            "fadeleft",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "env",
            0
          ],
          "destination": [
            "faderight",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "l",
            0
          ],
          "destination": [
            "fadeleft",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "r",
            0
          ],
          "destination": [
            "faderight",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            6
          ],
          "destination": [
            "panleft",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "unpack",
            6
          ],
          "destination": [
            "panright",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "panleft",
            0
          ],
          "destination": [
            "panleftsig",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "panright",
            0
          ],
          "destination": [
            "panrightsig",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fadeleft",
            0
          ],
          "destination": [
            "panleftsig",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "faderight",
            0
          ],
          "destination": [
            "panrightsig",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "panleftsig",
            0
          ],
          "destination": [
            "ol",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "panrightsig",
            0
          ],
          "destination": [
            "or",
            0
          ]
        }
      }
    ]
  }
}
