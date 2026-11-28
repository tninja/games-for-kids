import type {Scene} from "./content.js";
export interface Fork { paths: {title:string;label:string}[]; alternate: Scene; normal: [string,string]; dialogue: string; follow: string[] }
export const forks: Record<string, Record<number, Fork>> = {
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
        "船|chuán/只能|zhǐ néng/坐|zuò/一个人|yí ge rén/。|",
        "The boat can hold only one person.",
        [
          [
            "我|wǒ/坐船|zuò chuán/，|/小龙|xiǎo lóng/飞|fēi",
            "I ride; the dragon flies",
            "Noodle flies alongside and the merchant points you toward the ice dragon.",
            true
          ],
          [
            "我|wǒ/和|hé/小龙|xiǎo lóng/一起|yì qǐ/坐船|zuò chuán",
            "The dragon and I ride together",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "我|wǒ/和|hé/小龙|xiǎo lóng/都|dōu/不|bù/过河|guò hé",
            "Neither of us crosses",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "如果|rú guǒ/两个人|liǎng ge rén/同时|tóng shí/坐船|zuò chuán/，|/船|chuán/就|jiù/会|huì/沉|chén/下去|xià qu/。|/小龙|xiǎo lóng/可以|kě yǐ/飞|fēi/过去|guò qu/。|",
        "If two people ride at once, the boat will sink. The dragon can fly across."
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
        "太阳|tài yáng/旁边|páng biān/没有|méi yǒu/线索|xiàn suǒ/。|/月亮|yuè liang/旁边|páng biān/有|yǒu/。|",
        "There is no clue beside the sun. There is one beside the moon.",
        [
          [
            "找|zhǎo/月亮|yuè liang/边上|biān shàng/的|de/星星|xīng xing",
            "Find the star by the moon",
            "A constellation reveals the secret tower path.",
            true
          ],
          [
            "找|zhǎo/太阳|tài yáng/边上|biān shàng/的|de/星星|xīng xing",
            "Find the star by the sun",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "看|kàn/地上|dì shàng",
            "Look on the ground",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "地图|dì tú/藏在|cáng zài/一颗|yì kē/星星|xīng xing/里|lǐ/，|/它|tā/离|lí/太阳|tài yáng/很远|hěn yuǎn/，|/就在|jiù zài/月亮|yuè liang/旁边|páng biān/。|",
        "The map is in a star far from the sun, right beside the moon."
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
        "它|tā/有|yǒu/盖子|gài zi/，|/可以|kě yǐ/装水|zhuāng shuǐ/。|",
        "It has a cap and can hold water.",
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
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "书包|shū bāo",
            "Backpack",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "这个|zhè ge/东西|dōng xi/不是|bú shì/用来|yòng lái/装书|zhuāng shū/的|de/，|/也|yě/不能|bù néng/踢|tī/，|/打开|dǎ kāi/盖子|gài zi/就|jiù/可以|kě yǐ/喝水|hē shuǐ/。|",
        "This object doesn't hold books and isn't for kicking. Open its cap to drink."
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
        "它|tā/有|yǒu/四条腿|sì tiáo tuǐ/，|/会|huì/喵喵|miāo miāo/叫|jiào/。|",
        "It has four legs and meows.",
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
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "蝴蝶|hú dié/的|de/衣服|yī fu",
            "Butterfly costume",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "铃|líng/藏在|cáng zài/一种|yì zhǒng/动物|dòng wù/的|de/衣服|yī fu/里|lǐ/，|/这种|zhè zhǒng/动物|dòng wù/没有|méi yǒu/翅膀|chì bǎng/，|/喜欢|xǐ huan/抓|zhuā/老鼠|lǎo shǔ/。|",
        "The bell hides in a costume of an animal with no wings that likes catching mice."
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
        "船|chuán/还|hái/在|zài/对面|duì miàn/。|/水|shuǐ/很深|hěn shēn/。|",
        "The boat is still across the river. The water is deep.",
        [
          [
            "在|zài/岸上|àn shàng/等|děng",
            "Wait on the bank",
            "The ferry arrives and introduces you to Moss Turtle.",
            true
          ],
          [
            "自己|zì jǐ/跳进|tiào jìn/水里|shuǐ lǐ",
            "Jump into the water",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "回|huí/商店|shāng diàn",
            "Return to the shop",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "河水|hé shuǐ/太深|tài shēn/，|/我们|wǒ men/不能|bù néng/自己|zì jǐ/下水|xià shuǐ/，|/船|chuán/还|hái/没有|méi yǒu/到|dào/这边|zhè biān/。|",
        "The water is too deep to enter; the boat hasn't reached this side."
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
        "桌上|zhuō shàng/没有|méi yǒu/哨子|shào zi/。|/椅子|yǐ zi/下面|xià miàn/有|yǒu/声音|shēng yīn/。|",
        "There is no whistle on the table. There's a sound under the chair.",
        [
          [
            "弯腰|wān yāo/看看|kàn kan",
            "Bend down and look",
            "You find the whistle. She signs you up and starts the first match.",
            true
          ],
          [
            "再|zài/找|zhǎo/桌上|zhuō shàng",
            "Search the tabletop again",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "抬头|tái tóu/看|kàn/天上|tiān shàng",
            "Look up at the sky",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "裁判|cái pàn/在|zài/桌上|zhuō shàng/找|zhǎo/了|le/很久|hěn jiǔ/，|/没有|méi yǒu/找到|zhǎo dào/。|/她|tā/弯腰|wān yāo/时|shí/听到|tīng dào/椅子|yǐ zi/下面|xià miàn/有|yǒu/声音|shēng yīn/。|",
        "The referee searched the tabletop for a long time without finding it. Bending down, she heard a sound under the chair."
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
        "队友|duì yǒu/穿着|chuān zhe/拖鞋|tuō xié/，|/不能|bù néng/上场|shàng chǎng/。|",
        "Your teammate wears slippers and can't play.",
        [
          [
            "借给|jiè gěi/他|tā/球鞋|qiú xié",
            "Lend him soccer shoes",
            "He is ready to warm up, and your team starts the match together.",
            true
          ],
          [
            "借给|jiè gěi/他|tā/拖鞋|tuō xié",
            "Lend him slippers",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "借给|jiè gěi/他|tā/足球|zú qiú",
            "Lend him a soccer ball",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "队友|duì yǒu/带了|dài le/足球|zú qiú/，|/但|dàn/脚上|jiǎo shàng/穿|chuān/的|de/是|shì/拖鞋|tuō xié/，|/裁判|cái pàn/不让|bú ràng/他|tā/上场|shàng chǎng/。|",
        "The teammate brought a ball, but wears slippers; the referee won't let him play."
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
        "队友|duì yǒu/只|zhǐ/看|kàn/球|qiú/。|/对手|duì shǒu/跑到|pǎo dào/他|tā/身后|shēn hòu/。|",
        "Your teammate only watches the ball. An opponent runs behind him.",
        [
          [
            "去|qù/他|tā/后面|hòu miàn/保护|bǎo hù/球门|qiú mén",
            "Cover behind him to protect goal",
            "You intercept the throw and send your team into the final.",
            true
          ],
          [
            "去|qù/他|tā/前面|qián miàn/看|kàn/球|qiú",
            "Go in front of him to watch the ball",
            "That choice doesn't fit the whole clue. Try comparing the actions or conditions.",
            false
          ],
          [
            "和|hé/他|tā/一起|yì qǐ/只|zhǐ/看球|kàn qiú",
            "Watch only the ball with him",
            "That would not solve the problem. Read the clue again, or listen to it.",
            false
          ]
        ]
      ],
      "normal": [
        "队友|duì yǒu/正在|zhèng zài/看|kàn/界外球|jiè wài qiú/，|/没有|méi yǒu/发现|fā xiàn/对手|duì shǒu/已经|yǐ jīng/从|cóng/他|tā/身后|shēn hòu/跑向|pǎo xiàng/球门|qiú mén/。|",
        "Your teammate watches the throw-in and hasn't noticed an opponent running behind him toward goal."
      ],
      "dialogue": "Mascot: “I can take the throw-in!” Coach: “It's the other team's throw-in.”",
      "follow": [
        "Your corner clearance helps the team reach the rainy final.",
        "Your throw-in interception helps the team reach the rainy final."
      ]
    }
  }
};
