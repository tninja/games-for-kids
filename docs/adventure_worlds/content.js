export const worlds = [
  {
    "id": "dragon",
    "title": "Dragon Kingdom",
    "zh": "龙族世界",
    "icon": "🐉",
    "color": "#934c58",
    "subtitle": "The stolen moon lantern",
    "reward": "Moon Dragon Egg",
    "trophy": "🥚",
    "scenes": [
      [
        "Breakfast disaster",
        "🍎",
        "A talking dragon egg rolls into the kitchen. Spicy whispers, ‘Please don't let me cook. Last time I set water on fire.’ The egg speaks:",
        "我|wǒ/饿|è/了|le/，|/不|bù/渴|kě/。|/我|wǒ/不|bù/吃鱼|chī yú/。|",
        "I'm hungry, not thirsty. I don't eat fish.",
        [
          [
            "给|gěi/它|tā/苹果|píng guǒ",
            "Give it an apple",
            "The egg burps a tiny rainbow. ‘Excellent service!’",
            true
          ],
          [
            "给|gěi/它|tā/鱼|yú",
            "Give it fish",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "给|gěi/它|tā/水|shuǐ",
            "Give it water",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The wobbly bridge",
        "🌉",
        "The egg hatches into a tiny dragon named Noodle. At a bridge, Noodle points to a hiding place.",
        "钥匙|yào shi/不在|bú zài/右边|yòu biān/，|/也|yě/不在|bú zài/水里|shuǐ lǐ/。|",
        "The key is not on the right or in the water.",
        [
          [
            "走|zǒu/另一边|lìng yì biān",
            "Go to the other side",
            "You find a silver key under a leaf.",
            true
          ],
          [
            "去|qù/右边|yòu biān",
            "Go right",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "去|qù/水里|shuǐ lǐ",
            "Go into the water",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Two doors",
        "🏰",
        "Your key opens the castle courtyard. Two colorful doors stand before you. A sign says:",
        "红门|hóng mén/后面|hòu miàn/有|yǒu/火|huǒ/。|/蓝门|lán mén/没有|méi yǒu/火|huǒ/。|",
        "There is fire behind the red door. There is no fire behind the blue door.",
        [
          [
            "关|guān/红门|hóng mén/，|/开|kāi/蓝门|lán mén",
            "Keep red closed, open blue",
            "You find a map to a lost moon egg.",
            true
          ],
          [
            "关|guān/蓝门|lán mén/，|/开|kāi/红门|hóng mén",
            "Keep blue closed, open red",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "红门|hóng mén/蓝门|lán mén/都|dōu/开|kāi",
            "Open both red and blue",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The moon egg",
        "🌙",
        "A sleepy dragon guards the moon egg. The queen leaves instructions. The guard is holding an empty cup.",
        "小龙|xiǎo lóng/喝水|hē shuǐ/以后|yǐ hòu/才|cái/给|gěi/我们|wǒ men/蛋|dàn/。|",
        "Only after drinking will the dragon give us the egg.",
        [
          [
            "先|xiān/给水|gěi shuǐ/再|zài/拿蛋|ná dàn",
            "Give water, then take the egg",
            "You give it water and then take the egg. The queen awards you a Moon Dragon Egg!",
            true
          ],
          [
            "先|xiān/拿蛋|ná dàn/再|zài/给水|gěi shuǐ",
            "Take the egg, then give water",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "拿蛋|ná dàn/，|/不给水|bù gěi shuǐ",
            "Take the egg without giving water",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The singing egg",
        "🎵",
        "At midnight the egg sings so loudly that the castle windows dance. A message appears: the moon lantern has vanished! Noodle follows a glowing feather to two paths.",
        "大路|dà lù/有人|yǒu rén/挡着|dǎng zhe/。|/小路|xiǎo lù/没人|méi rén/。|",
        "People block the main road. Nobody is on the small path.",
        [
          [
            "不走|bù zǒu/大路|dà lù/，|/走|zǒu/小路|xiǎo lù",
            "Avoid the main road; take the small path",
            "The feather glows and leads toward the mountain.",
            true
          ],
          [
            "不走|bù zǒu/小路|xiǎo lù/，|/走|zǒu/大路|dà lù",
            "Avoid the small path; take the main road",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "两条|liǎng tiáo/路|lù/都|dōu/不走|bù zǒu",
            "Take neither path",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The cold ice dragon",
        "🧣",
        "An ice dragon shivers under seven blankets. ‘I am a dragon, not a refrigerator!’ She saw the thief fly past.",
        "我|wǒ/很|hěn/冷|lěng/。|/我|wǒ/想|xiǎng/喝|hē/暖暖|nuǎn nuǎn/的|de/东西|dōng xi/。|",
        "I'm cold. I want a warm drink.",
        [
          [
            "给|gěi/她|tā/热水|rè shuǐ",
            "Give her hot water",
            "She warms up and reveals a secret tunnel.",
            true
          ],
          [
            "给|gěi/她|tā/冷茶|lěng chá",
            "Give her cold tea",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "给|gěi/她|tā/冰水|bīng shuǐ",
            "Give her ice water",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Three tunnels",
        "🪶",
        "The feather floats above three tunnels. A talking sign whispers a direction. Noodle puts on a very small detective hat.",
        "左边|zuǒ biān/走|zǒu/不通|bù tōng/。|/右边|yòu biān/也|yě/走|zǒu/不通|bù tōng/。|",
        "The left path is blocked. The right is blocked too.",
        [
          [
            "走|zǒu/中间|zhōng jiān",
            "Take the middle",
            "A passage opens into a cloud palace.",
            true
          ],
          [
            "走|zǒu/左边|zuǒ biān",
            "Take the left",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "走|zǒu/右边|yòu biān",
            "Take the right",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Dragon in a jar",
        "☁️",
        "A tiny cloud dragon is trapped in a jar. ‘I have never met a dragon in a pickle jar,’ says Noodle.",
        "瓶子|píng zi/里|lǐ/有|yǒu/小龙|xiǎo lóng/。|/它|tā/出不来|chū bu lái/。|",
        "A little dragon is in the jar. It can't get out.",
        [
          [
            "拿掉|ná diào/瓶盖|píng gài",
            "Remove the lid",
            "The freed dragon gives you a cloud compass pointing to a secret library.",
            true
          ],
          [
            "把|bǎ/瓶盖|píng gài/关紧|guān jǐn",
            "Tighten the lid",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "把|bǎ/瓶子|píng zi/摇一摇|yáo yi yáo",
            "Shake the jar",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Upside-down library",
        "📚",
        "The librarian insists books are best read upside down. Noodle tries and falls off a chair. A magic map is hidden in a book.",
        "红书|hóng shū/里|lǐ/只有|zhǐ yǒu/笑话|xiào hua/。|/没有|méi yǒu/地图|dì tú/。|",
        "The red book has only jokes. It has no map.",
        [
          [
            "翻开|fān kāi/另一本|lìng yì běn/书|shū",
            "Open the other book",
            "The map unfolds into a paper staircase to a tower.",
            true
          ],
          [
            "再|zài/看|kàn/红书|hóng shū",
            "Read the red book again",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "看|kàn/桌下|zhuō xià",
            "Look under the table",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Tower of shadows",
        "🗼",
        "A shadow dragon guards a dark tower. It will help if you light the working lamp. Something inside the tower is crying.",
        "右边|yòu biān/的|de/灯|dēng/坏|huài/了|le/。|/左边|zuǒ biān/的|de/灯|dēng/没坏|méi huài/。|",
        "The right lamp is broken; the left lamp isn't.",
        [
          [
            "开|kāi/左灯|zuǒ dēng/，|/不开|bù kāi/右灯|yòu dēng",
            "Light left, not right",
            "A frightened baby bird appears holding the missing lantern.",
            true
          ],
          [
            "开|kāi/右灯|yòu dēng/，|/不开|bù kāi/左灯|zuǒ dēng",
            "Light right, not left",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "左灯|zuǒ dēng/右灯|yòu dēng/都|dōu/不开|bù kāi",
            "Light neither lamp",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The little thief",
        "🐦",
        "The bird took the lantern because its nest was dark. Noodle wants to help, not fight.",
        "小鸟|xiǎo niǎo/的|de/家|jiā/太|tài/黑|hēi/了|le/。|",
        "The bird's home is too dark.",
        [
          [
            "给|gěi/它|tā/一盏|yì zhǎn/小灯|xiǎo dēng",
            "Give it a small lamp",
            "You make a glowing nest light. The bird returns the lantern.",
            true
          ],
          [
            "把|bǎ/它|tā/的|de/家|jiā/弄得|nòng de/更黑|gèng hēi",
            "Make its home darker",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "给|gěi/它|tā/钱|qián",
            "Give it money",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Moon festival",
        "🏮",
        "The queen invites everyone to a festival. Noodle has baked a cake shaped like a potato. One last task will bring back the moonlight.",
        "月亮|yuè liang/不亮|bú liàng/。|/塔上|tǎ shàng/也|yě/没有|méi yǒu/灯|dēng/。|",
        "The moon is dark. There is no lamp on the tower either.",
        [
          [
            "先|xiān/上塔|shàng tǎ/，|/再|zài/吃蛋糕|chī dàn gāo",
            "Go up the tower before eating cake",
            "Moonlight returns! You become Guardian of the Moon.",
            true
          ],
          [
            "先|xiān/吃蛋糕|chī dàn gāo/，|/再|zài/上塔|shàng tǎ",
            "Eat cake before going up the tower",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "把|bǎ/灯|dēng/留在|liú zài/桌上|zhuō shàng",
            "Leave the lamp on the table",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ]
    ]
  },
  {
    "id": "mystery",
    "title": "Monster Mystery",
    "zh": "怪兽小镇",
    "icon": "👾",
    "color": "#7853a7",
    "subtitle": "The runaway school bell",
    "reward": "Monster Detective Notebook",
    "trophy": "📓",
    "scenes": [
      [
        "The empty lunch boxes",
        "🎒",
        "Everyone's lunch is missing! Detective Pip finds a note from the lunch lady.",
        "桌子|zhuō zi/上面|shàng miàn/很|hěn/安静|ān jìng/。|/下面|xià miàn/有|yǒu/声音|shēng yīn/。|",
        "It is quiet on the table; there's a sound underneath.",
        [
          [
            "弯腰|wān yāo/看看|kàn kan",
            "Bend down and look",
            "You find crumbs and a purple footprint.",
            true
          ],
          [
            "站起来|zhàn qǐ lai/看|kàn/桌面|zhuō miàn",
            "Stand up and look at the tabletop",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "去|qù/门后|mén hòu/看看|kàn kan",
            "Look behind the door",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The sock suspect",
        "🧦",
        "A walking sock pile blocks the hall. Pip opens the monster notebook.",
        "袜子|wà zi/让|ràng/它|tā/变大|biàn dà/。|/水|shuǐ/让|ràng/它|tā/跑开|pǎo kāi/。|",
        "Socks make it bigger. Water makes it run away.",
        [
          [
            "拿走|ná zǒu/袜子|wà zi/，|/给|gěi/水|shuǐ",
            "Take away socks and offer water",
            "It squeaks and runs away. A trail leads to the gym!",
            true
          ],
          [
            "拿走|ná zǒu/水|shuǐ/，|/给|gěi/袜子|wà zi",
            "Take away water and offer socks",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "水|shuǐ/和|hé/袜子|wà zi/都|dōu/拿走|ná zǒu",
            "Take away both water and socks",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Two lockers",
        "🔎",
        "Two lockers stand in the gym. One makes suspicious chewing noises. A note says:",
        "大门|dà mén/后面|hòu miàn/没有|méi yǒu/声音|shēng yīn/。|/小门|xiǎo mén/有|yǒu/。|",
        "There is no sound behind the big door. There is behind the small door.",
        [
          [
            "开|kāi/有|yǒu/声音|shēng yīn/的|de/门|mén",
            "Open the door with the sound",
            "You find a lunch monster with a gigantic sandwich!",
            true
          ],
          [
            "开|kāi/没有|méi yǒu/声音|shēng yīn/的|de/门|mén",
            "Open the door without sound",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "把|bǎ/两扇|liǎng shàn/门|mén/都|dōu/关上|guān shàng",
            "Close both doors",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A lunch treaty",
        "🥪",
        "The monster is just hungry. The lunch lady offers a deal.",
        "怪兽|guài shòu/要|yào/还|huán/东西|dōng xi/以后|yǐ hòu/才能|cái néng/吃|chī/苹果|píng guǒ/。|",
        "The monster may eat an apple only after returning the things.",
        [
          [
            "先|xiān/还午饭|huán wǔ fàn/再|zài/吃苹果|chī píng guǒ",
            "Return lunch, then eat an apple",
            "The monster returns the lunches, gets its apple, and you earn a detective notebook.",
            true
          ],
          [
            "先|xiān/吃苹果|chī píng guǒ/再|zài/还午饭|huán wǔ fàn",
            "Eat the apple, then return lunch",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "吃苹果|chī píng guǒ/，|/不还|bù huán/午饭|wǔ fàn",
            "Eat the apple without returning lunch",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A new case",
        "📓",
        "Your notebook writes by itself: THE SCHOOL BELL IS MISSING. Pip suspects the math teacher because she likes homework. A crumb-covered note points to a room.",
        "教室|jiào shì/没有|méi yǒu/脚印|jiǎo yìn/。|/厨房|chú fáng/有|yǒu/。|",
        "There are no footprints in the classroom. There are some in the kitchen.",
        [
          [
            "去|qù/做饭|zuò fàn/的|de/房间|fáng jiān",
            "Go to the room where food is cooked",
            "Crumbs lead to a talking refrigerator.",
            true
          ],
          [
            "去|qù/教室|jiào shì",
            "Go to the classroom",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "去|qù/操场|cāo chǎng",
            "Go to the playground",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Talking fridge",
        "🧊",
        "The fridge promises a clue if you fill its empty shelf. It complains that somebody stole its breakfast.",
        "我|wǒ/想|xiǎng/喝|hē/白色|bái sè/的|de/东西|dōng xi/。|",
        "I want to drink something white.",
        [
          [
            "给|gěi/它|tā/牛奶|niú nǎi",
            "Give it milk",
            "The fridge saw the bell roll away on two feet.",
            true
          ],
          [
            "给|gěi/它|tā/果汁|guǒ zhī",
            "Give it juice",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "给|gěi/它|tā/袜子|wà zi",
            "Give it socks",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Triangle footprints",
        "👣",
        "Strange footprints lead to two doors. Pip tries to measure them with a banana. Your notebook offers a clue.",
        "脚印|jiǎo yìn/有|yǒu/三个|sān ge/角|jiǎo/。|",
        "The footprint has three corners.",
        [
          [
            "找|zhǎo/三角形|sān jiǎo xíng/门|mén",
            "Find the triangle door",
            "You discover a monster clubhouse.",
            true
          ],
          [
            "找|zhǎo/四角|sì jiǎo/的|de/门|mén",
            "Find the four-corner door",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "找|zhǎo/没有|méi yǒu/角|jiǎo/的|de/门|mén",
            "Find the door with no corners",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The sneeze monster",
        "🤧",
        "A sneeze monster guards a box. Each sneeze sends Pip's hat flying. It asks for help.",
        "它|tā/的|de/鼻子|bí zi/不舒服|bù shū fu/。|/它|tā/要|yào/擦|cā/鼻子|bí zi/。|",
        "Its nose feels uncomfortable. It needs to wipe its nose.",
        [
          [
            "给|gěi/它|tā/纸巾|zhǐ jīn",
            "Give it a tissue",
            "It gives you a magnifying glass and a key to a secret elevator.",
            true
          ],
          [
            "给|gěi/它|tā/胡椒|hú jiāo",
            "Give it pepper",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "给|gěi/它|tā/袜子|wà zi",
            "Give it socks",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Underground party",
        "🍜",
        "Below the school, monsters are setting up a concert. The bell is hiding near a table.",
        "桌下|zhuō xià/只有|zhǐ yǒu/蜘蛛|zhī zhū/。|/铃|líng/和|hé/盘子|pán zi/在一起|zài yì qǐ/。|",
        "Only a spider is under the table. The bell is with the plates.",
        [
          [
            "看看|kàn kan/桌面|zhuō miàn",
            "Check the tabletop",
            "A bell with tiny feet waves hello.",
            true
          ],
          [
            "看看|kàn kan/桌下|zhuō xià",
            "Check under the table",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "看看|kàn kan/门后|mén hòu",
            "Check behind the door",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The bell's secret",
        "🔔",
        "The bell ran away because it wants to perform music instead of ringing all day. It has written its own song.",
        "我|wǒ/想|xiǎng/让|ràng/大家|dà jiā/听|tīng/我的|wǒ de/歌|gē/。|",
        "I want everyone to hear my song.",
        [
          [
            "请|qǐng/它|tā/上台|shàng tái/唱歌|chàng gē",
            "Invite it on stage to sing",
            "The bell sings beautifully. Even Pip stops talking.",
            true
          ],
          [
            "请|qǐng/它|tā/回去|huí qu/响铃|xiǎng líng",
            "Send it back to ring the bell",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "不让|bú ràng/大家|dà jiā/听|tīng/它|tā",
            "Don't let anyone hear it",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A messy party",
        "🎈",
        "The principal is coming. The cake monster has eaten all the plates. The bell offers to return if you help tidy up.",
        "桌上|zhuō shàng/有|yǒu/垃圾|lā jī/。|/校长|xiào zhǎng/快|kuài/来|lái/了|le/。|",
        "There is trash on the table. The principal is coming soon.",
        [
          [
            "先|xiān/收拾|shōu shi/再|zài/回家|huí jiā",
            "Clean up, then go home",
            "Everyone helps; the cake monster returns the plates, washed.",
            true
          ],
          [
            "先|xiān/回家|huí jiā/再|zài/收拾|shōu shi",
            "Go home, then clean up",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "把|bǎ/垃圾|lā jī/留在|liú zài/桌上|zhuō shàng",
            "Leave the trash on the table",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The Friday concert",
        "🎤",
        "The principal loves the monster band and invites it to play every Friday. The bell finishes its first official song.",
        "铃|líng/唱完|chàng wán/了|le/。|/大家|dà jiā/想|xiǎng/用|yòng/双手|shuāng shǒu/说|shuō/谢谢|xiè xie/。|",
        "The bell finished singing. Everyone wants to say thanks with both hands.",
        [
          [
            "鼓掌|gǔ zhǎng",
            "Clap",
            "The principal stamps your notebook: Master Monster Detective!",
            true
          ],
          [
            "捂住|wǔ zhù/耳朵|ěr duo",
            "Cover your ears",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "把|bǎ/手|shǒu/放下|fàng xià",
            "Put your hands down",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ]
    ]
  },
  {
    "id": "creatures",
    "title": "Creature Trainers",
    "zh": "精灵大陆",
    "icon": "⚡",
    "color": "#227e72",
    "subtitle": "The Mountain League",
    "reward": "Thunder Fox Companion",
    "trophy": "🦊",
    "scenes": [
      [
        "The first companion",
        "🌿",
        "Three little creatures hide in the meadow. The trainer tells you which fox is electric.",
        "它|tā/有|yǒu/四条腿|sì tiáo tuǐ/，|/尾巴|wěi ba/像|xiàng/太阳|tài yáng/的|de/颜色|yán sè/。|",
        "It has four legs and a tail the color of the sun.",
        [
          [
            "找|zhǎo/黄色|huáng sè/狐狸|hú li",
            "Find the yellow fox",
            "A yellow fox jumps into your bag and sparks happily.",
            true
          ],
          [
            "找|zhǎo/黄色|huáng sè/小鸟|xiǎo niǎo",
            "Find the yellow bird",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "找|zhǎo/蓝色|lán sè/狐狸|hú li",
            "Find the blue fox",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Practice battle",
        "💧",
        "Thunder Fox meets a friendly water creature for a practice match. The trainer gives a clue.",
        "它|tā/喜欢|xǐ huan/水|shuǐ/，|/怕|pà/闪电|shǎn diàn/。|",
        "It likes water and fears lightning.",
        [
          [
            "不用|bú yòng/水|shuǐ/，|/用|yòng/闪电|shǎn diàn",
            "Skip water; use lightning",
            "A harmless practice spark wins the round.",
            true
          ],
          [
            "不用|bú yòng/闪电|shǎn diàn/，|/用|yòng/水|shuǐ",
            "Skip lightning; use water",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "水|shuǐ/和|hé/闪电|shǎn diàn/都|dōu/不用|bú yòng",
            "Use neither water nor lightning",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A tired teammate",
        "💚",
        "The fox is tired. The healer points at a sign.",
        "小狐狸|xiǎo hú li/眼睛|yǎn jing/都|dōu/睁不开|zhēng bu kāi/了|le/。|",
        "The fox can barely open its eyes.",
        [
          [
            "让|ràng/它|tā/睡一会儿|shuì yí huìr",
            "Let it sleep for a while",
            "It snores tiny sparks and wakes up refreshed.",
            true
          ],
          [
            "让|ràng/它|tā/继续|jì xù/跑|pǎo",
            "Make it keep running",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "让|ràng/它|tā/再|zài/打一场|dǎ yì chǎng",
            "Make it play another match",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Friendship trial",
        "🏅",
        "A little bird is stuck behind a gate. Thunder Fox can open it, but the trainer gives two instructions.",
        "小鸟|xiǎo niǎo/在|zài/门边|mén biān/。|/开门|kāi mén/会|huì/伤到|shāng dào/它|tā/。|",
        "The bird is beside the gate. Opening it will hurt the bird.",
        [
          [
            "先|xiān/移开|yí kāi/小鸟|xiǎo niǎo/再|zài/开门|kāi mén",
            "Move the bird away, then open the gate",
            "You shield the bird, then open the gate. Thunder Fox joins your team!",
            true
          ],
          [
            "先|xiān/开门|kāi mén/再|zài/移开|yí kāi/小鸟|xiǎo niǎo",
            "Open the gate, then move the bird away",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "开门|kāi mén/时|shí/让|ràng/小鸟|xiǎo niǎo/留在|liú zài/门边|mén biān",
            "Leave the bird beside the gate while opening",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A missing spark",
        "⚡",
        "Thunder Fox's tail stops glowing. The Mountain League's power crystal is missing! You set out before the tournament.",
        "水晶|shuǐ jīng/在|zài/高高|gāo gāo/的|de/地方|dì fang/，|/那里|nà lǐ/没有|méi yǒu/海|hǎi/。|",
        "The crystal is high up, where there is no sea.",
        [
          [
            "去|qù/山上|shān shàng",
            "Go up the mountain",
            "You meet a moss turtle who knows the way.",
            true
          ],
          [
            "去|qù/海边|hǎi biān",
            "Go to the beach",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "去|qù/商店|shāng diàn",
            "Go to the shop",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Hungry turtle",
        "🐢",
        "Moss Turtle will not move until lunch. Its belly sounds like a tiny drum.",
        "我|wǒ/要|yào/吃|chī/叶子|yè zi/，|/不要|bú yào/肉|ròu/。|",
        "I want to eat leaves, not meat.",
        [
          [
            "给|gěi/它|tā/青菜|qīng cài",
            "Give it vegetables",
            "Moss Turtle joins your team.",
            true
          ],
          [
            "给|gěi/它|tā/肉|ròu",
            "Give it meat",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "给|gěi/它|tā/石头|shí tou",
            "Give it rocks",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Rock challenge",
        "🪨",
        "A rock creature challenges you to a friendly match before opening the cave. Moss Turtle knows its weakness.",
        "火|huǒ/让|ràng/它|tā/暖和|nuǎn huo/。|/水|shuǐ/让|ràng/它|tā/变弱|biàn ruò/。|",
        "Fire warms it. Water weakens it.",
        [
          [
            "用|yòng/水|shuǐ/，|/不用|bú yòng/火|huǒ",
            "Use water, not fire",
            "Moss Turtle wins the practice match and the cave opens.",
            true
          ],
          [
            "用|yòng/火|huǒ/，|/不用|bú yòng/水|shuǐ",
            "Use fire, not water",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "水|shuǐ/和|hé/火|huǒ/都|dōu/不用|bú yòng",
            "Use neither water nor fire",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Crystal cave",
        "💎",
        "Crystals float over a pool. Thunder Fox's tail points at one, but its light is too weak to see clearly.",
        "水晶|shuǐ jīng/和|hé/树叶|shù yè/一样|yí yàng/颜色|yán sè/。|",
        "The crystal is the same color as leaves.",
        [
          [
            "拿|ná/绿色|lǜ sè/水晶|shuǐ jīng",
            "Take the green crystal",
            "Thunder Fox learns Spark Shield, and the team heads to the league.",
            true
          ],
          [
            "拿|ná/蓝色|lán sè/水晶|shuǐ jīng",
            "Take the blue crystal",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "拿|ná/红色|hóng sè/水晶|shuǐ jīng",
            "Take the red crystal",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Tournament sign-up",
        "🏟️",
        "The referee is a tiny bird with an enormous whistle. Thunder Fox cannot wait for the first match.",
        "名单|míng dān/上|shàng/没有|méi yǒu/你的|nǐ de/名字|míng zi/。|",
        "Your name isn't on the list.",
        [
          [
            "先|xiān/写|xiě/队名|duì míng/再|zài/比赛|bǐ sài",
            "Write the team name, then compete",
            "You receive a league badge and enter the arena.",
            true
          ],
          [
            "先|xiān/比赛|bǐ sài/再|zài/写|xiě/队名|duì míng",
            "Compete, then write the team name",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "不写|bù xiě/队名|duì míng/就|jiù/比赛|bǐ sài",
            "Compete without writing the team name",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Spark Shield",
        "🛡️",
        "A wind creature prepares a strong attack. Thunder Fox can use its new skill, but timing matters.",
        "对手|duì shǒu/的|de/攻击|gōng jī/很|hěn/强|qiáng/。|/先|xiān/不能|bù néng/受伤|shòu shāng/。|",
        "The opponent's attack is strong. First, don't get hurt.",
        [
          [
            "先|xiān/用|yòng/盾牌|dùn pái/再|zài/进攻|jìn gōng",
            "Use the shield, then attack",
            "Spark Shield holds, and Thunder Fox wins the round.",
            true
          ],
          [
            "先|xiān/进攻|jìn gōng/再|zài/用|yòng/盾牌|dùn pái",
            "Attack, then use the shield",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "不用|bú yòng/盾牌|dùn pái/就|jiù/进攻|jìn gōng",
            "Attack without the shield",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The final challenger",
        "🐉",
        "A baby dragon's wings are tangled in a ribbon. The referee pauses the match. It looks embarrassed.",
        "小龙|xiǎo lóng/的|de/翅膀|chì bǎng/不能|bù néng/动|dòng/。|",
        "The little dragon's wings can't move.",
        [
          [
            "先|xiān/解开|jiě kāi/再|zài/比赛|bǐ sài",
            "Untie it, then compete",
            "You free its wings and have a fair final match.",
            true
          ],
          [
            "先|xiān/比赛|bǐ sài/再|zài/解开|jiě kāi",
            "Compete, then untie it",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "不|bù/解开|jiě kāi/就|jiù/比赛|bǐ sài",
            "Compete without untying it",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Friendship champions",
        "🏆",
        "Both teams shake paws after the match. Moss Turtle has fallen asleep inside the trophy. The referee invites everyone to celebrate.",
        "比赛|bǐ sài/结束|jié shù/了|le/。|/朋友|péng you/都|dōu/在|zài/等|děng/你|nǐ/。|",
        "The match is over. Your friends are waiting for you.",
        [
          [
            "留下|liú xià/和|hé/大家|dà jiā/庆祝|qìng zhù",
            "Stay and celebrate with everyone",
            "Thunder Fox evolves into radiant Storm Fox!",
            true
          ],
          [
            "让|ràng/大家|dà jiā/走|zǒu/，|/自己|zì jǐ/庆祝|qìng zhù",
            "Send everyone away and celebrate alone",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "自己|zì jǐ/回家|huí jiā",
            "Go home alone",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ]
    ]
  },
  {
    "id": "soccer",
    "title": "Road to Glory",
    "zh": "足球冠军之路",
    "icon": "⚽",
    "color": "#287451",
    "subtitle": "The Mountain Youth League",
    "reward": "Teamwork Cup",
    "trophy": "🏆",
    "scenes": [
      [
        "The kickoff",
        "🏟️",
        "You're playing left back in the cup final. Your teammate rushes forward. The coach calls:",
        "另一个|lìng yí ge/后卫|hòu wèi/在|zài/前面|qián miàn/。|/后面|hòu miàn/没人|méi rén/。|",
        "The other defender is up front. Nobody is behind.",
        [
          [
            "留在|liú zài/后面|hòu miàn",
            "Stay back",
            "You intercept a counterattack. Your team cheers!",
            true
          ],
          [
            "跟着|gēn zhe/他|tā/去|qù/前面|qián miàn",
            "Follow him forward",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "离开|lí kāi/球场|qiú chǎng",
            "Leave the field",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The pressing opponent",
        "⚽",
        "You win the ball. A striker blocks your path. Your coach spots an open teammate.",
        "前面|qián miàn/和|hé/左边|zuǒ biān/有|yǒu/对手|duì shǒu/。|/右边|yòu biān/有|yǒu/队友|duì yǒu/。|",
        "Opponents are in front and left. A teammate is on the right.",
        [
          [
            "不|bù/向前|xiàng qián/带球|dài qiú/，|/向右|xiàng yòu/传球|chuán qiú",
            "Don't dribble forward; pass right",
            "Your pass breaks the press!",
            true
          ],
          [
            "不|bù/向右|xiàng yòu/传球|chuán qiú/，|/向前|xiàng qián/带球|dài qiú",
            "Don't pass right; dribble forward",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "向左|xiàng zuǒ/传球|chuán qiú/再|zài/向前|xiàng qián/跑|pǎo",
            "Pass left then run forward",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Help your teammate",
        "🛡️",
        "Your teammate is defending a fast winger. A striker is running toward your goal.",
        "队友|duì yǒu/在|zài/边上|biān shàng/。|/对手|duì shǒu/向|xiàng/球门|qiú mén/跑|pǎo/。|",
        "Your teammate is on the wing. An opponent is running toward goal.",
        [
          [
            "先|xiān/回到|huí dào/中间|zhōng jiān/再|zài/帮|bāng/队友|duì yǒu",
            "Recover to the middle, then support your teammate",
            "You cover the striker and support your teammate.",
            true
          ],
          [
            "先|xiān/去|qù/边上|biān shàng/再|zài/回到|huí dào/中间|zhōng jiān",
            "Go to the wing first, then recover centrally",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "和|hé/队友|duì yǒu/都|dōu/留在|liú zài/边上|biān shàng",
            "Both stay on the wing",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The winning move",
        "🥅",
        "It is 1–1. A defender blocks your shot. A teammate is open. The coach has a plan.",
        "你|nǐ/前面|qián miàn/有人|yǒu rén/。|/队友|duì yǒu/前面|qián miàn/没人|méi rén/。|",
        "Someone is in front of you. No one is in front of your teammate.",
        [
          [
            "让|ràng/队友|duì yǒu/射门|shè mén",
            "Let your teammate shoot",
            "Your teammate scores! You win the Teamwork Cup.",
            true
          ],
          [
            "自己|zì jǐ/射门|shè mén",
            "Shoot yourself",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "把球|bǎ qiú/踢出|tī chū/球场|qiú chǎng",
            "Kick the ball out",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A new league",
        "✉️",
        "Your team is invited to the Mountain Youth League. The mascot packs twelve bananas and no shoes. At practice, the coach calls:",
        "比赛|bǐ sài/还|hái/没|méi/开始|kāi shǐ/。|/身体|shēn tǐ/还|hái/没|méi/准备好|zhǔn bèi hǎo/。|",
        "The match hasn't started. Your body isn't ready yet.",
        [
          [
            "先|xiān/热身|rè shēn/再|zài/踢球|tī qiú",
            "Warm up, then play",
            "You lead the warm-up and earn the captain's trust.",
            true
          ],
          [
            "先|xiān/踢球|tī qiú/再|zài/热身|rè shēn",
            "Play, then warm up",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "不|bù/热身|rè shēn/就|jiù/踢球|tī qiú",
            "Play without warming up",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Fast winger",
        "🏃",
        "A fast winger runs at you. You are the left back, with your goal behind you. The coach calls from the sideline.",
        "对手|duì shǒu/跑|pǎo/得|de/快|kuài/。|/你|nǐ/身后|shēn hòu/是|shì/球门|qiú mén/。|",
        "The opponent is fast. The goal is behind you.",
        [
          [
            "慢慢|màn màn/后退|hòu tuì/，|/等|děng/机会|jī huì",
            "Back off carefully and wait for a chance",
            "You stay balanced and delay the winger.",
            true
          ],
          [
            "马上|mǎ shàng/冲|chōng/上去|shàng qu/抢球|qiǎng qiú",
            "Rush in to tackle immediately",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "转身|zhuǎn shēn/跑开|pǎo kāi",
            "Turn and run away",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Keeper's pass",
        "🧤",
        "Your keeper has the ball. An opponent is marking you closely. The keeper looks your way.",
        "对手|duì shǒu/离|lí/你|nǐ/很|hěn/近|jìn/。|",
        "The opponent is very close to you.",
        [
          [
            "离开|lí kāi/对手|duì shǒu/去|qù/空地|kòng dì",
            "Move away from the opponent into space",
            "The keeper passes safely to you; you break the press.",
            true
          ],
          [
            "向|xiàng/对手|duì shǒu/靠近|kào jìn",
            "Move closer to the opponent",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "站在|zhàn zài/对手|duì shǒu/旁边|páng biān/不动|bú dòng",
            "Stay beside the opponent",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "A teammate's mistake",
        "🤝",
        "A teammate misses your pass and looks upset. Your coach explains what a captain does.",
        "队友|duì yǒu/没|méi/接住|jiē zhù/球|qiú/。|/他|tā/很|hěn/难过|nán guò/。|",
        "Your teammate missed the ball and feels sad.",
        [
          [
            "说|shuō/没关系|méi guān xi/，|/再|zài/试一次|shì yí cì",
            "Say it's okay, try again",
            "He smiles and plays a great pass. You earn the captain's armband.",
            true
          ],
          [
            "说|shuō/都|dōu/是|shì/你的|nǐ de/错|cuò",
            "Say it's all your fault",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "不|bù/再|zài/传球|chuán qiú/给|gěi/他|tā",
            "Stop passing to him",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Corner kick",
        "🚩",
        "In the semifinal, the opponent takes a corner. Your coach points toward your penalty area.",
        "高个子|gāo gè zi/对手|duì shǒu/在|zài/球门|qiú mén/前|qián/等|děng/球|qiú/。|",
        "The tall opponent is waiting for the ball in front of goal.",
        [
          [
            "留在|liú zài/中间|zhōng jiān/看住|kān zhù/他|tā",
            "Stay central and mark him",
            "You intercept the cross and start a counterattack.",
            true
          ],
          [
            "跑去|pǎo qù/角旗|jiǎo qí/不|bù/看|kàn/他|tā",
            "Run to the corner flag and ignore him",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "只|zhǐ/看|kàn/球|qiú/不|bù/看|kàn/人|rén",
            "Watch only the ball, not players",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "Rain game",
        "🌧️",
        "The final begins in heavy rain. You receive the ball and hear the coach shout.",
        "地上|dì shàng/很|hěn/滑|huá/。|/近处|jìn chù/的|de/队友|duì yǒu/没人|méi rén/防守|fáng shǒu/。|",
        "The ground is slippery; the nearby teammate is unmarked.",
        [
          [
            "传给|chuán gěi/近处|jìn chù/队友|duì yǒu",
            "Pass to the nearby teammate",
            "Your teammate receives the ball cleanly and starts an attack.",
            true
          ],
          [
            "传给|chuán gěi/远处|yuǎn chù/队友|duì yǒu",
            "Pass to the distant teammate",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "自己|zì jǐ/带球|dài qiú/去|qù/远处|yuǎn chù",
            "Dribble to the far side",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "One last recovery",
        "⏱️",
        "The score is tied. Your team loses the ball and a striker sprints toward your goal. You are the nearest defender.",
        "我们|wǒ men/丢球|diū qiú/了|le/。|/对手|duì shǒu/向|xiàng/球门|qiú mén/跑|pǎo/。|",
        "We lost the ball. The opponent is running toward goal.",
        [
          [
            "跑回|pǎo huí/自己|zì jǐ/的|de/球门|qiú mén/前|qián",
            "Run back in front of our goal",
            "You cut off the passing lane and win possession.",
            true
          ],
          [
            "跑向|pǎo xiàng/对方|duì fāng/的|de/球门|qiú mén",
            "Run toward the opponent's goal",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "停下来|tíng xià lái/看|kàn/比赛|bǐ sài",
            "Stop and watch the match",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      [
        "The captain's pass",
        "🥅",
        "Two opponents close you down in the last minute. A teammate runs into open space. The crowd goes quiet.",
        "两个人|liǎng ge rén/挡住|dǎng zhù/你|nǐ/。|/队友|duì yǒu/前面|qián miàn/没人|méi rén/。|",
        "Two people block you. No one is in front of your teammate.",
        [
          [
            "传给|chuán gěi/队友|duì yǒu/让|ràng/他|tā/射门|shè mén",
            "Pass so your teammate can shoot",
            "GOAL! Your team wins the league. The mascot finally finds its shoes.",
            true
          ],
          [
            "不给|bù gěi/队友|duì yǒu/球|qiú/，|/自己|zì jǐ/射门|shè mén",
            "Don't pass; shoot yourself",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "等|děng/对手|duì shǒu/过来|guò lai/再|zài/传球|chuán qiú",
            "Wait for opponents to arrive, then pass",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ]
    ]
  }
];

export const normalClues = {
  "dragon": [
    [
      "龙蛋|lóng dàn/想|xiǎng/吃|chī/水果|shuǐ guǒ/，|/它|tā/不|bù/喝水|hē shuǐ/，|/也|yě/不|bù/吃鱼|chī yú/。|",
      "The egg wants fruit. It doesn't want water or fish."
    ],
    [
      "桥|qiáo/只有|zhǐ yǒu/左边|zuǒ biān/和|hé/右边|yòu biān/两条|liǎng tiáo/路|lù/。|/右边|yòu biān/和|hé/水里|shuǐ lǐ/都|dōu/没有|méi yǒu/钥匙|yào shi/。|",
      "The bridge has a left and a right path. The key is neither on the right nor in the water."
    ],
    [
      "我们|wǒ men/只|zhǐ/能|néng/开|kāi/一扇|yí shàn/门|mén/。|/红门|hóng mén/后面|hòu miàn/很|hěn/危险|wēi xiǎn/，|/蓝门|lán mén/后面|hòu miàn/可以|kě yǐ/安全|ān quán/通过|tōng guò/。|",
      "We can open only one door. The red one is dangerous; the blue one is safe."
    ],
    [
      "小龙|xiǎo lóng/说|shuō/：|/我|wǒ/还|hái/没|méi/喝水|hē shuǐ/，|/等|děng/我|wǒ/喝完|hē wán/，|/你们|nǐ men/才能|cái néng/拿|ná/龙蛋|lóng dàn/。|",
      "The dragon says it hasn't drunk yet; only when it finishes can you take the egg."
    ],
    [
      "大路|dà lù/的|de/守卫|shǒu wèi/不让|bú ràng/我们|wǒ men/过去|guò qu/，|/旁边|páng biān/还有|hái yǒu/一条|yì tiáo/没人|méi rén/看守|kān shǒu/的|de/小路|xiǎo lù/。|",
      "Guards won't let us pass on the main road. There is an unguarded small path beside it."
    ],
    [
      "她|tā/刚|gāng/从|cóng/雪山|xuě shān/回来|huí lai/，|/手|shǒu/都|dōu/冻|dòng/了|le/。|/她|tā/需要|xū yào/喝|hē/点|diǎn/能|néng/让|ràng/身体|shēn tǐ/变暖|biàn nuǎn/的|de/东西|dōng xi/。|",
      "She just returned from snowy mountains; her hands are frozen. She needs a drink that warms her body."
    ],
    [
      "三个|sān ge/洞口|dòng kǒu/中|zhōng/，|/左边|zuǒ biān/和|hé/右边|yòu biān/都|dōu/被|bèi/石头|shí tou/堵住|dǔ zhù/了|le/，|/只有|zhǐ yǒu/一个|yí ge/能|néng/过去|guò qu/。|",
      "Of the three tunnels, the left and right are blocked by rocks. Only one is passable."
    ],
    [
      "小龙|xiǎo lóng/被|bèi/关|guān/在|zài/瓶子|píng zi/里|lǐ/，|/瓶子|píng zi/没有|méi yǒu/坏|huài/，|/只|zhǐ/需要|xū yào/让|ràng/它|tā/出来|chū lai/。|",
      "The little dragon is trapped in an intact jar; it just needs to get out."
    ],
    [
      "桌上|zhuō shàng/只有|zhǐ yǒu/红书|hóng shū/和|hé/蓝书|lán shū/。|/地图|dì tú/不在|bú zài/红书|hóng shū/里|lǐ/，|/也|yě/不在|bú zài/桌下|zhuō xià/。|",
      "There are only a red and blue book on the table. The map isn't in the red book or under the table."
    ],
    [
      "两盏|liǎng zhǎn/灯|dēng/中|zhōng/，|/右边|yòu biān/的|de/没有|méi yǒu/油|yóu/，|/左边|zuǒ biān/的|de/还有|hái yǒu/油|yóu/，|/我们|wǒ men/需要|xū yào/光|guāng/。|",
      "Of the two lamps, the right has no oil and the left still has oil. We need light."
    ],
    [
      "小鸟|xiǎo niǎo/拿|ná/灯|dēng/不是|bú shì/为了|wèi le/卖钱|mài qián/，|/是|shì/因为|yīn wèi/晚上|wǎn shang/看不见|kàn bu jiàn/自己|zì jǐ/的|de/家|jiā/。|",
      "It didn't take the lantern to sell it; at night it cannot see its home."
    ],
    [
      "只有|zhǐ yǒu/塔顶|tǎ dǐng/的|de/灯|dēng/能|néng/让|ràng/月亮|yuè liang/变亮|biàn liàng/。|/桌上|zhuō shàng/的|de/灯|dēng/只能|zhǐ néng/照亮|zhào liàng/蛋糕|dàn gāo/。|",
      "Only the lamp at the tower top can brighten the moon. A lamp on the table only lights the cake."
    ]
  ],
  "mystery": [
    [
      "门|mén/后面|hòu miàn/和|hé/桌子|zhuō zi/上面|shàng miàn/都|dōu/很|hěn/安静|ān jìng/，|/只有|zhǐ yǒu/桌下|zhuō xià/传来|chuán lái/吃东西|chī dōng xi/的|de/声音|shēng yīn/。|",
      "Behind the door and on the table are quiet; chewing sounds come only from beneath the table."
    ],
    [
      "怪兽|guài shòu/吃|chī/的|de/袜子|wà zi/越多|yuè duō/，|/身体|shēn tǐ/越大|yuè dà/，|/可是|kě shì/一|yí/看到|kàn dào/水|shuǐ/就|jiù/会|huì/逃跑|táo pǎo/。|",
      "The more socks it eats, the bigger it gets. But it runs away as soon as it sees water."
    ],
    [
      "两个|liǎng ge/柜子|guì zi/里|lǐ/，|/大|dà/的|de/只有|zhǐ yǒu/球|qiú/，|/小|xiǎo/的|de/传来|chuán lái/吃东西|chī dōng xi/的|de/声音|shēng yīn/。|",
      "Of the two lockers, the big one contains balls; chewing comes from the small one."
    ],
    [
      "大家|dà jiā/的|de/午饭|wǔ fàn/都|dōu/被|bèi/拿走|ná zǒu/了|le/。|/如果|rú guǒ/怪兽|guài shòu/想|xiǎng/吃|chī/苹果|píng guǒ/，|/它|tā/必须|bì xū/先|xiān/把|bǎ/东西|dōng xi/还给|huán gěi/大家|dà jiā/。|",
      "Everyone's lunches were taken. If the monster wants an apple, it must first return everyone's things."
    ],
    [
      "操场|cāo chǎng/和|hé/教室|jiào shì/没有|méi yǒu/新|xīn/脚印|jiǎo yìn/，|/只有|zhǐ yǒu/做饭|zuò fàn/的|de/地方|dì fang/有|yǒu/奇怪|qí guài/的|de/脚印|jiǎo yìn/。|",
      "There are no new footprints in the playground or classroom. Only the place where food is cooked has strange tracks."
    ],
    [
      "冰箱|bīng xiāng/不想|bù xiǎng/喝|hē/果汁|guǒ zhī/，|/它|tā/想|xiǎng/喝|hē/一种|yì zhǒng/白色|bái sè/的|de/饮料|yǐn liào/，|/是|shì/牛|niú/给|gěi/我们|wǒ men/的|de/。|",
      "The fridge doesn't want juice; it wants a white drink that cows give us."
    ],
    [
      "脚印|jiǎo yìn/有|yǒu/三条|sān tiáo/边|biān/和|hé/三个|sān ge/角|jiǎo/，|/我们|wǒ men/需要|xū yào/找|zhǎo/一样|yí yàng/的|de/形状|xíng zhuàng/。|",
      "The footprint has three sides and three corners; find the same shape."
    ],
    [
      "它|tā/闻|wén/了|le/胡椒|hú jiāo/就|jiù/一直|yì zhí/打喷嚏|dǎ pēn tì/，|/现在|xiàn zài/要|yào/用|yòng/干净|gān jìng/的|de/东西|dōng xi/擦|cā/鼻子|bí zi/。|",
      "After smelling pepper it keeps sneezing; now it needs something clean to wipe its nose."
    ],
    [
      "门后|mén hòu/是|shì/扫把|sào bǎ/，|/桌下|zhuō xià/只有|zhǐ yǒu/蜘蛛|zhī zhū/。|/铃|líng/在|zài/放|fàng/盘子|pán zi/的|de/地方|dì fang/。|",
      "A broom is behind the door, only a spider is underneath. The bell is where the plates are kept."
    ],
    [
      "我|wǒ/不想|bù xiǎng/再|zài/每天|měi tiān/发出|fā chū/同样|tóng yàng/的|de/铃声|líng shēng/，|/我|wǒ/希望|xī wàng/大家|dà jiā/听到|tīng dào/我|wǒ/自己|zì jǐ/写|xiě/的|de/歌|gē/。|",
      "I don't want the same bell sound every day; I hope everyone hears the song I wrote."
    ],
    [
      "校长|xiào zhǎng/来|lái/以前|yǐ qián/，|/桌面|zhuō miàn/必须|bì xū/干净|gān jìng/，|/可是|kě shì/现在|xiàn zài/还有|hái yǒu/很多|hěn duō/垃圾|lā jī/。|",
      "Before the principal arrives, the tabletop must be clean, but there is still lots of trash."
    ],
    [
      "表演|biǎo yǎn/结束|jié shù/以后|yǐ hòu/，|/大家|dà jiā/想|xiǎng/用|yòng/两只|liǎng zhī/手|shǒu/发出|fā chū/声音|shēng yīn/来|lái/表示|biǎo shì/喜欢|xǐ huan/。|",
      "After the performance, everyone wants to make a sound with both hands to show appreciation."
    ]
  ],
  "creatures": [
    [
      "会|huì/发|fā/闪电|shǎn diàn/的|de/动物|dòng wù/不是|bú shì/鸟|niǎo/，|/它|tā/有|yǒu/四条腿|sì tiáo tuǐ/，|/尾巴|wěi ba/是|shì/金色|jīn sè/的|de/。|",
      "The lightning creature isn't a bird; it has four legs and a golden tail."
    ],
    [
      "对手|duì shǒu/碰到|pèng dào/水|shuǐ/会|huì/变强|biàn qiáng/，|/碰到|pèng dào/闪电|shǎn diàn/却|què/会|huì/变弱|biàn ruò/。|",
      "The opponent gets stronger with water but weaker with lightning."
    ],
    [
      "它|tā/刚|gāng/打完|dǎ wán/比赛|bǐ sài/，|/现在|xiàn zài/很|hěn/累|lèi/，|/再|zài/跑|pǎo/就|jiù/会|huì/更累|gèng lèi/。|",
      "It just finished a match, is very tired, and running again will make it more tired."
    ],
    [
      "如果|rú guǒ/小鸟|xiǎo niǎo/还|hái/站在|zhàn zài/门边|mén biān/，|/打开|dǎ kāi/门|mén/就|jiù/可能|kě néng/伤到|shāng dào/它|tā/。|/要|yào/等|děng/它|tā/安全|ān quán/。|",
      "Opening the gate could hurt the bird if it is still beside it. Wait until it is safe."
    ],
    [
      "水晶|shuǐ jīng/所在|suǒ zài/的|de/地方|dì fang/比|bǐ/村子|cūn zi/高|gāo/很多|hěn duō/，|/有|yǒu/石头|shí tou/和|hé/雪|xuě/，|/没有|méi yǒu/沙滩|shā tān/。|",
      "The crystal is much higher than the village, with rocks and snow but no beach."
    ],
    [
      "乌龟|wū guī/只|zhǐ/吃|chī/从|cóng/地里|dì lǐ/长|zhǎng/出来|chū lai/的|de/绿色|lǜ sè/食物|shí wù/，|/不|bù/吃|chī/动物|dòng wù/的|de/肉|ròu/。|",
      "The turtle only eats green food grown in the ground, not animal meat."
    ],
    [
      "石头|shí tou/怪|guài/遇到|yù dào/火|huǒ/不会|bú huì/受伤|shòu shāng/，|/反而|fǎn ér/很|hěn/舒服|shū fu/，|/可是|kě shì/遇到|yù dào/水|shuǐ/就|jiù/会|huì/失去|shī qù/力量|lì liàng/。|",
      "Fire doesn't hurt the rock creature; it feels comfortable. Water makes it lose strength."
    ],
    [
      "要|yào/找|zhǎo/的|de/水晶|shuǐ jīng/不是|bú shì/天空|tiān kōng/的|de/颜色|yán sè/，|/也|yě/不是|bú shì/火|huǒ/的|de/颜色|yán sè/，|/而是|ér shì/春天|chūn tiān/树叶|shù yè/的|de/颜色|yán sè/。|",
      "The crystal isn't the color of the sky or fire, but spring leaves."
    ],
    [
      "只有|zhǐ yǒu/名单|míng dān/上|shàng/有|yǒu/名字|míng zi/的|de/队伍|duì wu/才能|cái néng/进入|jìn rù/赛场|sài chǎng/。|/你的|nǐ de/队名|duì míng/还|hái/没|méi/写上|xiě shàng/。|",
      "Only teams on the list can enter the arena. Your team name isn't written yet."
    ],
    [
      "对手|duì shǒu/已经|yǐ jīng/准备|zhǔn bèi/攻击|gōng jī/，|/如果|rú guǒ/现在|xiàn zài/直接|zhí jiē/进攻|jìn gōng/，|/我们|wǒ men/会|huì/受伤|shòu shāng/。|",
      "The opponent is ready to attack. If we attack directly now, we will get hurt."
    ],
    [
      "小龙|xiǎo lóng/的|de/翅膀|chì bǎng/被|bèi/绑住|bǎng zhù/了|le/，|/如果|rú guǒ/现在|xiàn zài/比赛|bǐ sài/，|/对|duì/它|tā/不|bù/公平|gōng píng/。|",
      "Its wings are tied. Competing now would be unfair to it."
    ],
    [
      "虽然|suī rán/比赛|bǐ sài/已经|yǐ jīng/结束|jié shù/，|/但是|dàn shì/朋友们|péng you men/都|dōu/想|xiǎng/和|hé/你|nǐ/一起|yì qǐ/分享|fēn xiǎng/快乐|kuài lè/。|",
      "Although the match is over, your friends want to share the joy with you."
    ]
  ],
  "soccer": [
    [
      "另一个|lìng yí ge/后卫|hòu wèi/已经|yǐ jīng/向前|xiàng qián/进攻|jìn gōng/，|/如果|rú guǒ/你|nǐ/也|yě/上去|shàng qu/，|/球门|qiú mén/前|qián/就|jiù/没有|méi yǒu/后卫|hòu wèi/。|",
      "The other defender has gone forward. If you go too, no defender will remain in front of goal."
    ],
    [
      "前面|qián miàn/的|de/对手|duì shǒu/挡住|dǎng zhù/了|le/你|nǐ/，|/左边|zuǒ biān/也|yě/有人|yǒu rén/防守|fáng shǒu/，|/只有|zhǐ yǒu/右边|yòu biān/的|de/队友|duì yǒu/是|shì/空着|kòng zhe/的|de/。|",
      "An opponent blocks you in front, left is marked too, and only your right teammate is open."
    ],
    [
      "队友|duì yǒu/正在|zhèng zài/边路|biān lù/防守|fáng shǒu/，|/另一名|lìng yì míng/对手|duì shǒu/却|què/跑向|pǎo xiàng/我们|wǒ men/的|de/球门|qiú mén/，|/中间|zhōng jiān/没有|méi yǒu/人|rén/保护|bǎo hù/。|",
      "Your teammate is defending the wing, but another attacker runs toward our goal and nobody covers the middle."
    ],
    [
      "你|nǐ/的|de/射门|shè mén/路线|lù xiàn/被|bèi/挡住|dǎng zhù/了|le/，|/可是|kě shì/旁边|páng biān/的|de/队友|duì yǒu/可以|kě yǐ/直接|zhí jiē/面对|miàn duì/球门|qiú mén/。|",
      "Your shooting lane is blocked, but the nearby teammate has a clear view of goal."
    ],
    [
      "队员|duì yuán/刚|gāng/到|dào/球场|qiú chǎng/，|/身体|shēn tǐ/还|hái/很|hěn/冷|lěng/，|/直接|zhí jiē/比赛|bǐ sài/容易|róng yì/受伤|shòu shāng/。|",
      "The players just arrived, their bodies are still cold, and playing immediately could lead to injury."
    ],
    [
      "你|nǐ/是|shì/最后|zuì hòu/一个|yí ge/后卫|hòu wèi/，|/对手|duì shǒu/速度|sù dù/快|kuài/，|/太早|tài zǎo/抢球|qiǎng qiú/会|huì/被|bèi/过|guò/。|",
      "You're the last defender; the opponent is fast, and tackling too soon could let them beat you."
    ],
    [
      "守门员|shǒu mén yuán/想|xiǎng/传球|chuán qiú/给|gěi/你|nǐ/，|/但是|dàn shì/对手|duì shǒu/离|lí/你|nǐ/太|tài/近|jìn/，|/没有|méi yǒu/安全|ān quán/的|de/路线|lù xiàn/。|",
      "The keeper wants to pass to you, but the opponent is too close and there is no safe lane."
    ],
    [
      "队友|duì yǒu/失误|shī wù/后|hòu/很|hěn/难过|nán guò/，|/如果|rú guǒ/你|nǐ/对|duì/他|tā/发脾气|fā pí qi/，|/他|tā/可能|kě néng/会|huì/更|gèng/紧张|jǐn zhāng/。|",
      "Your teammate is upset after a mistake. If you lose your temper at him, he may become more nervous."
    ],
    [
      "角球|jiǎo qiú/马上|mǎ shàng/要|yào/踢出|tī chū/，|/对手|duì shǒu/最高|zuì gāo/的|de/球员|qiú yuán/站在|zhàn zài/球门|qiú mén/正前方|zhèng qián fāng/，|/还|hái/没人|méi rén/防守|fáng shǒu/。|",
      "A corner is about to be taken. The tallest opponent is right in front of goal and unmarked."
    ],
    [
      "雨后|yǔ hòu/地上|dì shàng/很|hěn/滑|huá/，|/近处|jìn chù/的|de/队友|duì yǒu/没有|méi yǒu/对手|duì shǒu/，|/远处|yuǎn chù/却|què/有|yǒu/很多|hěn duō/人|rén/。|",
      "After rain the ground is slippery. The nearby teammate is open, while far away is crowded."
    ],
    [
      "我们|wǒ men/刚|gāng/丢球|diū qiú/，|/对手|duì shǒu/正在|zhèng zài/向|xiàng/我们的|wǒ men de/球门|qiú mén/跑|pǎo/，|/守门员|shǒu mén yuán/一个人|yí ge rén/面对|miàn duì/进攻|jìn gōng/。|",
      "We just lost the ball. The opponent runs toward our goal, and our keeper faces the attack alone."
    ],
    [
      "两个|liǎng ge/后卫|hòu wèi/挡住|dǎng zhù/你的|nǐ de/射门|shè mén/路线|lù xiàn/，|/可是|kě shì/队友|duì yǒu/在|zài/空位|kòng wèi/上|shàng/，|/而且|ér qiě/离|lí/球门|qiú mén/很近|hěn jìn/。|",
      "Two defenders block your shot. Your teammate is open and close to goal."
    ]
  ]
};

export const chapterRewards = {
  "dragon": [
    "🥚 Moon Egg",
    "🧭 Cloud Compass",
    "🌙 Moon Guardian"
  ],
  "mystery": [
    "📓 Detective Notebook",
    "🔎 Magnifying Glass",
    "🎤 Master Detective"
  ],
  "creatures": [
    "🦊 Thunder Fox",
    "🐢 Moss Turtle",
    "⚡ Storm Fox"
  ],
  "soccer": [
    "🏆 Teamwork Cup",
    "🎽 Captain's Armband",
    "🥇 Mountain League Champion"
  ]
};

export const storyDialogue = {
  "dragon": [
    "Noodle: “An egg that orders breakfast? Is it going to ask for room service?” Spicy: “Don't give it my menu!”",
    "Noodle: “I can fly across, but my wings are currently on lunch break.”",
    "Noodle: “If there's a dragon behind a door, knock first. If there's a chicken, definitely knock.”",
    "Noodle: “I brought a cup! Unfortunately it is my swimming pool.”",
    "Noodle: “Maybe the guards are allergic to dragons. Or to singing eggs.”",
    "Ice dragon: “My official job title is Frozen. It is not supposed to be my personality.”",
    "Noodle: “Three tunnels, one brain. I hope the brain is yours.”",
    "Cloud dragon: “Please don't put me in the fridge. I'm not leftover soup!”",
    "Librarian: “I once read a whole book upside down. It was a book about bats.”",
    "Shadow dragon: “I'm the guardian of darkness. My electricity bill is surprisingly low.”",
    "Noodle: “Maybe the bird needs a night-light. I need one too, but don't tell the other dragons.”",
    "Queen: “The moon needs its light back.” Noodle: “And the cake needs its mouth back. Mine.”"
  ],
  "mystery": [
    "Pip: “My sandwich has been kidnapped! It didn't even leave a goodbye note.”",
    "Pip: “I found the monster's weakness. Or maybe it's just never done laundry.”",
    "Pip: “A locker eating lunch is bad. A locker eating my homework is an excellent invention.”",
    "Lunch monster: “I was just testing the sandwiches for quality. All thirty-seven of them.”",
    "Pip: “A missing bell means no homework, right?” Principal: “Nice try.”",
    "Fridge: “I'm a refrigerator. Why is my breakfast missing? I have ONE job.”",
    "Pip: “My banana ruler says the footprint is approximately one banana long.”",
    "Monster: “ACHOO!” Pip: “There goes my hat. Again.”",
    "Pip: “The spider asked me for a dinner reservation. I don't think we can afford eight seats.”",
    "Bell: “I have a beautiful singing voice.” Pip: “I have heard you at eight every morning. Prove it.”",
    "Cake monster: “I ate the plates because they're round like cookies.” Pip: “That is not a defense.”",
    "Bell: “Thank you, thank you! My next song is called No More Monday Mornings.”"
  ],
  "creatures": [
    "Bird: “Can I join your team?” Trainer: “Let's read the clue first.”",
    "Thunder Fox: “Can I practice my lightning on a toaster?” Trainer: “Absolutely not.”",
    "Fox: “I am not sleeping. I am practicing very advanced eye-closing.”",
    "Bird: “I would like to be rescued with all my feathers, please.”",
    "Fox: “My tail is out of battery.” Trainer: “Your tail is not a remote control.”",
    "Turtle: “I'm a very fast turtle.” Fox: “How fast?” Turtle: “Lunch first.”",
    "Rock creature: “I am rock solid!” Turtle: “That's your only joke, isn't it?”",
    "Fox: “I hope the crystal isn't spicy.” Turtle: “Please stop eating important quest items.”",
    "Referee: “Next team!” Fox: “Can our team name be The Extremely Handsome Foxes?”",
    "Fox: “Shield? I thought you said sandwich.” Turtle: “Focus!”",
    "Dragon: “I can explain the ribbon.” Fox: “Were you wrapping yourself as a birthday present?”",
    "Turtle: “This trophy is surprisingly comfortable.” Fox: “You cannot live in our award.”"
  ],
  "soccer": [
    "Mascot: “I volunteer!” Coach: “You are a banana in a costume.”",
    "Mascot: “I can see an opening!” Coach: “That's the snack bar.”",
    "Keeper: “Hello? Anybody back here?” Mascot: “I brought oranges!”",
    "Coach: “The ball moves faster than you.” Mascot: “Not faster than me at snack time.”",
    "Mascot: “I stretched my peel.” Coach: “Very impressive. Now watch the team.”",
    "Winger: “Bet you can't catch me!” Coach: “We don't need a race; we need good defending.”",
    "Keeper: “Can you get free?” Mascot: “Free tickets? Where?”",
    "Teammate: “Sorry!” Mascot: “I once dropped an entire bowl of oranges. We all make mistakes.”",
    "Keeper: “That striker is tall.” Mascot: “I'm tall too, if I stand on six oranges.”",
    "Mascot: “I packed a raincoat.” Coach: “For yourself?” Mascot: “For my banana.”",
    "Keeper: “Not another one!” Mascot: “I would help, but my shoes are still missing.”",
    "Coach: “Make the team stronger, not just yourself.” Mascot: “Does that mean we share the oranges?”"
  ]
};

export const readingReasons = {
  "dragon:0": "The egg is hungry, not thirsty, and doesn't eat fish. An apple is food and fruit.",
  "dragon:1": "Not right and not in the water means the remaining place is the left side.",
  "dragon:2": "Both doors are mentioned, but only the blue door is safe.",
  "dragon:3": "以后 and 才 tell you the water must come before the egg.",
  "dragon:4": "The main road is blocked; the unguarded path lets you continue.",
  "dragon:5": "She wants warmth; hot water fits, cold tea and ice water do not.",
  "dragon:6": "也 and 都 say both outer tunnels are blocked. The middle remains.",
  "dragon:7": "The dragon needs a way out, not a tighter lid or a shaking jar.",
  "dragon:8": "The red book has no map, so search the other book.",
  "dragon:9": "Only the left lamp works. Both options mention the same lamps, but the actions differ.",
  "dragon:10": "It needs light at home, not money or more darkness.",
  "dragon:11": "The goal is to restore moonlight, so go to the tower before celebrating.",
  "dragon:4:alt": "One passenger only; the dragon can fly.",
  "dragon:8:alt": "The map is near the moon, not the sun.",
  "mystery:0": "The sound is below the table, so bend down to investigate.",
  "mystery:1": "Water makes it flee; socks make it bigger. The order of the two objects matters.",
  "mystery:2": "The sound is the clue to the hiding place, so investigate the noisy door.",
  "mystery:3": "The condition must be met before the reward.",
  "mystery:4": "Follow the tracks, not the places without them.",
  "mystery:5": "Milk is the white drink; socks aren't a drink.",
  "mystery:6": "Three corners form a triangle.",
  "mystery:7": "A tissue helps its nose; pepper makes sneezing worse.",
  "mystery:8": "The plates and bell are together; the other two places have different objects.",
  "mystery:9": "It wants an audience for its own song, not its usual bell duty.",
  "mystery:10": "The tables need to be clean before the principal arrives.",
  "mystery:11": "Clapping uses both hands to show appreciation.",
  "mystery:4:alt": "A capped container for drinking is a water bottle.",
  "mystery:8:alt": "A cat meows and catches mice.",
  "creatures:0": "Both color and animal shape matter: a yellow four-legged creature.",
  "creatures:1": "Water helps the opponent; lightning weakens it.",
  "creatures:2": "It needs recovery rather than more exercise.",
  "creatures:3": "Safety must come first, before opening the gate.",
  "creatures:4": "High ground, rocks and no sea point to the mountain.",
  "creatures:5": "Leafy vegetables fit its diet; meat and rocks do not.",
  "creatures:6": "Water is the weakness, while fire helps.",
  "creatures:7": "Spring leaves are green, not sky-blue or fire-red.",
  "creatures:8": "Registration is required before the match.",
  "creatures:9": "Protect first so the attack doesn't hurt you.",
  "creatures:10": "Free the dragon before a fair match.",
  "creatures:11": "They want to share the celebration together.",
  "creatures:4:alt": "Wait safely until the boat arrives.",
  "creatures:8:alt": "The sound came from below, so bend down.",
  "soccer:0": "One defender must stay back to cover the goal.",
  "soccer:1": "The free teammate is on the right, not in the blocked directions.",
  "soccer:2": "Cover the central danger first; your teammate is already on the wing.",
  "soccer:3": "The teammate has the clear chance, so pass for their shot.",
  "soccer:4": "Prepare your body before playing.",
  "soccer:5": "Delay the fast attacker, stay between them and goal, and wait for a tackle opportunity.",
  "soccer:6": "Create a passing lane by moving away from your marker.",
  "soccer:7": "Encouragement helps him recover confidence.",
  "soccer:8": "The tall unmarked player in front of goal is the danger.",
  "soccer:9": "A short pass to the open player is safer on slippery ground.",
  "soccer:10": "Our goal is threatened, so recover toward it.",
  "soccer:11": "The teammate has a better chance than you; pass now.",
  "soccer:4:alt": "He already has a ball but needs proper shoes.",
  "soccer:8:alt": "Cover the unseen runner behind your teammate."
};
