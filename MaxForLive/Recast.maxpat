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
    "openinpresentation": 1,
    "boxes": [
      {
        "box": {
          "id": "title",
          "maxclass": "comment",
          "patching_rect": [
            20,
            20,
            195,
            40
          ],
          "text": "RECAST",
          "presentation": 1,
          "presentation_rect": [
            12,
            10,
            176,
            27
          ],
          "fontsize": 18,
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "launch",
          "maxclass": "live.text",
          "patching_rect": [
            440,
            20,
            195,
            40
          ],
          "presentation": 1,
          "presentation_rect": [
            12,
            48,
            176,
            30
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "text": "Open instrument",
          "texton": "Open instrument",
          "mode": 0,
          "parameter_enable": 1,
          "varname": "launch",
          "parameter_mappable": 0,
          "hint": "Open the Recast instrument window",
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Open Recast",
              "parameter_shortname": "Open",
              "parameter_type": 2,
              "parameter_enum": [
                "Closed",
                "Open"
              ],
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ],
              "parameter_invisible": 0
            }
          }
        }
      },
      {
        "box": {
          "id": "editor",
          "maxclass": "newobj",
          "patching_rect": [
            650,
            20,
            195,
            40
          ],
          "text": "p Recast",
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
              1080,
              880
            ],
            "openinpresentation": 1,
            "boxes": [
              {
                "box": {
                  "id": "ui",
                  "maxclass": "jsui",
                  "patching_rect": [
                    0,
                    0,
                    1080,
                    880
                  ],
                  "filename": "recast-native.js",
                  "jsarguments": [],
                  "presentation": 1,
                  "presentation_rect": [
                    0,
                    0,
                    1080,
                    880
                  ],
                  "numinlets": 1,
                  "numoutlets": 1,
                  "parameter_enable": 0,
                  "varname": "RecastState"
                }
              },
              {
                "box": {
                  "id": "in",
                  "maxclass": "inlet",
                  "patching_rect": [
                    0,
                    750,
                    30,
                    30
                  ],
                  "numinlets": 0,
                  "numoutlets": 1
                }
              },
              {
                "box": {
                  "id": "out",
                  "maxclass": "outlet",
                  "patching_rect": [
                    50,
                    900,
                    30,
                    30
                  ],
                  "numinlets": 1,
                  "numoutlets": 0
                }
              },
              {
                "box": {
                  "id": "stateStore",
                  "maxclass": "newobj",
                  "text": "pattr recastSession",
                  "patching_rect": [
                    300,
                    920,
                    400,
                    22
                  ],
                  "saved_attribute_attributes": {
                    "valueof": {
                      "parameter_steps": 0,
                      "parameter_exponent": 1.0,
                      "parameter_invisible": 1,
                      "parameter_unitstyle": 10,
                      "parameter_annotation_name": "",
                      "parameter_mmax": 127.0,
                      "parameter_mmin": 0.0,
                      "parameter_type": 3,
                      "parameter_initial_enable": 0,
                      "parameter_shortname": "Session",
                      "parameter_modmax": 127.0,
                      "parameter_longname": "Recast session",
                      "parameter_modmin": 0.0,
                      "parameter_linknames": 0,
                      "parameter_modmode": 0,
                      "parameter_info": "",
                      "parameter_units": "",
                      "parameter_order": 0,
                      "parameter_defer": 0,
                      "parameter_speedlim": 0.0
                    }
                  },
                  "varname": "recastSession",
                  "saved_object_attributes": {
                    "parameter_enable": 1
                  },
                  "restore": [
                    "{}"
                  ]
                }
              },
              {
                "box": {
                  "id": "restorePrefix",
                  "maxclass": "newobj",
                  "text": "prepend restore",
                  "patching_rect": [
                    500,
                    920,
                    110,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropLoop",
                  "varname": "dropLoop",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    20,
                    48,
                    1040,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    48,
                    1040,
                    24
                  ],
                  "border": 1,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ],
                  "bordercolor": [
                    0.5,
                    0.6,
                    0.5,
                    1
                  ],
                  "hint": "Drop a WAV or AIFF loop here to start. Set its original BPM after loading."
                }
              },
              {
                "box": {
                  "id": "dropLoopMsg",
                  "maxclass": "newobj",
                  "text": "prepend drop 0",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad0",
                  "varname": "dropPad0",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    26,
                    408,
                    150,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    26,
                    408,
                    150,
                    24
                  ],
                  "border": 0,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad0Msg",
                  "maxclass": "newobj",
                  "text": "prepend drop 1",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad1",
                  "varname": "dropPad1",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    201,
                    408,
                    150,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    201,
                    408,
                    150,
                    24
                  ],
                  "border": 0,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad1Msg",
                  "maxclass": "newobj",
                  "text": "prepend drop 2",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad2",
                  "varname": "dropPad2",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    376,
                    408,
                    150,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    376,
                    408,
                    150,
                    24
                  ],
                  "border": 0,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad2Msg",
                  "maxclass": "newobj",
                  "text": "prepend drop 3",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad3",
                  "varname": "dropPad3",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    551,
                    408,
                    150,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    551,
                    408,
                    150,
                    24
                  ],
                  "border": 0,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad3Msg",
                  "maxclass": "newobj",
                  "text": "prepend drop 4",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad4",
                  "varname": "dropPad4",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    726,
                    408,
                    150,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    726,
                    408,
                    150,
                    24
                  ],
                  "border": 0,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad4Msg",
                  "maxclass": "newobj",
                  "text": "prepend drop 5",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad5",
                  "varname": "dropPad5",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    901,
                    408,
                    150,
                    24
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    901,
                    408,
                    150,
                    24
                  ],
                  "border": 0,
                  "hidden": 0,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropPad5Msg",
                  "maxclass": "newobj",
                  "text": "prepend drop 6",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropSound",
                  "varname": "dropSound",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    20,
                    240,
                    800,
                    30
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    240,
                    800,
                    30
                  ],
                  "border": 0,
                  "hidden": 1,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropSoundMsg",
                  "maxclass": "newobj",
                  "text": "prepend dropSound",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropTone",
                  "varname": "dropTone",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    20,
                    214,
                    800,
                    30
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    214,
                    800,
                    30
                  ],
                  "border": 0,
                  "hidden": 1,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "dropToneMsg",
                  "maxclass": "newobj",
                  "text": "prepend dropTone",
                  "patching_rect": [
                    20,
                    950,
                    160,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "librarySearch",
                  "varname": "librarySearch",
                  "maxclass": "textedit",
                  "patching_rect": [
                    180,
                    122,
                    850,
                    35
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    180,
                    122,
                    850,
                    35
                  ],
                  "hidden": 1,
                  "keymode": 1,
                  "outputmode": 1,
                  "lines": 1
                }
              },
              {
                "box": {
                  "id": "librarySearchMsg",
                  "maxclass": "newobj",
                  "text": "prepend libraryquery",
                  "patching_rect": [
                    100,
                    1000,
                    150,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "dropWave",
                  "varname": "dropWave",
                  "maxclass": "dropfile",
                  "patching_rect": [
                    20,
                    105,
                    1040,
                    100
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    20,
                    105,
                    1040,
                    100
                  ],
                  "border": 0,
                  "ignoreclick": 1,
                  "numinlets": 1,
                  "numoutlets": 2,
                  "outlettype": [
                    "",
                    ""
                  ],
                  "hint": "Drop a WAV or AIFF loop onto the waveform."
                }
              },
              {
                "box": {
                  "id": "instrumentTempo",
                  "varname": "instrumentTempo",
                  "maxclass": "flonum",
                  "patching_rect": [
                    57,
                    109,
                    78,
                    28
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    57,
                    109,
                    78,
                    28
                  ],
                  "minimum": 20.0,
                  "maximum": 300.0,
                  "format": 6,
                  "parameter_enable": 0
                }
              },
              {
                "box": {
                  "id": "instrumentTempoMsg",
                  "maxclass": "newobj",
                  "text": "prepend instrumentbpm",
                  "patching_rect": [
                    57,
                    950,
                    150,
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
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "ui",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "stateStore",
                    0
                  ],
                  "destination": [
                    "restorePrefix",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "restorePrefix",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropLoop",
                    0
                  ],
                  "destination": [
                    "dropLoopMsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropLoopMsg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad0",
                    0
                  ],
                  "destination": [
                    "dropPad0Msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad0Msg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad1",
                    0
                  ],
                  "destination": [
                    "dropPad1Msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad1Msg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad2",
                    0
                  ],
                  "destination": [
                    "dropPad2Msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad2Msg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad3",
                    0
                  ],
                  "destination": [
                    "dropPad3Msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad3Msg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad4",
                    0
                  ],
                  "destination": [
                    "dropPad4Msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad4Msg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad5",
                    0
                  ],
                  "destination": [
                    "dropPad5Msg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropPad5Msg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropSound",
                    0
                  ],
                  "destination": [
                    "dropSoundMsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropSoundMsg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropTone",
                    0
                  ],
                  "destination": [
                    "dropToneMsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropToneMsg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "librarySearch",
                    0
                  ],
                  "destination": [
                    "librarySearchMsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "librarySearchMsg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "dropWave",
                    0
                  ],
                  "destination": [
                    "dropLoopMsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "instrumentTempo",
                    0
                  ],
                  "destination": [
                    "instrumentTempoMsg",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "instrumentTempoMsg",
                    0
                  ],
                  "destination": [
                    "ui",
                    0
                  ]
                }
              }
            ],
            "openrect": [
              60,
              60,
              1140,
              940
            ],
            "locked": 1
          },
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "openmsg",
          "maxclass": "message",
          "patching_rect": [
            860,
            20,
            195,
            40
          ],
          "text": "open",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "pc",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            85,
            195,
            40
          ],
          "text": "pcontrol",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "route",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            85,
            195,
            40
          ],
          "text": "route choose save open folder voice stop status bounce stopvoice metro",
          "numinlets": 1,
          "numoutlets": 9
        }
      },
      {
        "box": {
          "id": "choose",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            85,
            195,
            40
          ],
          "text": "opendialog",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "chooseout",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            150,
            195,
            40
          ],
          "text": "prepend file",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "save",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            150,
            195,
            40
          ],
          "text": "savedialog",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "saveout",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            150,
            195,
            40
          ],
          "text": "prepend saved",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "open",
          "maxclass": "newobj",
          "patching_rect": [
            650,
            150,
            195,
            40
          ],
          "text": "opendialog",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "openout",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            150,
            195,
            40
          ],
          "text": "prepend opened",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "folder",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            215,
            195,
            40
          ],
          "text": "opendialog fold",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "folderout",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            215,
            195,
            40
          ],
          "text": "prepend exportfolder",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b0",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            215,
            195,
            40
          ],
          "text": "buffer~ #0-b0",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer0"
        }
      },
      {
        "box": {
          "id": "loaded0",
          "maxclass": "message",
          "patching_rect": [
            650,
            215,
            195,
            40
          ],
          "text": "loaded 0",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b1",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            215,
            195,
            40
          ],
          "text": "buffer~ #0-b1",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer1"
        }
      },
      {
        "box": {
          "id": "loaded1",
          "maxclass": "message",
          "patching_rect": [
            20,
            280,
            195,
            40
          ],
          "text": "loaded 1",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b2",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            280,
            195,
            40
          ],
          "text": "buffer~ #0-b2",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer2"
        }
      },
      {
        "box": {
          "id": "loaded2",
          "maxclass": "message",
          "patching_rect": [
            440,
            280,
            195,
            40
          ],
          "text": "loaded 2",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b3",
          "maxclass": "newobj",
          "patching_rect": [
            650,
            280,
            195,
            40
          ],
          "text": "buffer~ #0-b3",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer3"
        }
      },
      {
        "box": {
          "id": "loaded3",
          "maxclass": "message",
          "patching_rect": [
            860,
            280,
            195,
            40
          ],
          "text": "loaded 3",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b4",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            345,
            195,
            40
          ],
          "text": "buffer~ #0-b4",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer4"
        }
      },
      {
        "box": {
          "id": "loaded4",
          "maxclass": "message",
          "patching_rect": [
            230,
            345,
            195,
            40
          ],
          "text": "loaded 4",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b5",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            345,
            195,
            40
          ],
          "text": "buffer~ #0-b5",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer5"
        }
      },
      {
        "box": {
          "id": "loaded5",
          "maxclass": "message",
          "patching_rect": [
            650,
            345,
            195,
            40
          ],
          "text": "loaded 5",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "b6",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            345,
            195,
            40
          ],
          "text": "buffer~ #0-b6",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastbuffer6"
        }
      },
      {
        "box": {
          "id": "loaded6",
          "maxclass": "message",
          "patching_rect": [
            20,
            410,
            195,
            40
          ],
          "text": "loaded 6",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "voice",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            410,
            195,
            40
          ],
          "text": "poly~ recast-voice 33",
          "numinlets": 1,
          "numoutlets": 2,
          "varname": "recastVoices"
        }
      },
      {
        "box": {
          "id": "dispatch",
          "maxclass": "message",
          "patching_rect": [
            440,
            410,
            195,
            40
          ],
          "text": "target $1, $2 $3 $4 $5 $6 $7 $8",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "stop",
          "maxclass": "message",
          "patching_rect": [
            650,
            410,
            195,
            40
          ],
          "text": "target 0, stop",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "out",
          "maxclass": "newobj",
          "patching_rect": [
            860,
            410,
            195,
            40
          ],
          "text": "plugout~",
          "numinlets": 2,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "note",
          "maxclass": "newobj",
          "patching_rect": [
            20,
            475,
            195,
            40
          ],
          "text": "notein",
          "numinlets": 1,
          "numoutlets": 2
        }
      },
      {
        "box": {
          "id": "np",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            475,
            195,
            40
          ],
          "text": "pack 0 0",
          "numinlets": 2,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "mid",
          "maxclass": "newobj",
          "patching_rect": [
            440,
            475,
            195,
            40
          ],
          "text": "prepend midin",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "ready",
          "maxclass": "newobj",
          "patching_rect": [
            650,
            475,
            195,
            40
          ],
          "text": "live.thisdevice",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "init",
          "maxclass": "message",
          "patching_rect": [
            860,
            475,
            195,
            40
          ],
          "text": "loadbang",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "status",
          "maxclass": "comment",
          "patching_rect": [
            20,
            540,
            195,
            40
          ],
          "text": "Generate \u2022 reshape \u2022 resample",
          "presentation": 1,
          "presentation_rect": [
            12,
            91,
            176,
            63
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "fontsize": 10
        }
      },
      {
        "box": {
          "id": "statusset",
          "maxclass": "newobj",
          "patching_rect": [
            230,
            540,
            195,
            40
          ],
          "text": "prepend set",
          "numinlets": 1,
          "numoutlets": 1
        }
      },
      {
        "box": {
          "id": "bounce",
          "maxclass": "newobj",
          "text": "savedialog",
          "patching_rect": [
            20,
            800,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "id": "bounceout",
          "maxclass": "newobj",
          "text": "prepend bounced",
          "patching_rect": [
            200,
            800,
            150,
            22
          ]
        }
      },
      {
        "box": {
          "id": "kitVoiceStop",
          "maxclass": "message",
          "text": "target $1, stop",
          "patching_rect": [
            900,
            640,
            120,
            22
          ]
        }
      },
      {
        "box": {
          "id": "launchRoute",
          "maxclass": "newobj",
          "text": "route bang",
          "patching_rect": [
            440,
            75,
            80,
            22
          ]
        }
      },
      {
        "box": {
          "id": "launchOne",
          "maxclass": "newobj",
          "text": "sel 1",
          "patching_rect": [
            530,
            75,
            55,
            22
          ]
        }
      },
      {
        "box": {
          "id": "voicePad",
          "maxclass": "newobj",
          "text": "append 0.",
          "patching_rect": [
            300,
            700,
            180,
            22
          ]
        }
      },
      {
        "box": {
          "id": "outputDynamics",
          "maxclass": "newobj",
          "text": "gen~",
          "varname": "recastOutputDynamics",
          "numinlets": 2,
          "numoutlets": 2,
          "outlettype": [
            "signal",
            "signal"
          ],
          "patching_rect": [
            450,
            800,
            90,
            22
          ],
          "patcher": {
            "fileversion": 1,
            "classnamespace": "dsp.gen",
            "rect": [
              80,
              80,
              720,
              600
            ],
            "boxes": [
              {
                "box": {
                  "id": "in1",
                  "maxclass": "newobj",
                  "text": "in 1",
                  "patching_rect": [
                    20,
                    20,
                    180,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "in2",
                  "maxclass": "newobj",
                  "text": "in 2",
                  "patching_rect": [
                    220,
                    20,
                    180,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "compress",
                  "maxclass": "codebox",
                  "code": "Param enabled(0);\nParam thresholdDb(-12);\nParam ratio(3);\nParam attackMs(10);\nParam releaseMs(120);\nParam makeupDb(0);\nHistory detector(0);\np = max(abs(in1), abs(in2));\na = exp(-1 / (max(0.1, attackMs) * 0.001 * samplerate));\nr = exp(-1 / (max(1, releaseMs) * 0.001 * samplerate));\nk = p > detector ? a : r;\nnextDetector = p + (detector - p) * k;\ndetector = nextDetector;\nlevelDb = 20 * log(max(0.000000001, nextDetector)) / log(10);\nreductionDb = max(0, levelDb - thresholdDb) * (1 - 1 / max(1, ratio));\ngain = enabled > 0.5 ? pow(10, (makeupDb - reductionDb) / 20) : 1;\nout1 = in1 * gain;\nout2 = in2 * gain;",
                  "numinlets": 2,
                  "numoutlets": 2,
                  "outlettype": [
                    "signal",
                    "signal"
                  ],
                  "patching_rect": [
                    20,
                    70,
                    640,
                    400
                  ]
                }
              },
              {
                "box": {
                  "id": "out1",
                  "maxclass": "newobj",
                  "text": "out 1",
                  "patching_rect": [
                    20,
                    500,
                    180,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "out2",
                  "maxclass": "newobj",
                  "text": "out 2",
                  "patching_rect": [
                    220,
                    500,
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
                    "in1",
                    0
                  ],
                  "destination": [
                    "compress",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "in2",
                    0
                  ],
                  "destination": [
                    "compress",
                    1
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "compress",
                    0
                  ],
                  "destination": [
                    "out1",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "compress",
                    1
                  ],
                  "destination": [
                    "out2",
                    0
                  ]
                }
              }
            ]
          }
        }
      },
      {
        "box": {
          "id": "metroUnpack",
          "maxclass": "newobj",
          "text": "unpack f f",
          "patching_rect": [
            800,
            700,
            190,
            22
          ]
        }
      },
      {
        "box": {
          "id": "metroEnvelope",
          "maxclass": "message",
          "text": "0, $1 1 0 28",
          "patching_rect": [
            800,
            740,
            190,
            22
          ]
        }
      },
      {
        "box": {
          "id": "metroLine",
          "maxclass": "newobj",
          "text": "line~",
          "patching_rect": [
            800,
            780,
            190,
            22
          ]
        }
      },
      {
        "box": {
          "id": "metroOscillator",
          "maxclass": "newobj",
          "text": "cycle~ 1000",
          "patching_rect": [
            1020,
            740,
            190,
            22
          ]
        }
      },
      {
        "box": {
          "id": "metroMultiply",
          "maxclass": "newobj",
          "text": "*~",
          "patching_rect": [
            1020,
            800,
            190,
            22
          ]
        }
      },
      {
        "box": {
          "id": "metroZero",
          "maxclass": "message",
          "text": "0",
          "patching_rect": [
            800,
            820,
            190,
            22
          ]
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "openmsg",
            0
          ],
          "destination": [
            "pc",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pc",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "editor",
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
            "choose",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "choose",
            0
          ],
          "destination": [
            "chooseout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "chooseout",
            0
          ],
          "destination": [
            "editor",
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
            "save",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "save",
            0
          ],
          "destination": [
            "saveout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "saveout",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            2
          ],
          "destination": [
            "open",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "open",
            0
          ],
          "destination": [
            "openout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "openout",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            3
          ],
          "destination": [
            "folder",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "folder",
            0
          ],
          "destination": [
            "folderout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "folderout",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b0",
            1
          ],
          "destination": [
            "loaded0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded0",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b1",
            1
          ],
          "destination": [
            "loaded1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded1",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b2",
            1
          ],
          "destination": [
            "loaded2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded2",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b3",
            1
          ],
          "destination": [
            "loaded3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded3",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b4",
            1
          ],
          "destination": [
            "loaded4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded4",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b5",
            1
          ],
          "destination": [
            "loaded5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded5",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "b6",
            1
          ],
          "destination": [
            "loaded6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loaded6",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "dispatch",
            0
          ],
          "destination": [
            "voice",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            5
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
            "voice",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "note",
            0
          ],
          "destination": [
            "np",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "note",
            1
          ],
          "destination": [
            "np",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "np",
            0
          ],
          "destination": [
            "mid",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mid",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ready",
            0
          ],
          "destination": [
            "init",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "init",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            6
          ],
          "destination": [
            "statusset",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "statusset",
            0
          ],
          "destination": [
            "status",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            7
          ],
          "destination": [
            "bounce",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "bounce",
            0
          ],
          "destination": [
            "bounceout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "bounceout",
            0
          ],
          "destination": [
            "editor",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            8
          ],
          "destination": [
            "kitVoiceStop",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "kitVoiceStop",
            0
          ],
          "destination": [
            "voice",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "launch",
            0
          ],
          "destination": [
            "launchRoute",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "launchRoute",
            0
          ],
          "destination": [
            "openmsg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "launchRoute",
            1
          ],
          "destination": [
            "launchOne",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "launchOne",
            0
          ],
          "destination": [
            "openmsg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            4
          ],
          "destination": [
            "voicePad",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "voicePad",
            0
          ],
          "destination": [
            "dispatch",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "voice",
            0
          ],
          "destination": [
            "outputDynamics",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "voice",
            1
          ],
          "destination": [
            "outputDynamics",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "outputDynamics",
            0
          ],
          "destination": [
            "out",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "outputDynamics",
            1
          ],
          "destination": [
            "out",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            9
          ],
          "destination": [
            "metroUnpack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroUnpack",
            0
          ],
          "destination": [
            "metroEnvelope",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroUnpack",
            1
          ],
          "destination": [
            "metroOscillator",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroEnvelope",
            0
          ],
          "destination": [
            "metroLine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroLine",
            0
          ],
          "destination": [
            "metroMultiply",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroOscillator",
            0
          ],
          "destination": [
            "metroMultiply",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroMultiply",
            0
          ],
          "destination": [
            "out",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroMultiply",
            0
          ],
          "destination": [
            "out",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            5
          ],
          "destination": [
            "metroZero",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "metroZero",
            0
          ],
          "destination": [
            "metroLine",
            0
          ]
        }
      }
    ],
    "openrect": [
      0,
      0,
      200,
      169
    ],
    "devicewidth": 200,
    "dependency_cache": [
      {
        "name": "recast-native.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-voice.maxpat",
        "type": "JSON",
        "implicit": 1
      },
      {
        "name": "recast-workbench.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-tones.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-instability.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-ideas.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-articulation.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-phrases.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-tools.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-regions.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-finish.js",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "recast-explore.js",
        "type": "TEXT",
        "implicit": 1
      }
    ],
    "parameters": {
      "editor::stateStore": [
        "Recast session",
        "Session",
        0
      ],
      "launch": [
        "Open Recast",
        "Open",
        0
      ]
    }
  }
}
