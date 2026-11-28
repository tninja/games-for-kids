export const forks = {
  "dragon": {
    "4": {
      "paths": [
        {
          "title": "Follow the feather",
          "label": "跟着羽毛|gēn zhe yǔ máo"
        },
        {
          "title": "Search the river",
          "label": "去河边|qù hé biān"
        }
      ],
      "alternate": [
        "A trail of silver scales",
        "🌊",
        "A river merchant has seen a feather floating downstream. Noodle wants to borrow his boat, but the merchant has a special rule.",
        "船|chuán/只能|zhǐ néng/坐|zuò/一个|yí ge/人|rén/。|",
        "The boat only holds one person.",
        [
          [
            "一个人|yí ge rén/先|xiān/过河|guò hé",
            "One person crosses first",
            "Noodle flies alongside and the merchant points you toward the ice dragon.",
            true
          ],
          [
            "两个人|liǎng ge rén/一起|yì qǐ/坐船|zuò chuán",
            "Both ride in the boat",
            "The boat wobbles; the merchant waves you back.",
            false
          ],
          [
            "把|bǎ/船|chuán/推走|tuī zǒu",
            "Push the boat away",
            "The merchant catches his boat before it floats away.",
            false
          ]
        ]
      ],
      "normal": [
        "船|chuán/太|tài/小|xiǎo/了|le/，|/如果|rú guǒ/两个人|liǎng ge rén/一起|yì qǐ/上船|shàng chuán/，|/船|chuán/就|jiù/会|huì/沉|chén/下去|xià qù/。|",
        "The boat is too small; if two people get on together it will sink."
      ],
      "dialogue": "Boat merchant: “My boat is very small. No dragons larger than a sandwich!” Noodle: “What size sandwich?”",
      "follow": [
        "The glowing feather led you straight here. Noodle: “My tracking skills are famous among eggs.”",
        "The river merchant's map saved you a long walk. Noodle: “My wings deserve a medal.”"
      ]
    },
    "8": {
      "paths": [
        {
          "title": "Search the library",
          "label": "去图书馆|qù tú shū guǎn"
        },
        {
          "title": "Visit the observatory",
          "label": "去看星星|qù kàn xīng xing"
        }
      ],
      "alternate": [
        "The telescope that sneezes",
        "🔭",
        "A stargazer has a map of the tower, but his telescope is pointed at the wrong part of the sky. Noodle checks a star chart.",
        "星星|xīng xing/在|zài/月亮|yuè liang/旁边|páng biān/。|",
        "The star is next to the moon.",
        [
          [
            "看|kàn/月亮|yuè liang/旁边|páng biān",
            "Look beside the moon",
            "A constellation reveals the secret tower path.",
            true
          ],
          [
            "看|kàn/太阳|tài yáng",
            "Look toward the sun",
            "The stargazer reminds you not to point a telescope at the sun.",
            false
          ],
          [
            "看|kàn/地上|dì shàng",
            "Look at the ground",
            "Noodle finds a pebble shaped like a potato.",
            false
          ]
        ]
      ],
      "normal": [
        "地图|dì tú/在|zài/天上|tiān shàng/最亮|zuì liàng/的|de/星星|xīng xing/里|lǐ/，|/那颗|nà kē/星星|xīng xing/就在|jiù zài/月亮|yuè liang/旁边|páng biān/。|",
        "The map is in the brightest star, right next to the moon."
      ],
      "dialogue": "Stargazer: “It's my new telescope.” Telescope: “ACHOO!” Noodle: “It has hay fever. In space.”",
      "follow": [
        "The paper staircase from the library carries you to the tower.",
        "The constellation map glows in your pocket as the tower appears."
      ]
    }
  },
  "mystery": {
    "4": {
      "paths": [
        {
          "title": "Follow the crumbs",
          "label": "跟着面包屑|gēn zhe miàn bāo xiè"
        },
        {
          "title": "Check the lost-and-found",
          "label": "去失物处|qù shī wù chù"
        }
      ],
      "alternate": [
        "The lost-and-found monster",
        "🧢",
        "The lost-and-found cupboard has grown a face. It saw a bell run toward the kitchen, but it mixes up objects when it speaks.",
        "这个|zhè ge/东西|dōng xi/有|yǒu/帽子|mào zi/，|/没有|méi yǒu/头|tóu/。|",
        "This thing has a hat but no head.",
        [
          [
            "水瓶|shuǐ píng",
            "Water bottle",
            "It returns the bottle to its owner and tells you to interview the fridge.",
            true
          ],
          [
            "足球|zú qiú",
            "Soccer ball",
            "It bounces away; it has no cap.",
            false
          ],
          [
            "书包|shū bāo",
            "Backpack",
            "The cupboard looks inside but finds only homework.",
            false
          ]
        ]
      ],
      "normal": [
        "柜子|guì zi/要|yào/找|zhǎo/一个|yí ge/没有|méi yǒu/头|tóu/却|què/有|yǒu/帽子|mào zi/的|de/东西|dōng xi/，|/它|tā/可以|kě yǐ/装水|zhuāng shuǐ/。|",
        "The cupboard wants something with a cap but no head; it can hold water."
      ],
      "dialogue": "Pip: “Do you have my hat?” Cupboard: “I have six hundred hats and one very confused sock.”",
      "follow": [
        "The crumb trail reaches a very talkative refrigerator.",
        "The lost-and-found cupboard sends you to the fridge. Pip finally has his hat."
      ]
    },
    "8": {
      "paths": [
        {
          "title": "Enter the party",
          "label": "去音乐会|qù yīn yuè huì"
        },
        {
          "title": "Explore backstage",
          "label": "去后台|qù hòu tái"
        }
      ],
      "alternate": [
        "The backstage disguise",
        "🎭",
        "Behind the stage, three costumes hang beside a tiny pair of shoes. The bell is hiding inside one costume.",
        "铃|líng/藏|cáng/在|zài/不会|bú huì/飞|fēi/的|de/动物|dòng wù/里|lǐ/。|",
        "The bell hides in an animal that cannot fly.",
        [
          [
            "猫|māo/的|de/衣服|yī fu",
            "Cat costume",
            "The bell tumbles out, wearing cat ears.",
            true
          ],
          [
            "鸟|niǎo/的|de/衣服|yī fu",
            "Bird costume",
            "A real bird flies out. The bell is elsewhere.",
            false
          ],
          [
            "蝴蝶|hú dié/的|de/衣服|yī fu",
            "Butterfly costume",
            "Pip tries it on. It is much too small.",
            false
          ]
        ]
      ],
      "normal": [
        "这个|zhè ge/动物|dòng wù/有|yǒu/四条|sì tiáo/腿|tuǐ/，|/没有|méi yǒu/翅膀|chì bǎng/，|/还|hái/会|huì/喵喵|miāo miāo/叫|jiào/。|",
        "This animal has four legs, no wings and meows."
      ],
      "dialogue": "Pip: “A bell wearing a costume? That explains why the principal couldn't find it.”",
      "follow": [
        "The little bell waves from the party table.",
        "The bell takes off its cat ears and tells you its secret."
      ]
    }
  },
  "creatures": {
    "4": {
      "paths": [
        {
          "title": "Climb the mountain",
          "label": "去山上|qù shān shàng"
        },
        {
          "title": "Take the river trail",
          "label": "走河边|zǒu hé biān"
        }
      ],
      "alternate": [
        "A creature ferry",
        "🛶",
        "The riverside trail ends at a ferry. A friendly creature is waiting on the far bank. Your fox sees a sign beside the boat.",
        "船|chuán/还|hái/没|méi/来|lái/。|",
        "The boat hasn't arrived yet.",
        [
          [
            "等|děng/船|chuán",
            "Wait for the boat",
            "The ferry arrives and introduces you to Moss Turtle.",
            true
          ],
          [
            "跳进|tiào jìn/水里|shuǐ lǐ",
            "Jump in the water",
            "The ferry keeper stops you before you enter.",
            false
          ],
          [
            "回|huí/商店|shāng diàn",
            "Return to the shop",
            "Your fox points at the approaching ferry.",
            false
          ]
        ]
      ],
      "normal": [
        "河水|hé shuǐ/很|hěn/深|shēn/，|/船|chuán/还|hái/在|zài/对面|duì miàn/，|/我们|wǒ men/不能|bù néng/自己|zì jǐ/下水|xià shuǐ/。|",
        "The river is deep and the boat is still on the other side; we can't enter the water ourselves."
      ],
      "dialogue": "Fox: “I can swim!” Ferry keeper: “You are an electric creature. Please do not test that today.”",
      "follow": [
        "Moss Turtle is waiting beside the mountain path.",
        "Moss Turtle tells you about the crystal as you leave the ferry."
      ]
    },
    "8": {
      "paths": [
        {
          "title": "Register at the desk",
          "label": "去报名|qù bào míng"
        },
        {
          "title": "Help the referee",
          "label": "帮助裁判|bāng zhù cái pàn"
        }
      ],
      "alternate": [
        "The referee's missing whistle",
        "🪈",
        "The referee dropped her whistle while carrying the sign-up sheet. She has checked everywhere except one place.",
        "椅子|yǐ zi/下面|xià miàn/有|yǒu/声音|shēng yīn/。|",
        "There is a sound under the chair.",
        [
          [
            "看|kàn/椅子|yǐ zi/下面|xià miàn",
            "Look under the chair",
            "You find the whistle. She signs you up and starts the first match.",
            true
          ],
          [
            "看|kàn/桌上|zhuō shàng",
            "Look on the table",
            "Only the sign-up sheet is there.",
            false
          ],
          [
            "看|kàn/天上|tiān shàng",
            "Look at the sky",
            "A bird is singing, but it is not a whistle.",
            false
          ]
        ]
      ],
      "normal": [
        "桌上|zhuō shàng/没有|méi yǒu/哨子|shào zi/，|/她|tā/弯腰|wān yāo/时|shí/听到|tīng dào/椅子|yǐ zi/下|xià/有|yǒu/声音|shēng yīn/。|",
        "The whistle is not on the table; when she bent down, she heard a sound under the chair."
      ],
      "dialogue": "Referee: “Without my whistle I must yell PEEEEEEP.” Fox: “Please never do that again.”",
      "follow": [
        "Your new league badge gleams as you enter the arena.",
        "The referee thanks you with an extra-loud whistle. Your team enters the arena."
      ]
    }
  },
  "soccer": {
    "4": {
      "paths": [
        {
          "title": "Lead warm-up",
          "label": "去热身|qù rè shēn"
        },
        {
          "title": "Check the team's equipment",
          "label": "检查装备|jiǎn chá zhuāng bèi"
        }
      ],
      "alternate": [
        "The equipment mix-up",
        "🎒",
        "The mascot has packed the wrong equipment before the new league match. One teammate cannot go onto the field until the problem is fixed.",
        "队友|duì yǒu/没有|méi yǒu/球鞋|qiú xié/。|",
        "Your teammate has no soccer shoes.",
        [
          [
            "借给|jiè gěi/他|tā/球鞋|qiú xié",
            "Lend him soccer shoes",
            "He is ready to warm up, and your team starts the match together.",
            true
          ],
          [
            "给|gěi/他|tā/足球|zú qiú",
            "Give him a soccer ball",
            "He already has a ball but still cannot play.",
            false
          ],
          [
            "借给|jiè gěi/他|tā/拖鞋|tuō xié",
            "Lend him slippers",
            "He laughs and points at his slippers.",
            false
          ]
        ]
      ],
      "normal": [
        "队友|duì yǒu/穿着|chuān zhe/拖鞋|tuō xié/来到|lái dào/球场|qiú chǎng/，|/他|tā/需要|xū yào/换|huàn/一双|yì shuāng/能|néng/踢球|tī qiú/的|de/鞋|xié/。|",
        "Your teammate arrived wearing slippers; he needs shoes suitable for soccer."
      ],
      "dialogue": "Mascot: “Twelve bananas, two pencils, and a frying pan. We're ready!” Coach: “For what?”",
      "follow": [
        "Your team is warmed up and ready to face the fast winger.",
        "Your teammate thanks you for the borrowed shoes before kickoff."
      ]
    },
    "8": {
      "paths": [
        {
          "title": "Defend the corner",
          "label": "防守角球|fáng shǒu jiǎo qiú"
        },
        {
          "title": "Defend a throw-in",
          "label": "防守界外球|fáng shǒu jiè wài qiú"
        }
      ],
      "alternate": [
        "The quick throw-in",
        "⚽",
        "In the semifinal, an opponent prepares a quick throw-in. A runner is sneaking behind your teammate. You have to cover the dangerous space.",
        "对手|duì shǒu/跑到|pǎo dào/队友|duì yǒu/身后|shēn hòu/了|le/。|",
        "The opponent ran behind your teammate.",
        [
          [
            "补防|bǔ fáng/身后|shēn hòu/的|de/空位|kòng wèi",
            "Cover the space behind",
            "You intercept the throw and send your team into the final.",
            true
          ],
          [
            "一起|yì qǐ/看|kàn/球|qiú",
            "Both watch the ball",
            "The runner moves into dangerous space.",
            false
          ],
          [
            "向前|xiàng qián/跑|pǎo",
            "Run forward",
            "The space behind your teammate becomes even bigger.",
            false
          ]
        ]
      ],
      "normal": [
        "队友|duì yǒu/正在|zhèng zài/看|kàn/球|qiú/，|/没有|méi yǒu/看到|kàn dào/身后|shēn hòu/的|de/对手|duì shǒu/正|zhèng/跑向|pǎo xiàng/球门|qiú mén/。|",
        "Your teammate is watching the ball and hasn't seen the opponent running toward goal behind him."
      ],
      "dialogue": "Mascot: “I can take the throw-in!” Coach: “It's the other team's throw-in.”",
      "follow": [
        "Your corner clearance helps the team reach the rainy final.",
        "Your throw-in interception helps the team reach the rainy final."
      ]
    }
  }
};
